const { Events } = require("discord.js");
const { needsCleanup, cleanupMember } = require("../utils/newmem");

// Kalau penghapusan gagal (misalnya role bot terlalu rendah), jangan coba lagi
// di setiap pesan. Coba ulang paling cepat setelah jeda ini.
const RETRY_AFTER_MS = 10 * 60 * 1000;
const failedAt = new Map();

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        if (message.author.bot || !message.guild || !message.member) return;
        if (!needsCleanup(message.member)) return;

        const last = failedAt.get(message.author.id);
        if (last && Date.now() - last < RETRY_AFTER_MS) return;

        try {
            await cleanupMember(message.member);
            failedAt.delete(message.author.id);
            console.log(`[NEW MEM] Dihapus dari ${message.author.tag} (sudah punya Sobat Cidro)`);
        } catch (err) {
            failedAt.set(message.author.id, Date.now());
            console.error(`[NEW MEM] Gagal menghapus role dari ${message.author.tag}:`, err.message);
        }
    },
};
