module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.bot) return;

        // Jika ada orang mention user yang sedang AFK
        const mentionedUser = message.mentions.users.first();
        if (mentionedUser && global.afkUsers.has(mentionedUser.id)) {
            const alasan = global.afkUsers.get(mentionedUser.id);
            message.reply(`User **${mentionedUser.username}** lagi ngambek: *${alasan}*`);
        }

        // Jika kamu chat kembali, bot hapus status AFK-mu
        if (global.afkUsers.has(message.author.id)) {
            global.afkUsers.delete(message.author.id);
        }
    }
};