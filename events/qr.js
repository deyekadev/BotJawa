const { AttachmentBuilder, Events } = require("discord.js");

module.exports = {
  name: Events.MessageCreate,
  once: false,
  execute(message, client) {
    // 1. Abaikan pesan dari bot lain
    if (message.author.bot) return;

    // 2. Ubah pesan jadi huruf kecil semua
    const pesan = message.content.toLowerCase();

    // 3. FITUR UTAMA: Trigger Gambar Lokal dengan Whitelist Role
    if (pesan === ".qr") {
      // Pastikan pesan dikirim di server (bukan dari DM pribadi ke bot)
      if (!message.member) return;

      // Daftar ID Role yang diizinkan
      const allowedRoles = ["1452199873989443717", "1452202000593719346"];

      // Cek apakah user yang mengetik memiliki salah satu dari role di atas
      const hasAllowedRole = allowedRoles.some(roleId => message.member.roles.cache.has(roleId));

      // Jika user TIDAK punya role-nya, hentikan proses (bisa diganti balasannya)
      if (!hasAllowedRole) {
        return message.reply("Maaf, kamu tidak punya izin untuk menggunakan trigger ini! ❌");
        // Catatan: Hapus baris 'return message.reply(...)' di atas dan ganti dengan 'return;' 
        // saja kalau kamu mau bot diam saja tanpa membalas pesan error.
      }

      // Jika user punya role, lanjut kirim gambar
      const gambarTrigger = new AttachmentBuilder("./images/qris.png"); // Sesuaikan nama file gambarmu

      message.reply({
        content: "Silahkan melakukan payment menggunakan QRIS yang sudah tertera disini",
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