const {
  SlashCommandBuilder,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  InteractionContextType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("spam")
    .setDescription("Spam messages to annoy the living daylights out of everyone.")
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setDescription("How many times to spam? (Max 10, don't get banned kid)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("What garbage do you want to spam? (\\n for newline)")
        .setRequired(true)
        .setMaxLength(1000)
    ),
  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const count = interaction.options.getInteger("count");
    const message = interaction.options
      .getString("message")
      .replace(/\\n/g, "\n");

    // Console UI embed shown only to the user
    const buildConsoleEmbed = (status) =>
      new EmbedBuilder()
        .setTitle("spam")
        .setDescription(`sending this shit **${count}x** — hope they're ready lmao`)
        .addFields(
          { name: "how many times", value: `${count}x`, inline: true },
          { name: "what's going on", value: status, inline: true }
        )
        .setColor("#a1a1a1")
        .setTimestamp();

    // Preview of what will actually be spammed
    const previewEmbed = new EmbedBuilder()
      .setTitle("what's getting sent")
      .setDescription(`\`\`\`\n${message}\n\`\`\``)
      .setColor("#050505");

    const getRow = (disabled) =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("start_spam")
          .setLabel(disabled ? "sending..." : "send it")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(disabled)
      );

    // Store session so button handler in interactionCreate.js can access it
    if (!interaction.client.spamSessions) {
      interaction.client.spamSessions = new Map();
    }
    interaction.client.spamSessions.set(interaction.user.id, {
      type: "spam",
      message,
      count,
      buildConsoleEmbed,
      previewEmbed,
      getRow,
      originalInteraction: interaction,
    });

    await interaction.reply({
      embeds: [buildConsoleEmbed("Awaiting confirmation..."), previewEmbed],
      components: [getRow(false)],
      flags: MessageFlags.Ephemeral,
    });
  },
};
