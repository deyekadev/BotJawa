const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const { findBanRecord, isAllowedRole } = require("../utils/bansearch");

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    // Button: open the username modal.
    if (interaction.isButton() && interaction.customId === "usnban:open") {
      if (!interaction.inGuild()) {
        return interaction.reply({
          content: "Fitur ini hanya bisa digunakan di server.",
          ephemeral: true,
        });
      }

      if (!isAllowedRole(interaction)) {
        return interaction.reply({
          content: "⛔ Kamu tidak memiliki role yang diizinkan untuk mencari Ban List.",
          ephemeral: true,
        });
      }

      const modal = new ModalBuilder()
        .setCustomId("usnban:modal")
        .setTitle("Search Roblox Username");

      const usernameInput = new TextInputBuilder()
        .setCustomId("roblox_username")
        .setLabel("Roblox Username (USN)")
        .setPlaceholder("Contoh: RobloxPlayer123")
        .setStyle(TextInputStyle.Short)
        .setMinLength(3)
        .setMaxLength(20)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(usernameInput)
      );

      return interaction.showModal(modal);
    }

    // Modal submit: re-check role, then search source channel.
    if (interaction.isModalSubmit() && interaction.customId === "usnban:modal") {
      if (!interaction.inGuild()) {
        return interaction.reply({
          content: "Fitur ini hanya bisa digunakan di server.",
          ephemeral: true,
        });
      }

      if (!isAllowedRole(interaction)) {
        return interaction.reply({
          content: "⛔ Role kamu tidak memiliki izin untuk mencari Ban List.",
          ephemeral: true,
        });
      }

      const username = interaction.fields.getTextInputValue("roblox_username").trim();

      if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
        return interaction.reply({
          content: "Format username tidak valid. Gunakan 3–20 karakter berupa huruf, angka, atau underscore.",
          ephemeral: true,
        });
      }

      await interaction.deferReply({ ephemeral: true });

      const sourceChannelId = (process.env.BANLIST_CHANNEL_ID || "").trim();
      if (!sourceChannelId) {
        return interaction.editReply("❌ BANLIST_CHANNEL_ID belum diatur di file .env.");
      }

      const sourceChannel = await interaction.guild.channels
        .fetch(sourceChannelId)
        .catch(() => null);

      if (!sourceChannel?.isTextBased() || !sourceChannel.messages?.fetch) {
        return interaction.editReply(
          "❌ Channel Ban List tidak ditemukan atau bukan text channel."
        );
      }

      try {
        const { record, scanned } = await findBanRecord(sourceChannel, username);

        if (!record) {
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle("✅ NOT FOUND")
                .setDescription(
                  `Username **${username}** tidak ditemukan dalam ${scanned} pesan Ban List yang diperiksa.`
                )
                .setFooter({
                  text: "Hasil berdasarkan pesan yang berhasil dibaca bot.",
                }),
            ],
          });
        }

        const result = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle("🚫 ROBLOX BAN RECORD FOUND")
          .setDescription(`Data untuk **${record.username}** ditemukan.`)
          .addFields(
            { name: "Username", value: record.username || "-", inline: true },
            { name: "Ban Type", value: record.banType || "-", inline: true },
            { name: "Duration", value: record.duration || "-", inline: true },
            { name: "Ban Reason", value: record.reason || "-", inline: false },
            { name: "Admin", value: record.admin || "-", inline: true },
            { name: "Ban Date", value: record.date || "-", inline: true },
          )
          .setFooter({ text: `Scanned ${scanned} messages` });

        if (record.messageUrl) {
          result.addFields({
            name: "Original Record",
            value: `[Buka pesan Ban List](${record.messageUrl})`,
          });
        }

        return interaction.editReply({ embeds: [result] });
      } catch (error) {
        console.error("[USN BAN SEARCH]", error);
        return interaction.editReply(
          "❌ Gagal membaca channel Ban List. Periksa izin View Channel dan Read Message History untuk bot."
        );
      }
    }
  },
};
