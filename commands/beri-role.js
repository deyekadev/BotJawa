const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const config = require("../config");
const { requireAdmin } = require("../utils/admin");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("beri-role")
    .setDescription("Beri role Raja / Sultan / Donatur ke member (khusus admin)")
    .addStringOption((o) =>
      o
        .setName("jenis")
        .setDescription("Role yang diberikan")
        .setRequired(true)
        .addChoices(
          { name: "Raja", value: "raja" },
          { name: "Sultan", value: "sultan" },
          { name: "Donatur", value: "donatur" }
        )
    )
    .addUserOption((o) => o.setName("user").setDescription("Member penerima role").setRequired(true)),

  async execute(interaction) {
    if (!(await requireAdmin(interaction))) return;

    const jenis = interaction.options.getString("jenis", true);
    const member = interaction.options.getMember("user");

    if (!member) {
      return interaction.reply({ content: "❌ Member tidak ditemukan di server ini.", flags: MessageFlags.Ephemeral });
    }

    const role = interaction.guild.roles.cache.get(config.roles.grants[jenis]);
    if (!role) {
      return interaction.reply({ content: "❌ Role tidak ditemukan. Periksa `roles.grants` di config.js.", flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();

    try {
      await member.roles.add(role);
      await interaction.editReply(`✅ Berhasil memberikan role **${role.name}** kepada ${member}.`);

      // Hapus balasan setelah 5 detik, seperti sebelumnya.
      setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);
    } catch (error) {
      console.error("[/BERI-ROLE]", error);
      return interaction.editReply("❌ Gagal memberikan role. Pastikan role bot ada di atas role tersebut dan punya izin **Manage Roles**.");
    }
  },
};
