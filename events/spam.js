const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Koleksi untuk menyimpan data user yang kirim pesan
const usersMap = new Map();
const LIMIT = 5; // Maksimal pesan
const TIME = 7000; // Rentang waktu (7 detik)
const DIFF = 2000; // Toleransi waktu antar pesan (2 detik)

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (usersMap.has(message.author.id)) {
        const userData = usersMap.get(message.author.id);
        const { lastMessage, timer } = userData;
        const difference = message.createdTimestamp - lastMessage.createdTimestamp;
        let msgCount = userData.msgCount;

        if (difference > DIFF) {
            // Jika jeda antar pesan cukup lama, reset hitungan
            clearTimeout(timer);
            userData.msgCount = 1;
            userData.lastMessage = message;
            userData.timer = setTimeout(() => {
                usersMap.delete(message.author.id);
            }, TIME);
            usersMap.set(message.author.id, userData);
        } else {
            // Jika pesan dikirim terlalu cepat
            msgCount++;
            if (parseInt(msgCount) === LIMIT) {
                message.reply("⚠️ Berhenti melakukan spam! Kamu akan dibisukan jika lanjut.");
                // Di sini kamu bisa tambah logika untuk timeout atau kick
            } else if (msgCount > LIMIT) {
                // Hapus pesan jika sudah melewati batas
                await message.delete();
            } else {
                userData.msgCount = msgCount;
                usersMap.set(message.author.id, userData);
            }
        }
    } else {
        // Jika user baru pertama kali kirim pesan dalam sesi ini
        let fn = setTimeout(() => {
            usersMap.delete(message.author.id);
        }, TIME);

        usersMap.set(message.author.id, {
            msgCount: 1,
            lastMessage: message,
            timer: fn
        });
    }
});