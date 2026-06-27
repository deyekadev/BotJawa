const { SlashCommandBuilder } = require('discord.js');
global.afkUsers = new Map(); // Ini tempat "otak" bot menyimpan pesan AFK-mu

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk') // Ini perintah yang kamu ketik di Discord
        .setDescription('Set status AFK kamu')
        .addStringOption(option => 
            option.setName('alasan')
                .setDescription('Alasan kamu AFK')
                .setRequired(true)),
    async execute(interaction) {
        const alasan = interaction.options.getString('alasan');
        global.afkUsers.set(interaction.user.id, alasan); // Simpan pesanmu di memori
        await interaction.reply({ content: `✅ Kamu sekarang AFK: **${alasan}**`, ephemeral: true });
    },
};