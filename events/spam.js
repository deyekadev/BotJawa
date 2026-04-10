const { Events } = require("discord.js");

const usersMap = new Map();
const LIMIT = 5; 
const TIME = 7000; 
const DIFF = 2000; 

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Abaikan bot atau pesan yang merupakan command !ping
        if (message.author.bot || message.content === '!ping') return;

        if (usersMap.has(message.author.id)) {
            const userData = usersMap.get(message.author.id);
            const { lastMessage, timer } = userData;
            const difference = message.createdTimestamp - lastMessage.createdTimestamp;
            let msgCount = userData.msgCount;

            if (difference > DIFF) {
                clearTimeout(timer);
                userData.msgCount = 1;
                userData.lastMessage = message;
                userData.timer = setTimeout(() => {
                    usersMap.delete(message.author.id);
                }, TIME);
                usersMap.set(message.author.id, userData);
            } else {
                msgCount++;
                if (msgCount === LIMIT) {
                    message.reply("⚠️ **Anti-Spam:** Jangan kirim pesan terlalu cepat!");
                } else if (msgCount > LIMIT) {
                    // Cek apakah bot punya izin menghapus pesan
                    if (message.deletable) {
                        await message.delete().catch(() => {});
                    }
                } else {
                    userData.msgCount = msgCount;
                    usersMap.set(message.author.id, userData);
                }
            }
        } else {
            let fn = setTimeout(() => {
                usersMap.delete(message.author.id);
            }, TIME);

            usersMap.set(message.author.id, {
                msgCount: 1,
                lastMessage: message,
                timer: fn
            });
        }
    },
};