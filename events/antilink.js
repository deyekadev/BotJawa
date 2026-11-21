const config = require("../config");

module.exports = {
    name: "messageCreate",

    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const whitelistRoles = config.roles.admin;

        const allowedDomains = [
            "youtube.com",
            "youtu.be",
            "tiktok.com",
            "vt.tiktok.com",
            "roblox.com",
            "www.roblox.com"
        ];

        const hasWhitelistRole = message.member.roles.cache.some(role =>
            whitelistRoles.includes(role.id)
        );

        if (hasWhitelistRole) return;

        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
        const links = message.content.match(urlRegex);

        if (!links) return;

        for (const link of links) {
            // FIX: periksa hostname sebenarnya, bukan sekadar teks yang memuat domain.
            // Sebelumnya "evil.com/?x=youtube.com" lolos.
            let host;
            try {
                const cleaned = link.replace(/[)\]}>.,!?;:'"]+$/, "");
                const url = new URL(/^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`);
                host = url.hostname.toLowerCase();
            } catch {
                continue; // bukan URL valid, bukan link yang bisa diklik
            }

            const allowed = allowedDomains.some(domain =>
                host === domain || host.endsWith("." + domain)
            );

            if (!allowed) {
                await message.delete().catch(() => {});

                const msg = await message.channel.send(
                    `${message.author}, link tersebut tidak diperbolehkan!`
                );

                setTimeout(() => {
                    msg.delete().catch(() => {});
                }, 5000);

                return;
            }
        }
    }
};