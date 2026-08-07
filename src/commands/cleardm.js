const {
  SlashCommandBuilder,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  InteractionContextType,
} = require("discord.js");

// The exact sequence of invisible U+2800 characters and newlines
const INVISIBLE_PAYLOAD = `⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

























⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀


⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀










⠀
⠀
⠀
⠀
⠀
⠀
⠀


⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀









⠀
⠀
⠀
⠀
⠀
⠀
⠀


⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀



⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀











⠀
⠀
⠀
⠀
⠀
⠀
⠀


⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀

⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀
⠀`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cleardm")
    .setDescription("Send invisible messages to create a fake clean chat effect.")
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const buildConsoleEmbed = (status) =>
      new EmbedBuilder()
        .setTitle("clear dm")
        .setDescription("sends 5 invisible msgs to push chat history up, looks like chat got wiped lmao")
        .addFields({ name: "status", value: status, inline: true })
        .setColor("#555555")
        .setTimestamp();

    const getRow = (disabled) =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm_cleardm")
          .setLabel("do it")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(disabled)
      );

    if (!interaction.client.cleardmSessions) {
      interaction.client.cleardmSessions = new Map();
    }
    interaction.client.cleardmSessions.set(interaction.user.id, {
      type: "cleardm",
      invisiblePayload: INVISIBLE_PAYLOAD,
      buildConsoleEmbed,
      getRow,
      originalInteraction: interaction,
    });

    await interaction.reply({
      embeds: [buildConsoleEmbed("waiting on you...")],
      components: [getRow(false)],
      flags: MessageFlags.Ephemeral,
    });
  },
};
