client.on('messageCreate', async (message) => {
    // 1. Abaikan jika yang kirim pesan adalah bot lain
    if (message.author.bot) return;

    // 2. Perintah Ping sederhana
    if (message.content === '!ping') {
        const sent = await message.reply('Sedang menghitung latensi...');
        const latency = sent.createdTimestamp - message.createdTimestamp;
        
        sent.edit(`🏓 **Pong!**\n- Latensi Bot: \`${latency}ms\`\n- Latensi API: \`${Math.round(client.ws.ping)}ms\``);
        return; // Hentikan proses agar tidak dianggap spam oleh logika di bawahnya
    }

    // --- LOGIKA ANTI-SPAM KAMU LANJUT DI SINI ---
    // (Copy-paste kode anti-spam yang saya berikan sebelumnya di sini)
});