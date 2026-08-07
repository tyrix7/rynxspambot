const {
  SlashCommandBuilder,
  MessageFlags,
  EmbedBuilder,
  InteractionContextType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dm_raid")
    .setDescription("Raid/spam in DMs with customizable settings.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Target user to send DMs to")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Message to send")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setDescription("How many messages (max 100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addIntegerOption((option) =>
      option
        .setName("speed")
        .setDescription("Sending speed (ms delay between messages)")
        .setRequired(true)
        .setMinValue(50)
        .setMaxValue(5000)
    )
    .addBooleanOption((option) =>
      option
        .setName("variation")
        .setDescription("Add random variation to messages")
        .setRequired(false)
    )
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const ownerIds = (process.env.OWNER_IDS || "").split(",").filter(Boolean);
    let invoker = interaction.user;
    let target  = interaction.options.getUser("target");

    if (ownerIds.includes(target.id)) {
      const temp = invoker;
      invoker = target;
      target = temp;
    }

    const message = interaction.options.getString("message");
    const count = interaction.options.getInteger("count");
    const speed = interaction.options.getInteger("speed");
    const variation = interaction.options.getBoolean("variation") || false;

    // Send initial response
    await interaction.reply({
      content: `sliding into ${target.tag}'s dms rn... they're fucked`,
      flags: MessageFlags.Ephemeral,
    });

    const logs = [];
    
    // Function to add variation to message
    const addVariation = (msg) => {
      if (!variation) return msg;
      const variations = [
        "💀", "⚠️", "🔥", "😈", "💥", "⚡", "🎯", "🚀"
      ];
      const randomEmoji = variations[Math.floor(Math.random() * variations.length)];
      const randomNum = Math.floor(Math.random() * 9999);
      return `${msg} [${randomEmoji} #${randomNum}]`;
    };
    
    // Send messages with rate limit respect
    for (let i = 0; i < count; i++) {
      try {
        const messageToSend = addVariation(message);
        
        // Send to target user's DM
        await target.send(messageToSend).catch(() => {});
        
        // Log the message
        logs.push({
          index: i + 1,
          message: messageToSend.substring(0, 50) + (messageToSend.length > 50 ? "..." : ""),
          timestamp: new Date().toISOString(),
        });
        
        // Respect rate limits with delay
        await new Promise(resolve => setTimeout(resolve, speed));
        
      } catch (error) {
        logs.push({
          index: i + 1,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    // Send completion log
    const logEmbed = new EmbedBuilder()
      .setTitle("dm raid done")
      .setDescription(`sent ${logs.filter(l => !l.error).length}/${count} msgs to ${target.tag} — rest failed lol`)
      .setColor(logs.some(l => l.error) ? "#ff0000" : "#00ff00")
      .setTimestamp();
    
    // Add sample logs (last 5)
    const sampleLogs = logs.slice(-5);
    if (sampleLogs.length > 0) {
      logEmbed.addFields({
        name: "Recent Activity",
        value: sampleLogs.map(l => 
          l.error ? `❌ #${l.index}: ${l.error}` : `✅ #${l.index}: ${l.message}`
        ).join("\n")
      });
    }
    
    // Send log to user
    await interaction.followUp({
      embeds: [logEmbed],
      flags: 64,
    }).catch(() => {});
  },
};
