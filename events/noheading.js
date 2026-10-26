
const { Events } = require('discord.js');

// Role yang DIIZINKAN menggunakan heading
const ALLOWED_ROLE_IDS = [
    '1452202000593719346'
];

// Waktu pesan peringatan sebelum dihapus (ms)
const DELETE_WARNING_AFTER = 5000;

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        // Abaikan DM, bot, dan webhook
        if (!message.guild || message.author.bot || message.webhookId) return;

        // Deteksi heading Markdown (# sampai ######)
        const hasHeading = message.content
            .split('\n')
            .some(line => /^ {0,3}#{1,6}[ \t]+.+/.test(line));

        if (!hasHeading) return;

        // Cek apakah anggota memiliki role yang diizinkan
        const isAllowed = message.member.roles.cache.some(role =>
            ALLOWED_ROLE_IDS.includes(role.id)
        );

        if (isAllowed) return;

        try {
            // Hapus pesan yang menggunakan heading
            await message.delete();

            // Kirim peringatan dari bot
            const warning = await message.channel.send({
                content: `${message.author}, Penggunaan format heading (#) tidak diperbolehkan di server ini.`,
                allowedMentions: {
                    users: [message.author.id]
                }
            });

            // Hapus peringatan setelah 5 detik
            setTimeout(async () => {
                try {
                    await warning.delete();
                } catch (error) {
                    // Pesan mungkin sudah dihapus
                }
            }, DELETE_WARNING_AFTER);

            console.log(
                `Heading dihapus: ${message.author.tag} di #${message.channel.name}`
            );
        } catch (error) {
            console.error('Gagal memproses heading:', error);
        }
    },
};
