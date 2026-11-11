const { Events } = require("discord.js");
const { initializeBanCache } = require("../utils/bansearch");

module.exports = {
  name: Events.ClientReady,
  async execute(readyClient, client) {
    const bot = client || readyClient;
    try {
      await initializeBanCache(bot);
    } catch (error) {
      console.error("[BAN CACHE] Cache belum siap. Sistem akan mencoba lagi saat ada pencarian:", error.message);
    }
  },
};
