const { SlashCommandBuilder } = require("discord.js");
const config = require("../config");
const { requireAdmin } = require("../utils/admin");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rek")
    .setDescription("Kirim nomor rekening pembayaran (khusus admin)"),

  async execute(interaction) {
    if (!(await requireAdmin(interaction))) return;
    return interaction.reply(config.payment.rekMessage);
  },
};
