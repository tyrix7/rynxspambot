const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

// Cache for guild members to avoid repeated API calls
const memberCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_REFRESH_INTERVAL = 2 * 60 * 1000; // Refresh every 2 minutes

const ALLOWED_GUILD_ID = process.env.ALLOWED_GUILD_ID;
const INVITE_LINK = "https://discord.gg/4BvGRykew3";

/**
 * Check if user is a member of the allowed guild
 * @param {import("discord.js").GuildMember} member
 * @param {import("discord.js").Client} client
 * @returns {Promise<boolean>}
 */
async function isUserInGuild(userId, client) {
  if (!ALLOWED_GUILD_ID) return true; // Allow if no restriction set
  
  const cached = memberCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.isMember;
  }
  
  try {
    const guild = await client.guilds.fetch(ALLOWED_GUILD_ID);
    const member = await guild.members.fetch({ user: userId, force: true }).catch(() => null);
    const isMember = member !== null;
    memberCache.set(userId, { isMember, timestamp: Date.now() });
    return isMember;
  } catch (error) {
    console.error('Error checking guild membership:', error);
    return false;
  }
}

/**
 * Clear expired cache entries
 */
function clearExpiredCache() {
  const now = Date.now();
  for (const [userId, data] of memberCache.entries()) {
    if (now - data.timestamp > CACHE_DURATION) {
      memberCache.delete(userId);
    }
  }
}

/**
 * Auto-refresh cache periodically
 * @param {import("discord.js").Client} client
 */
function startCacheRefresh(client) {
  setInterval(async () => {
    if (!ALLOWED_GUILD_ID) return;
    
    try {
      const guild = await client.guilds.fetch(ALLOWED_GUILD_ID);
      const members = await guild.members.fetch();
      
      // Update cache with current members
      memberCache.clear();
      for (const member of members.values()) {
        memberCache.set(member.id, {
          isMember: true,
          timestamp: Date.now()
        });
      }
      
      clearExpiredCache();
      console.log('[Guild Restriction] Cache refreshed');
    } catch (error) {
      console.error('[Guild Restriction] Error refreshing cache:', error);
    }
  }, CACHE_REFRESH_INTERVAL);
}

/**
 * Send denial message with invite button
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 */
async function sendDenialMessage(interaction) {
  const embed = new EmbedBuilder()
    .setTitle("🚫 Access Denied")
    .setDescription("You must join the server to use this bot.")
    .setColor("#ff0000")
    .setTimestamp();
  
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Join Server")
      .setStyle(ButtonStyle.Link)
      .setURL(INVITE_LINK)
  );
  
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({ embeds: [embed], components: [row], flags: 64 });
  } else {
    await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
  }
}

/**
 * Middleware function to check guild membership
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 * @param {import("discord.js").Client} client
 * @returns {Promise<boolean>} true if allowed, false if denied
 */
async function checkGuildRestriction(interaction, client) {
  if (!ALLOWED_GUILD_ID) return true; // No restriction if not configured
  
  const isMember = await isUserInGuild(interaction.user.id, client);
  
  if (!isMember) {
    await sendDenialMessage(interaction);
    return false;
  }
  
  return true;
}

module.exports = {
  checkGuildRestriction,
  startCacheRefresh,
  clearExpiredCache
};
