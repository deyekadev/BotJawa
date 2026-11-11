const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const { isAllowedRole } = require("../utils/bansearch-permissions");
const { getCachedBanRecord } = require("../utils/bansearch");
const { getRobloxAvatar } = require("../utils/roblox-avatar");

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
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

      modal.addComponents(new ActionRowBuilder().addComponents(usernameInput));
      return interaction.showModal(modal);
    }

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

      // Hasil pencarian dibuat PUBLIC agar seluruh anggota channel dapat melihatnya.
      await interaction.deferReply();

      try {
        const { record, scanned, recordCount } = await getCachedBanRecord(
          interaction.client,
          username
        );

        if (!record) {
          // Query Roblox so the public result can confirm whether the account exists.
          const robloxUser = await getRobloxAvatar(username);
          const notFound = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle("✅ CLEAR — TIDAK ADA RECORD BAN")
            .setDescription(
              `Pencarian untuk **${username}** selesai. Tidak ada record ban yang cocok dalam ${scanned} pesan yang dipindai.`
            )
            .addFields(
              { name: "HASIL", value: "`TIDAK DITEMUKAN`", inline: true },
              { name: "DATA CACHE", value: `\`${recordCount} record\``, inline: true },
            )
            .setFooter({ text: "USN Ban List Search • Hasil ini terlihat oleh anggota channel" })
            .setTimestamp();

          if (robloxUser?.avatarUrl) {
            notFound.setThumbnail(robloxUser.avatarUrl);
            notFound.addFields({
              name: "Roblox Account",
              value: `[${robloxUser.displayName} (@${robloxUser.username})](${robloxUser.profileUrl})`,
            });
          } else {
            notFound.addFields({
              name: "Roblox Account",
              value: "Avatar atau akun Roblox tidak berhasil ditemukan melalui API.",
            });
          }

          return interaction.editReply({ embeds: [notFound] });
        }

        const [robloxUser] = await Promise.all([getRobloxAvatar(record.username)]);
        const result = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle("🚨 BAN RECORD DITEMUKAN")
          .setDescription(`**${record.username}** memiliki record di USN Ban List.
Periksa detail dan bukti di bawah ini.`)
          .setAuthor({ name: "USN BAN LIST • PUBLIC SEARCH" })
          .addFields(
            { name: "Username", value: record.username || "-", inline: true },
            { name: "Ban Type", value: record.banType || "-", inline: true },
            { name: "Duration", value: record.duration || "-", inline: true },
            { name: "Ban Reason", value: record.reason || "-", inline: false },
            { name: "Admin", value: record.admin || "-", inline: true },
            { name: "Ban Date", value: record.date || "-", inline: true },
          )
          .setFooter({ text: `USN Ban List Search • ${recordCount} record di cache • ${scanned} pesan dipindai` })
          .setTimestamp();

        if (robloxUser?.avatarUrl) {
          result.setThumbnail(robloxUser.avatarUrl);
          result.addFields({
            name: "Roblox Profile",
            value: `[${robloxUser.displayName} (@${robloxUser.username})](${robloxUser.profileUrl}) • ID: \`${robloxUser.userId}\``,
          });
        } else {
          result.addFields({
            name: "Roblox Profile",
            value: "Avatar Roblox tidak berhasil diambil. Data Ban List tetap ditampilkan.",
          });
        }

        if (record.messageUrl) {
          result.addFields({
            name: "Original Record",
            value: `[Buka pesan Ban List](${record.messageUrl})`,
          });
        }

        const embeds = [result];
        const evidenceImages = record.evidenceImages || [];

        if (evidenceImages.length > 0) {
          result.addFields({
            name: "Evidence",
            value: `${evidenceImages.length} gambar bukti ditemukan dari pesan Ban List.`,
          });

          // First evidence image is shown large in the main embed.
          result.setImage(evidenceImages[0]);

          // Additional images are shown in separate embeds.
          for (const imageUrl of evidenceImages.slice(1, 4)) {
            embeds.push(new EmbedBuilder()
              .setColor(0xe74c3c)
              .setTitle("📸 BUKTI BAN TAMBAHAN")
              .setImage(imageUrl));
          }
        } else {
          result.addFields({
            name: "Evidence",
            value: "Tidak ada gambar bukti yang terlampir pada pesan Ban List.",
          });
        }

        return interaction.editReply({ embeds });
      } catch (error) {
        console.error("[USN BAN SEARCH]", error);
        return interaction.editReply(
          "❌ Pencarian gagal. Periksa BANLIST_CHANNEL_ID, izin View Channel dan Read Message History, serta koneksi bot."
        );
      }
    }
  },
};
