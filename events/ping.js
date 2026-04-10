const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate, // Menggunakan konstanta Events agar lebih aman
    async execute(message) {
        // Validasi: bukan bot dan isinya tepat !ping
        if (message.author.bot || message.content !== '!ping') return;

        const sent = await message.reply('🏓 Sedang menghitung...');
        const latency = sent.createdTimestamp - message.createdTimestamp;
        
        return sent.edit(`🏓 **Pong!**\n- Latensi Bot: \`${latency}ms\``);
    },
};