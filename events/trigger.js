const { Events } = require('discord.js');
const config = require('../config');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild || !message.member) return;

        const content = message.content.trim();

        if (content === '.rek') {
            // Hanya role yang diizinkan (admin)
            const allowed = message.member.roles.cache.some(role =>
                config.roles.admin.includes(role.id)
            );
            if (!allowed) return;

            try {
                return await message.channel.send(config.payment.rekMessage);
            } catch (err) {
                console.error('Gagal mengirim pesan .rek:', err);
            }
        }
    },
};
