const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");

const { isAllowedRole } = require("../utils/bansearch-permissions");
const { getCachedBanRecord } = require("../utils/bansearch");
const { getRobloxAvatar } = require("../utils/roblox-avatar");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Cek alasan dan detail ban berdasarkan username Roblox")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("Username Roblox yang ingin diperiksa")
        .setRequired(true)
        .setMinLength(3)
        .setMaxLength(20)
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "Command ini hanya bisa digunakan di server.",
        ephemeral: true,
      });
    }

    // Gunakan daftar role yang sama dengan panel Ban List.
    if (!isAllowedRole(interaction)) {
      return interaction.reply({
        content: "⛔ Kamu tidak memiliki role yang diizinkan untuk menggunakan /ban.",
        ephemeral: true,
      });
    }

    const username = interaction.options.getString("username", true).trim();
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
      return interaction.reply({
        content: "Format username tidak valid. Gunakan 3–20 karakter berupa huruf, angka, atau underscore.",
        ephemeral: true,
      });
    }

    // Hasil dibuat publik agar anggota yang dapat melihat channel bisa melihatnya.
    await interaction.deferReply();

    try {
      const [{ record, scanned, recordCount }, robloxUser] = await Promise.all([
        getCachedBanRecord(interaction.client, username),
        getRobloxAvatar(username),
      ]);

      if (!record) {
        const notFound = new EmbedBuilder()
          .setColor(0x2ecc71)
          .setTitle("✅ TIDAK ADA RECORD BAN")
          .setDescription(
            `Tidak ditemukan record Ban List untuk **${username}** dalam ${scanned} pesan yang dipindai.`
          )
          .addFields(
            { name: "Status Ban List", value: "`TIDAK DITEMUKAN`", inline: true },
            { name: "Record dalam Cache", value: `\`${recordCount}\``, inline: true },
          )
          .setFooter({ text: "USN Ban List • Pemeriksaan melalui /ban" })
          .setTimestamp();

        if (robloxUser?.avatarUrl) {
          notFound.setThumbnail(robloxUser.avatarUrl);
          notFound.addFields({
            name: "Akun Roblox",
            value: `[${robloxUser.displayName} (@${robloxUser.username})](${robloxUser.profileUrl})`,
          });
        } else {
          notFound.addFields({
            name: "Akun Roblox",
            value: "Akun/avatar tidak berhasil ditemukan melalui Roblox API.",
          });
        }

        return interaction.editReply({ embeds: [notFound] });
      }

      const result = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("🚨 BAN RECORD DITEMUKAN")
        .setDescription(
          `Username **${record.username}** tercatat di USN Ban List. Berikut detail alasan dan informasinya.`
        )
        .setAuthor({ name: "USN BAN LIST • CHECK VIA /BAN" })
        .addFields(
          { name: "Username", value: record.username || "-", inline: true },
          { name: "Jenis Ban", value: record.banType || "-", inline: true },
          { name: "Durasi", value: record.duration || "-", inline: true },
          { name: "Alasan Ban", value: record.reason || "-", inline: false },
          { name: "Admin", value: record.admin || "-", inline: true },
          { name: "Tanggal Ban", value: record.date || "-", inline: true },
        )
        .setFooter({
          text: `USN Ban List • ${recordCount} record di cache • ${scanned} pesan dipindai`,
        })
        .setTimestamp();

      if (robloxUser?.avatarUrl) {
        result.setThumbnail(robloxUser.avatarUrl);
        result.addFields({
          name: "Profil Roblox",
          value: `[${robloxUser.displayName} (@${robloxUser.username})](${robloxUser.profileUrl}) • ID: \`${robloxUser.userId}\``,
        });
      } else {
        result.addFields({
          name: "Profil Roblox",
          value: "Avatar tidak tersedia. Data Ban List tetap ditampilkan.",
        });
      }

      if (record.messageUrl) {
        result.addFields({
          name: "Record Asli",
          value: `[Buka pesan Ban List](${record.messageUrl})`,
        });
      }

      const embeds = [result];
      const evidenceImages = record.evidenceImages || [];

      if (evidenceImages.length > 0) {
        result.addFields({
          name: "Bukti",
          value: `${evidenceImages.length} gambar bukti ditemukan.`,
        });
        result.setImage(evidenceImages[0]);

        for (const imageUrl of evidenceImages.slice(1, 4)) {
          embeds.push(
            new EmbedBuilder()
              .setColor(0xe74c3c)
              .setTitle("📸 BUKTI BAN TAMBAHAN")
              .setImage(imageUrl)
          );
        }
      } else {
        result.addFields({
          name: "Bukti",
          value: "Tidak ada gambar bukti yang terlampir pada pesan Ban List.",
        });
      }

      return interaction.editReply({ embeds });
    } catch (error) {
      console.error("[USN /BAN COMMAND]", error);
      return interaction.editReply(
        "❌ Pengecekan gagal. Periksa BANLIST_CHANNEL_ID, izin View Channel dan Read Message History, serta koneksi bot."
      );
    }
  },
};
