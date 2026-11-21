// Pengaturan non-rahasia untuk bot.
// Rahasia (TOKEN, CLIENT_ID) tetap di .env.

module.exports = {
  // ===========================
  // BAN LIST
  // ===========================
  banlist: {
    // ID channel tempat pesan Ban List berada
    channelId: "1460037803197861898",

    // ID channel tempat panel /banpanel dikirim (kosongkan "" untuk memakai channel saat ini)
    panelChannelId: "1463872322644480223",

    // ID role yang boleh mencari Ban List (tambahkan lebih dari satu di dalam array)
    allowedRoleIds: ["1452202000593719346"],

    // Jumlah pesan terbaru yang dimuat ke cache saat bot online.
    // 0 = pindai seluruh riwayat yang dapat diakses bot.
    maxScan: 0,
  },

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
};
