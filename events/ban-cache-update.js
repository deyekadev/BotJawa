const { Events } = require("discord.js");
const { handleBanMessageUpdate } = require("../utils/bansearch");

module.exports = {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage) {
    await handleBanMessageUpdate(oldMessage, newMessage);
  },
};
