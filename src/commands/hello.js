const { SlashCommandBuilder, MessageFlags, InteractionContextType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("test to see if ephermeral works")
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
  async execute(interaction) {
    await interaction.reply({
      content: `[/] If you are reading this, the command actually worked for once. Miracle.`,
      ephemeral: true,
    });
  },
};
