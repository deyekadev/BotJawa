const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { requireAdmin } = require("../utils/admin");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("del")
    .setDescription("Hapus pesan terbaru di channel ini (khusus admin)")
    .addIntegerOption((o) =>
      o.setName("jumlah").setDescription("Jumlah pesan (1 - 100)").setRequired(true).setMinValue(1).setMaxValue(100)
    ),

  async execute(interaction) {
    if (!(await requireAdmin(interaction))) return;

    const amount = interaction.options.getInteger("jumlah", true);
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      return interaction.editReply(
        `✅ ${deleted.size} pesan dihapus.` +
        (deleted.size < amount ? "\nCatatan: pesan yang lebih lama dari 14 hari tidak bisa dihapus massal." : "")
      );
    } catch (error) {
      console.error("[/DEL]", error);
      return interaction.editReply("❌ Gagal menghapus pesan. Pastikan bot punya izin **Manage Messages** di channel ini.");
    }
  },
};
