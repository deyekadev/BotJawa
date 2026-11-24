const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require("discord.js");
const { requireAdmin } = require("../utils/admin");

const QRIS_PATH = path.join(__dirname, "..", "images", "qris.png");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("qr")
    .setDescription("Kirim QRIS pembayaran (khusus admin)"),

  async execute(interaction) {
    if (!(await requireAdmin(interaction))) return;

    if (!fs.existsSync(QRIS_PATH)) {
      return interaction.reply({ content: "❌ File images/qris.png tidak ditemukan.", flags: MessageFlags.Ephemeral });
    }

    await interaction.reply({
      content: "Silahkan melakukan payment menggunakan QRIS yang sudah tertera disini",
      files: [new AttachmentBuilder(QRIS_PATH)],
    });

    // Pesan tambahan (Sistem Pembelian Custom Title)
    await interaction.followUp(`
# 🎟️ PEMBELIAN CUSTOM TITLE

Setelah melakukan transfer sejumlah **Rp 500.000**, kirimkan format berikut:
Username Roblox:
Nama Pengirim:
Bukti Transfer: (foto/screenshot)

⚠️ Mohon pastikan data yang dikirim sudah benar agar proses verifikasi dapat dilakukan lebih cepat.
Setelah pembayaran berhasil diverifikasi, admin akan menghubungi Anda untuk proses pemberian Title.`);
  },
};
