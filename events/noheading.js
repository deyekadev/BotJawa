
const { Events } = require('discord.js');

// Ganti dengan ID role yang diizinkan
const ALLOWED_ROLE_IDS = [
    '1452202000593719346'
];

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        // Abaikan bot dan webhook
        if (!message.guild || message.author.bot || message.webhookId) return;

        // Deteksi heading Markdown (# sampai ######)
        const hasHeading = message.content
            .split('\n')
            .some(line => /^ {0,3}#{1,6}[ \t]+.+/.test(line));

        if (!hasHeading) return;

        // Anggota dengan salah satu role yang diizinkan boleh menggunakan heading
        const isAllowed = message.member.roles.cache.some(role =>
            ALLOWED_ROLE_IDS.includes(role.id)
        );

        if (isAllowed) return;

        try {
            await message.delete();
            console.log(
                `Heading dihapus: ${message.author.tag} di #${message.channel.name}`
            );
        } catch (error) {
            console.error('Gagal menghapus pesan heading:', error);
        }
    },
};
