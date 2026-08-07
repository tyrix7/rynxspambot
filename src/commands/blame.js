const {
  SlashCommandBuilder,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  InteractionContextType,
  PermissionFlagsBits,
} = require("discord.js");

// Cooldown storage: Map<userId, timestamp>
const cooldowns = new Map();
const COOLDOWN_TIME = 30 * 1000; // 30 seconds

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blame")
    .setDescription("Generate a fake raid alert blaming a user.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("User to blame for the raid")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setContexts(InteractionContextType.Guild),
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
    
    // Check cooldown
    const now = Date.now();
    const cooldownEnd = cooldowns.get(interaction.user.id);
    if (cooldownEnd && now < cooldownEnd) {
      const remaining = Math.ceil((cooldownEnd - now) / 1000);
      await interaction.reply({
        content: `⏳ Wait ${remaining} seconds before using this command again.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    
    // Set cooldown
    cooldowns.set(interaction.user.id, now + COOLDOWN_TIME);
    
    // Create the fake raid alert embed (sent version)
    const raidAlertEmbed = new EmbedBuilder()
      .setTitle("raid alert")
      .setDescription(`# server got raided by <@${target.id}>`)
      .setColor("#ff0000")
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setFooter({ text: "Rynex" })
      .setTimestamp();
    
    // Preview embed (shown only to command user)
    const previewEmbed = new EmbedBuilder()
      .setTitle("preview — only you can see this")
      .setDescription(`server got raided by <@${target.id}>\n\n> click **send** to drop this in chat anonymously lmao`)
      .setColor("#ff0000")
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .setFooter({ text: "only you can see this" })
      .setTimestamp();
    
    const getRow = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("blame_send")
          .setLabel("send it")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("blame_cancel")
          .setLabel("nah cancel")
          .setStyle(ButtonStyle.Secondary)
      );
    
    // Store session so button handler can access it
    if (!interaction.client.blameSessions) {
      interaction.client.blameSessions = new Map();
    }
    interaction.client.blameSessions.set(interaction.user.id, {
      type: "blame",
      raidAlertEmbed,
      target,
      originalInteraction: interaction,
    });
    
    await interaction.reply({
      embeds: [previewEmbed],
      components: [getRow()],
      flags: MessageFlags.Ephemeral,
    });
  },
};
