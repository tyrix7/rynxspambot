const {
  SlashCommandBuilder,
  EmbedBuilder,
  InteractionContextType,
} = require("discord.js");

// ── Config ────────────────────────────────────────────────────────────────────
const GIF_BASE_URL = "https://cdn.purrbot.site/nsfw/fuck/gif/fuck_";
const GIF_COUNT    = 500; // fuck_001.gif → fuck_500.gif
const EMBED_COLOR  = "#ff2e5b";

// ── Helpers ───────────────────────────────────────────────────────────────────
function randomGif() {
  const n = Math.floor(Math.random() * GIF_COUNT) + 1;
  return `${GIF_BASE_URL}${String(n).padStart(3, "0")}.gif`;
}

// ── Command ───────────────────────────────────────────────────────────────────
module.exports = {
  data: new SlashCommandBuilder()
    .setName("fuck")
    .setDescription("yeah you know what this does")
    .addUserOption((opt) =>
      opt
        .setName("target")
        .setDescription("who's getting it")
        .setRequired(true)
    )
    .setContexts(
      InteractionContextType.Guild,
      InteractionContextType.BotDM,
      InteractionContextType.PrivateChannel
    ),

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

    // can't target yourself lmao
    if (target.id === invoker.id) {
      return interaction.reply({
        content: "bro really tried to fuck himself 💀 pick someone else",
        flags: 64,
      });
    }

    const gif = randomGif();

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(`${invoker.username} is fucking ${target.username} 💀`)
      .setDescription(`<@${invoker.id}> → <@${target.id}>\n\nyeah this is actually happening rn`)
      .setImage(gif)
      .setFooter({ text: `rynex • requested by ${invoker.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
