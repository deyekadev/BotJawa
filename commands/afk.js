const { SlashCommandBuilder } = require('discord.js');

// Inisialisasi Map global jika belum ada
if (!global.afkUsers) {
    global.afkUsers = new Map();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set status AFK kamu')
        .addStringOption(option => 
            option.setName('alasan')
                .setDescription('Alasan kamu AFK')
                .setRequired(true)),
    
    async execute(interaction) {
        const alasan = interaction.options.getString('alasan');
        
        // Simpan ID user dan alasannya
        global.afkUsers.set(interaction.user.id, {
            alasan: alasan,
            waktu: Date.now()
        });

        await interaction.reply({ 
            content: `✅ Status AFK kamu telah diset: **${alasan}**`, 
            ephemeral: false 
        });
    }
};