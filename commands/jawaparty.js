const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jawaparty")
    .setDescription("Semangat JAWA PARTY"),

  async execute(interaction) {
    return interaction.reply("Kuy ramaikan JAWA PARTY! 🔥");
  },
};
