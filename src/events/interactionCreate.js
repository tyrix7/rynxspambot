const { Events, EmbedBuilder } = require("discord.js");
const { checkAccessMiddleware } = require("../middleware/accessControl");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {

    // ─── Handle Button Clicks ─────────────────────────────────────────────────
    if (interaction.isButton()) {
      const customId = interaction.customId;
      let session = null;
      
      // Check button custom ID to determine which session to use
      if (customId === "start_raid") {
        session = interaction.client.raidSessions?.get(interaction.user.id);
      } else if (customId === "start_spam" || customId === "start_embed") {
        session = interaction.client.spamSessions?.get(interaction.user.id);
      } else if (customId === "blame_send" || customId === "blame_cancel") {
        session = interaction.client.blameSessions?.get(interaction.user.id);
      } else if (customId === "confirm_cleardm") {
        session = interaction.client.cleardmSessions?.get(interaction.user.id);
      }
      
      if (!session) {
        await interaction.reply({
          content: "session's gone mate, just run the command again",
          flags: 64,
        });
        return;
      }

      const { type, buildConsoleEmbed, getRow, originalInteraction } = session;
      const btnInteraction = interaction; // The button click interaction

      // Handle raid button
      if (type === "raid") {
        await btnInteraction.update({
          embeds: [buildConsoleEmbed("sending...")],
          components: [getRow(false)],
        });
        
        await startRaidLoop(btnInteraction, session);
        
        await btnInteraction.editReply({
          embeds: [buildConsoleEmbed("done, click again if you want more")],
          components: [getRow(false)],
        }).catch(() => {});
        return;
      }

      // Handle blame buttons
      if (type === "blame") {
        const { raidAlertEmbed, originalInteraction } = session;
        
        if (btnInteraction.customId === "blame_send") {
          await btnInteraction.update({
            content: "sent lol, rip them",
            components: [],
          });
          
          if (originalInteraction.channel) {
            await originalInteraction.channel.send({
              embeds: [raidAlertEmbed],
            }).catch(() => {});
          } else {
            await btnInteraction.followUp({
              embeds: [raidAlertEmbed],
            }).catch(() => {});
          }
        } else if (btnInteraction.customId === "blame_cancel") {
          await btnInteraction.update({
            content: "aight cancelled",
            components: [],
          });
        }
        
        // Clean up session
        interaction.client.blameSessions.delete(interaction.user.id);
        return;
      }

      // Handle cleardm buttons
      if (type === "cleardm") {
        const { invisiblePayload, buildConsoleEmbed } = session;
        await btnInteraction.update({
          embeds: [buildConsoleEmbed("flooding chat rn...")],
          components: [],
        });

        const isUserApp = !btnInteraction.channel;
        const payload = { content: invisiblePayload };

        for (let i = 0; i < 5; i++) {
          try {
            if (isUserApp) {
              await btnInteraction.followUp(payload).catch(() => {});
            } else {
              await btnInteraction.channel.send(payload).catch(() => {});
            }
          } catch (e) {}
          if (i < 4) await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await btnInteraction.editReply({
          embeds: [buildConsoleEmbed("done, chat looks clean now")],
          components: [],
        }).catch(() => {});

        interaction.client.cleardmSessions.delete(interaction.user.id);
        return;
      }

      // Handle existing spam/embed buttons
      const { count } = session;
      
      await btnInteraction.update({
        embeds: buildCurrentEmbeds(session, "sending..."),
        components: [getRow(false)],
      });

      if (type === "spam") {
        const { message } = session;
        await doSpam(btnInteraction, message, count);
      } else if (type === "embed") {
        const { content, buildSpamEmbed } = session;
        await doEmbedSpam(btnInteraction, content, buildSpamEmbed, count);
      }

      await btnInteraction.editReply({
        embeds: buildCurrentEmbeds(session, "done lmao, click again for more"),
        components: [getRow(false)],
      }).catch(() => { });

      return;
    }

    // ─── Handle Slash Commands ────────────────────────────────────────────────
    if (!interaction.isChatInputCommand()) return;

    // Check access control before executing command
    const isAllowed = await checkAccessMiddleware(interaction, interaction.client);
    if (!isAllowed) return;

    // ─── Guild-specific command block ─────────────────────────────────────────
    const BLOCKED_GUILD_ID = "1440355261142270055";

    // Fully blocked for everyone in this guild
    const BLOCKED_ALL = ["spam", "embed", "raid", "blame"];

    // Only allowed for VIP users in this guild
    const VIP_ONLY_CMDS = ["dm_raid", "ghost_ping"];
    const VIP_USERS = ["1392826264829825095"];

    if (interaction.guildId === BLOCKED_GUILD_ID) {
      if (BLOCKED_ALL.includes(interaction.commandName)) {
        await interaction.reply({ content: "Not here bro", flags: 64 });
        return;
      }

      if (VIP_ONLY_CMDS.includes(interaction.commandName) && !VIP_USERS.includes(interaction.user.id)) {
        await interaction.reply({ content: "Not here bro", flags: 64 });
        return;
      }
    }


    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `[!] Couldn't find a single slash command named ${interaction.commandName}. Learn to type, kid.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(
        `[!] Blew up while running slash command ${interaction.commandName}. You probably broke it.`
      );
      console.error(error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "Something went completely wrong. Absolute skill issue.",
          flags: 64,
        });
      } else {
        await interaction.reply({
          content: "Something went completely wrong. Absolute skill issue.",
          flags: 64,
        });
      }
    }
  },
};

// Returns the correct embeds array depending on session type and status
function buildCurrentEmbeds(session, status) {
  if (session.type === "spam") {
    return [session.buildConsoleEmbed(status), session.previewEmbed];
  } else if (session.type === "raid") {
    return [session.buildConsoleEmbed(status), session.previewEmbed];
  } else {
    return [session.buildConsoleEmbed(status), session.buildSpamEmbed()];
  }
}

// Fire all text messages simultaneously using originalInteraction
async function doSpam(targetInteraction, message, count) {
  const isUserApp = !targetInteraction.channel;
  const actualCount = isUserApp ? Math.min(count, 5) : count;
  
  // Construct payload once to save memory and CPU cycles
  const payload = {
    content: message,
    allowedMentions: { parse: ["everyone", "roles", "users"] },
  };

  const sends = Array.from({ length: actualCount }, () => {
    // Fast path for User Apps (no channel access)
    if (isUserApp) {
      return targetInteraction.followUp(payload).catch(() => {});
    }
    // Fast path for Guild integration (direct channel send)
    return targetInteraction.channel.send(payload).catch(() => {
      // Fallback in case of weird permissions
      return targetInteraction.followUp(payload).catch(() => {});
    });
  });
  
  await Promise.allSettled(sends);
}

// Fire all embed messages simultaneously using targetInteraction
async function doEmbedSpam(targetInteraction, content, buildSpamEmbed, count) {
  const isUserApp = !targetInteraction.channel;
  const actualCount = isUserApp ? Math.min(count, 5) : count;
  
  // Construct payload once (including building the embed)
  const payload = {
    content: content || undefined,
    embeds: [buildSpamEmbed()],
    allowedMentions: { parse: ["everyone", "roles", "users"] },
  };

  const sends = Array.from({ length: actualCount }, () => {
    // Fast path for User Apps
    if (isUserApp) {
      return targetInteraction.followUp(payload).catch(() => {});
    }
    // Fast path for Guild integration
    return targetInteraction.channel.send(payload).catch(() => {
      // Fallback
      return targetInteraction.followUp(payload).catch(() => {});
    });
  });
  
  await Promise.allSettled(sends);
}

// Single batch raid spamming
async function startRaidLoop(targetInteraction, session) {
  const { raidMessage } = session;
  const isUserApp = !targetInteraction.channel;
  const batchSize = 20;
  
  const payload = {
    content: raidMessage,
    allowedMentions: { parse: ["everyone", "roles", "users"] },
  };

  // Send messages with small delay to avoid spam detection
  for (let i = 0; i < batchSize; i++) {
    try {
      if (isUserApp) {
        await targetInteraction.followUp(payload).catch(() => {});
      } else {
        await targetInteraction.channel.send(payload).catch(() => {});
      }
      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (e) {
      // Continue even if one message fails
    }
  }
}

