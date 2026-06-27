// commands/remove-afk.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-afk')
        .setDescription('Menghapus status AFK secara manual'),
    async execute(interaction) {
        if (global.afkUsers && global.afkUsers.has(interaction.user.id)) {
            global.afkUsers.delete(interaction.user.id);
            await interaction.reply({ content: 'Status AFK kamu sudah dihapus!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Kamu tidak sedang dalam status AFK.', ephemeral: true });
        }
    }
};