const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Cek latensi bot"),

  async execute(interaction) {
    const latency = Date.now() - interaction.createdTimestamp;
    const ws = interaction.client.ws.ping;

    return interaction.reply(
      `🏓 **CIDRO JANJI IIIIHAAAAAA**\n- Latensi Bot: \`${latency}ms\`` +
      (ws >= 0 ? `\n- Latensi WebSocket: \`${ws}ms\`` : "")
    );
  },
};
