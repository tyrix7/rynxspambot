const { MAIN_GUILD_ID } = process.env;

// Cache for access checks to reduce API calls
const accessCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if user has access to use bot commands
 * @param {string} userId - User ID to check
 * @param {import("discord.js").Client} client - Discord client
 * @returns {Promise<{allowed: boolean, reason: string|null}>}
 */
async function checkAccess(userId, client) {
  // If no config, allow all (fail-safe)
  if (!MAIN_GUILD_ID) {
    return { allowed: true, reason: null };
  }

  // Check cache first to avoid rate limiting and 3-second interaction timeouts
  const cached = accessCache.get(userId);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }

  try {
    // Step 1: Verify server membership - check cache first, then fetch
    const guild = client.guilds.cache.get(MAIN_GUILD_ID) || await client.guilds.fetch(MAIN_GUILD_ID).catch(() => null);
    
    if (!guild) {
      console.error('[Access Control] Bot is not in the main guild');
      const result = { allowed: false, reason: 'bot_not_in_guild' };
      accessCache.set(userId, { timestamp: now, result });
      return result;
    }

    // Check guild cache for member first, fallback to fetch (without forcing REST call)
    let member = guild.members.cache.get(userId);
    if (!member) {
      member = await guild.members.fetch(userId).catch((err) => {
        // Suppress noisy 'Unknown Member' (10007) and 404 errors as they are expected for non-members
        if (err.code !== 10007 && err.status !== 404) {
          console.error('[Access Control] Error fetching member:', err);
        }
        return null;
      });
    }
    
    if (!member) {
      const result = { allowed: false, reason: 'not_member' };
      accessCache.set(userId, { timestamp: now, result });
      return result;
    }

    const result = { allowed: true, reason: null };
    accessCache.set(userId, { timestamp: now, result });
    return result;

  } catch (error) {
    console.error('[Access Control] Error checking access:', error);
    return { allowed: false, reason: 'error' };
  }
}

/**
 * Clear expired cache entries
 */
function clearExpiredCache() {
  const now = Date.now();
  for (const [userId, data] of accessCache.entries()) {
    if (now - data.timestamp > CACHE_DURATION) {
      accessCache.delete(userId);
    }
  }
}

/**
 * Send access denied message
 * @param {import("discord.js").BaseInteraction} interaction
 * @param {string} reason - Reason for denial
 */
async function sendAccessDenied(interaction, reason) {
  let content = '';
  
  content = 'Not here bro';

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({ content, flags: 64 }).catch(() => {});
  } else {
    await interaction.reply({ content, flags: 64 }).catch(() => {});
  }
}

/**
 * Middleware function to check access before command execution
 * @param {import("discord.js").BaseInteraction|import("discord.js").Message} target
 * @param {import("discord.js").Client} client
 * @returns {Promise<boolean>} true if allowed, false if denied
 */
async function checkAccessMiddleware(target, client) {
  const userId = target.user?.id || target.author?.id;
  if (!userId) return true; // Skip if no user ID

  const { allowed, reason } = await checkAccess(userId, client);

  if (!allowed) {
    await sendAccessDenied(target, reason);
    return false;
  }

  return true;
}

/**
 * Clear cache for a specific user (useful for role changes)
 * @param {string} userId
 */
function clearUserCache(userId) {
  accessCache.delete(userId);
}

/**
 * Clear entire cache (useful for config changes)
 */
function clearAllCache() {
  accessCache.clear();
}

// Periodically clear expired cache
setInterval(clearExpiredCache, 5 * 60 * 1000); // Every 5 minutes

/**
 * Pre-cache all members of the main guild at startup to ensure access checks are instant
 * @param {import("discord.js").Client} client
 */
async function preCacheMainGuild(client) {
  if (!MAIN_GUILD_ID) return;
  try {
    console.log('[Access Control] Pre-caching main guild members...');
    const guild = client.guilds.cache.get(MAIN_GUILD_ID) || await client.guilds.fetch(MAIN_GUILD_ID).catch(() => null);
    if (guild) {
      await guild.members.fetch().catch(() => {});
      console.log(`[Access Control] Successfully cached ${guild.members.cache.size} members.`);
    } else {
      console.error('[Access Control] Could not fetch main guild on startup.');
    }
  } catch (error) {
    console.error('[Access Control] Error pre-caching main guild members:', error);
  }
}

module.exports = {
  checkAccess,
  checkAccessMiddleware,
  sendAccessDenied,
  clearUserCache,
  clearAllCache,
  clearExpiredCache,
  preCacheMainGuild
};
