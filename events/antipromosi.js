module.exports = {
    name: "messageCreate",

    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        // =========================
        // ROLE WHITELIST
        // =========================
        const whitelistRoles = [
            "1452199873989443717", // Admin
            "1463866960436789411",
            "1452202000593719346"  // Owner
        ];

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
            "followers murah"
        ];

        const content = message.content.toLowerCase();

        const foundWord = bannedWords.find(word =>
            content.includes(word)
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