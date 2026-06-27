module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.bot) return;

        // 1. LOGIKA DETEKSI MENTION (Dahulukan ini agar bot bisa kasih tau kalau orang yang di-tag AFK)
        if (message.mentions.users.size > 0) {
            message.mentions.users.forEach(user => {
                if (global.afkUsers && global.afkUsers.has(user.id)) {
                    const data = global.afkUsers.get(user.id);
                    message.reply(`User **${user.username}** sedang AFK: *${data.alasan}*`)
                        .catch(console.error);
                }
            });
        }

        // 2. LOGIKA REMOVE AFK (Baru lakukan ini setelah cek mention)
        if (global.afkUsers && global.afkUsers.has(message.author.id)) {
            global.afkUsers.delete(message.author.id);
            message.reply('👋 Kamu sudah kembali! Status AFK kamu telah dihapus.')
                .then(msg => setTimeout(() => msg.delete(), 5000))
                .catch(console.error);
        }
    }
};