// Pengaturan non-rahasia untuk bot.
// Rahasia (TOKEN, CLIENT_ID) tetap di .env.

module.exports = {
  banlist: {
    // ID channel tempat pesan Ban List berada
    channelId: "1460037803197861898",

    // ID channel tempat panel /banpanel dikirim (kosongkan "" untuk memakai channel saat ini)
    panelChannelId: "1463872322644480223",

    // ID role yang boleh mencari Ban List (tambahkan lebih dari satu dengan koma di array)
    allowedRoleIds: ["1452202000593719346"],

    // Jumlah pesan terbaru yang dimuat ke cache saat bot online.
    // 0 = pindai seluruh riwayat yang dapat diakses bot.
    maxScan: 0,
  },
};
