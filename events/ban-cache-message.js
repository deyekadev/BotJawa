const { Events } = require("discord.js");
const { handleBanMessageCreate } = require("../utils/bansearch");

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    try {
      await handleBanMessageCreate(message);
    } catch (error) {
      console.error("[BAN CACHE] Gagal memproses pesan baru:", error);
    }
  },
};
