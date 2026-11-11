const { Events } = require("discord.js");
const { handleBanMessageCreate } = require("../utils/bansearch");

module.exports = {
  name: Events.MessageCreate,
  execute(message) {
    handleBanMessageCreate(message);
  },
};
