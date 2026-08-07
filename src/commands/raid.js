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
    .setName("raid")
    .setDescription("Destroy servers with toxic raid messages.")
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const raidMessage = `@everyone @here
# YOU HAVE BEEN RAID BY RYNX
# 😈🔥💀⚠️ RYNX RAID 💀⚠️😈🔥
# https://discord.gg/T4rkVxrmuM`;

    // Console UI embed shown only to the user
    const buildConsoleEmbed = (status) =>
      new EmbedBuilder()
        .setTitle("raid")
        .setDescription("about to fuck this server up, click when ready")
        .addFields(
          { name: "message", value: "fixed raid msg", inline: true },
          { name: "status", value: status, inline: true }
        )
        .setColor("#ff0000")
        .setTimestamp();

    // Preview of what will actually be spammed
    const previewEmbed = new EmbedBuilder()
      .setTitle("what they're getting")
      .setDescription(`\`\`\`\n${raidMessage}\n\`\`\``)
      .setColor("#ff0000");

    const getRow = (disabled) =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("start_raid")
          .setLabel(disabled ? "raiding..." : "start raid")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(disabled)
      );

    // Store session so button handler in interactionCreate.js can access it
    if (!interaction.client.raidSessions) {
      interaction.client.raidSessions = new Map();
    }
    interaction.client.raidSessions.set(interaction.user.id, {
      type: "raid",
      raidMessage,
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
