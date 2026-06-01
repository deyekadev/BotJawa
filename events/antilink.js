module.exports = {
    name: "messageCreate",

    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const whitelistRoles = [
            "1463866960436789411", // Admin
            "1452199873989443717",
            "1452202000593719346"  // Moderator
        ];

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
            const allowed = allowedDomains.some(domain =>
                link.toLowerCase().includes(domain)
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