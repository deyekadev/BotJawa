const { Events } = require("discord.js");
const { handleBanMessageDelete } = require("../utils/bansearch");

module.exports = {
  name: Events.MessageDelete,
  execute(message) {
    handleBanMessageDelete(message);
  },
};
