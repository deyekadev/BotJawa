const { SlashCommandBuilder } = require("discord.js");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sv")
    .setDescription("Link server Roblox"),

  async execute(interaction) {
    return interaction.reply(config.links.server);
  },
};
