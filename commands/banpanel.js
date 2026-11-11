const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("banpanel")
    .setDescription("Pasang panel Roblox USN Ban List Search")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "Command ini hanya bisa digunakan di server.",
        ephemeral: true,
      });
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: "Kamu perlu izin Manage Server untuk memasang panel.",
        ephemeral: true,
      });
    }

    const configuredChannelId = (process.env.BANSEARCH_PANEL_CHANNEL_ID || "").trim();
    const targetChannel = configuredChannelId
      ? await interaction.guild.channels.fetch(configuredChannelId).catch(() => null)
      : interaction.channel;

    if (!targetChannel?.isTextBased() || !targetChannel.send) {
      return interaction.reply({
        content: "Channel panel tidak ditemukan. Periksa BANSEARCH_PANEL_CHANNEL_ID di .env.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x2496ed)
      .setTitle("🔎 ROBLOX USN BAN LIST SEARCH")
      .setDescription([
        "Gunakan tombol di bawah untuk mencari username Roblox di database Ban List.",
        "",
        "• Masukkan username Roblox secara tepat.",
        "• Hasil pencarian hanya terlihat oleh kamu.",
        "• Akses dibatasi untuk role yang diizinkan.",
      ].join("\n"))
      .setFooter({ text: "Ban List Search System" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("usnban:open")
        .setLabel("Search USN")
        .setEmoji("🔍")
        .setStyle(ButtonStyle.Primary)
    );

    await targetChannel.send({ embeds: [embed], components: [row] });

    return interaction.reply({
      content: `Panel Ban List Search berhasil dipasang di ${targetChannel}.`,
      ephemeral: true,
    });
  },
};
