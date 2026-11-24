const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require("discord.js");
const { requireAdmin } = require("../utils/admin");

const VIDEO_PATH = path.join(__dirname, "..", "VIDEO", "TUTOR.mov");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tutor")
    .setDescription("Kirim video tutorial (khusus admin)"),

  async execute(interaction) {
    if (!(await requireAdmin(interaction))) return;

    if (!fs.existsSync(VIDEO_PATH)) {
      return interaction.reply({ content: "❌ File VIDEO/TUTOR.mov tidak ditemukan.", flags: MessageFlags.Ephemeral });
    }

    // Unggah video bisa lama, jadi tunda balasan dulu.
    await interaction.deferReply();

    try {
      await interaction.editReply({
        content: "INI YA KA TUTORNYA",
        files: [new AttachmentBuilder(VIDEO_PATH)],
      });
    } catch (error) {
      console.error("[/TUTOR]", error);
      await interaction.editReply("❌ Gagal mengirim video. Ukuran file mungkin melebihi batas unggah server.");
    }
  },
};
