// Pengaturan non-rahasia untuk bot.
// Rahasia (TOKEN, CLIENT_ID) tetap di .env.

module.exports = {
  // ===========================
  // ROLE
  // ===========================
  roles: {
    // Satu-satunya role admin. Dipakai untuk: .del, .raja/.sultan/.donatur,
    // .qr, .rek, .tutor, bebas dari antilink/antipromosi/faq, dan boleh memakai heading (#).
    admin: ["1452202000593719346"],

    // Role yang diberikan oleh .raja / .sultan / .donatur
    grants: {
      raja: "1524553799329513514",
      sultan: "1524554008776413356",
      donatur: "1524565078303572129",
    },
  },

  // ===========================
  // PEMBAYARAN
  // ===========================
  payment: {
    // Pesan yang dikirim oleh .rek
    rekMessage: "Mandiri 1710017138903 - ALMASITA JIHAN.",
  },

  // ===========================
  // LINK
  // ===========================
  links: {
    // Dikirim oleh /sv
    server: "https://www.roblox.com/share?code=8032fe0c92ae6f4f8c532493a18afdf6&type=Server",
  },

  // ===========================
  // AUTOMOD (dipasang oleh: node scripts/setup-automod.js)
  // ===========================
  automod: {
    // Link dengan domain ini TIDAK diblokir (subdomain ikut diizinkan)
    allowedLinkDomains: ["youtube.com", "youtu.be", "tiktok.com", "roblox.com"],

    // Semua aturan AutoMod (link, heading, promosi) HANYA aktif di kategori ini
    categoryIds: ["1452194023728091287", "1455610058275557467"],

    // Kata/frasa terlarang untuk anti-promosi (dicocokkan sebagai kata utuh)
    promoKeywords: [
      "robux", "topup", "top up", "jual", "dijual", "open jasa", "jasa",
      "ready stock", "stok tersedia", "akun dijual", "jual akun", "open murid",
      "murid private", "murid priv", "rekber", "nitro murah", "nitro boost",
      "panel murah", "hosting murah", "suntik followers", "followers murah",
      "yobux", "joki", "visend", "visen", "ready", "redi", "rbx", "bio",
      "ridi", "yobux.id", "yobux.com", "obux",
    ],
  },
};
