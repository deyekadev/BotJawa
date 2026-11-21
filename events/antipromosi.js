const config = require("../config");

module.exports = {
    name: "messageCreate",

    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        // =========================
        // CHANNEL TEMPAT ANTI PROMOSI AKTIF
        // =========================
        const allowedChannels = [
            "1452194244881158144",
            "1453875683544531066",
            "1455610504205701280",
            "1455610560161906760"
            
        ];

        // Kalau bukan di channel yang ditentukan, abaikan
        if (!allowedChannels.includes(message.channel.id)) return;

        // =========================
        // ROLE WHITELIST
        // =========================
        const whitelistRoles = config.roles.admin;

        const hasWhitelistRole = message.member.roles.cache.some(role =>
            whitelistRoles.includes(role.id)
        );

        if (hasWhitelistRole) return;

        // =========================
        // KATA TERLARANG
        // =========================
        const bannedWords = [
            "robux",
            "topup",
            "top up",
            "jual",
            "dijual",
            "open jasa",
            "jasa",
            "ready stock",
            "stok tersedia",
            "akun dijual",
            "jual akun",
            "open murid",
            "murid private",
            "murid priv",
            "rekber",
            "nitro murah",
            "nitro boost",
            "panel murah",
            "hosting murah",
            "suntik followers",
            "followers murah",
            "yobux",
            "joki",
            "visend",
            "visen",
            "ready",
            "redi",
            "rbx",
            "bio",
            "ridi",
            "yobux.id",
            "yobux.com",
            "obux",
        ];

        const content = message.content.toLowerCase();

        // FIX: cocokkan sebagai kata utuh, bukan potongan kata.
        // Contoh: "bio" tidak lagi kena di "biologi", "ready" tidak kena di "already".
        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const foundWord = bannedWords.find(word =>
            new RegExp(
                `(?<![\\p{L}\\p{N}])${escapeRegex(word)}(?![\\p{L}\\p{N}])`,
                "u"
            ).test(content)
        );

        if (foundWord) {
            try {
                await message.delete();

                const warning = await message.channel.send({
                    content: `🚫 ${message.author}, promosi atau jualan tidak diperbolehkan di server ini.`
                });

                setTimeout(() => {
                    warning.delete().catch(() => {});
                }, 5000);

                console.log(
                    `[ANTI PROMOSI] ${message.author.tag} | Kata terdeteksi: ${foundWord}`
                );

            } catch (err) {
                console.error(err);
            }
        }
    }
};