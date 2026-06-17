const { AttachmentBuilder, EmbedBuilder, Events } = require("discord.js");

module.exports = {
  name: Events.MessageCreate,
  once: false,
  execute(message, client) {
    // 1. Abaikan pesan dari bot lain
    if (message.author.bot) return;

    // 2. Ubah pesan jadi huruf kecil semua
    const pesan = message.content.toLowerCase();

    // 3. FITUR UTAMA: Trigger QRIS dengan Whitelist Role & Embed
    if (pesan === ".qr") {
      // Pastikan pesan dikirim di server (bukan dari DM pribadi ke bot)
      if (!message.member) return;

      // Daftar ID Role yang diizinkan
      const allowedRoles = ["1452199873989443717", "1452202000593719346"];

      // Cek apakah user yang mengetik memiliki salah satu dari role di atas
      const hasAllowedRole = allowedRoles.some(roleId => message.member.roles.cache.has(roleId));

      // Jika user TIDAK punya role-nya, hentikan proses
      if (!hasAllowedRole) {
        return message.reply("Maaf, kamu tidak punya izin untuk memunculkan QRIS! ❌");
      }

      // Jika user punya role, lanjut siapkan gambar
      const namaFile = "qris.png";
      const gambarTrigger = new AttachmentBuilder(`./images/${qris}`);

      // Membuat desain Embed untuk QRIS
      const qrisEmbed = new EmbedBuilder()
        .setColor("#ffA500") // Warna biru (bisa diganti sesuai tema server)
        .setTitle("💳 Payment Gateway")
        .setDescription("Silahkan melakukan payment menggunakan QRIS yang tertera di bawah ini.")
        .setImage(`attachment://${qris}`) // Menampilkan gambar QRIS di dalam embed
        .setTimestamp()
        .setFooter({ text: "Sistem Pembayaran Otomatis" });

      // Kirim embed beserta file gambarnya
      message.reply({
        embeds: [qrisEmbed],
        files: [gambarTrigger],
      });
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