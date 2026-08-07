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
    .setName("embed")
    .setDescription("Spam obnoxious embed messages to clutter the chat.")
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setDescription("How many embeds to spam? (Max 10, try not to crash it)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("The title of your spam embed.")
        .setRequired(true)
        .setMaxLength(100)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("The description of your spam embed. (\\n for newlines)")
        .setRequired(true)
        .setMaxLength(1000)
    )
    .addStringOption((option) =>
      option
        .setName("footer")
        .setDescription("Footer text for the embed. (\\n for newlines)")
        .setRequired(false)
        .setMaxLength(100)
    )
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("Color hex code (default is pitch black)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("content")
        .setDescription("Additional text content outside the embed. (\\n for newlines)")
        .setRequired(false)
        .setMaxLength(100)
    )
    .addStringOption((option) =>
      option
        .setName("image")
        .setDescription("Some image URL to spam.")
        .setRequired(false)
    ),
  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const count = interaction.options.getInteger("count");
    const title = interaction.options.getString("title");
    const description = interaction.options
      .getString("description")
      .replace(/\\n/g, "\n");
    const footer = interaction.options.getString("footer");
    const color = interaction.options.getString("color") || "#000000";
    const content =
      interaction.options.getString("content")?.replace(/\\n/g, "\n") || "";
    const imageUrl = interaction.options.getString("image");

    // Console UI embed shown only to the user
    const buildConsoleEmbed = (status) =>
      new EmbedBuilder()
        .setTitle("embed spam")
        .setDescription(`gonna blast this embed **${count}x** into the chat, check the preview below`)
        .addFields(
          { name: "how many", value: `${count}x`, inline: true },
          { name: "status", value: status, inline: true }
        )
        .setColor("#a1a1a1")
        .setTimestamp();

    // Build the actual spam embed (preview)
    const buildSpamEmbed = () => {
      const e = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();
      if (footer) e.setFooter({ text: footer });
      if (imageUrl) e.setImage(imageUrl);
      return e;
    };

    const getRow = (disabled) =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("start_embed")
          .setLabel(disabled ? "sending..." : "send it")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(disabled)
      );

    // Store session so button handler in interactionCreate.js can access it
    if (!interaction.client.spamSessions) {
      interaction.client.spamSessions = new Map();
    }
    interaction.client.spamSessions.set(interaction.user.id, {
      type: "embed",
      count,
      content,
      buildConsoleEmbed,
      buildSpamEmbed,
      getRow,
      originalInteraction: interaction,
    });

    await interaction.reply({
      embeds: [buildConsoleEmbed("Awaiting confirmation..."), buildSpamEmbed()],
      components: [getRow(false)],
      flags: MessageFlags.Ephemeral,
    });
  },
};
