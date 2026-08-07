const {
  SlashCommandBuilder,
  MessageFlags,
  EmbedBuilder,
  InteractionContextType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ghost_ping")
    .setDescription("Ping a user and instantly delete the message.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("User to ghost ping")
        .setRequired(true)
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

    const delay = 1000; // 1 second delay

    // Send initial response
    await interaction.reply({
      content: `pinging ${target.tag} and deleting it lol`,
      flags: MessageFlags.Ephemeral,
    });

    // Send the ping message
    const pingMessage = await interaction.channel.send(`<@${target.id}>`).catch((err) => {
      console.error('Error sending ping message:', err);
    });

    if (pingMessage) {
      // Wait for the specified delay then delete
      await new Promise(resolve => setTimeout(resolve, delay));
      await pingMessage.delete().catch((err) => {
        console.error('Error deleting message:', err);
      });
    } else {
      console.error('Failed to send ping message');
    }

    // Send completion message
    await interaction.followUp({
      content: `done, ${target.tag} has no idea what just hit them`,
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
  },
};
