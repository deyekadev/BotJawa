const { AttachmentBuilder, Events } = require("discord.js");

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(message, client) {
    if (message.author.bot) return;

    const pesan = message.content.toLowerCase();

    if (pesan === ".qr") {
      if (!message.member) return;

      const allowedRoles = ["1452199873989443717", "1452202000593719346"];
      const hasAllowedRole = allowedRoles.some(roleId => message.member.roles.cache.has(roleId));

      if (!hasAllowedRole) {
        return message.reply("Maaf, kamu tidak punya izin untuk menggunakan trigger ini! ❌");
      }

      // Kirim gambar QRIS
      const gambarTrigger = new AttachmentBuilder("./images/qris.png");

      await message.reply({
        content: "Silahkan melakukan payment menggunakan QRIS yang sudah tertera disini",
        files: [gambarTrigger],
      });

      // PESAN TAMBAHAN (Sistem Pembelian Custom Title)
      message.channel.send(`
# 🎟️ PEMBELIAN CUSTOM TITLE

Setelah melakukan transfer sejumlah **Rp 500.000**, kirimkan format berikut:
Username Roblox:
Nama Pengirim:
Bukti Transfer: (foto/screenshot)

⚠️ Mohon pastikan data yang dikirim sudah benar agar proses verifikasi dapat dilakukan lebih cepat.
Setelah pembayaran berhasil diverifikasi, admin akan menghubungi Anda untuk proses pemberian Title.`);
    }

    // --- CONTOH COMMAND TAMBAHAN ---
    if (pesan === ".format") {
      message.reply("adawdawdadwadaw");
    }

    if (pesan === "!jawaparty") {
      message.reply("Kuy ramaikan JAWA PARTY! 🔥");
    }
  },
};