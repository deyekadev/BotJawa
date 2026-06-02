module.exports = {
    name: "messageCreate",

    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        // Prefix
        const prefix = ".";

        if (!message.content.startsWith(prefix)) return;

        // =========================
        // ROLE WHITELIST
        // =========================
        const whitelistRoles = [
            "1452199873989443717", // Admin
            "1463866960436789411",
            "1452202000593719346"  // Moderator
        ];

        const hasRole = message.member.roles.cache.some(role =>
            whitelistRoles.includes(role.id)
        );

        if (!hasRole) return;

        // =========================
        // COMMAND .del
        // =========================
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command !== "del") return;

        const amount = parseInt(args[0]);

        if (!amount) {
            return message.reply(
                "❌ Gunakan `.del <jumlah>`"
            );
        }

        if (amount < 1 || amount > 100) {
            return message.reply(
                "❌ Jumlah hanya bisa 1 - 100."
            );
        }

        try {

            await message.channel.bulkDelete(
                amount + 1,
                true
            );

            const success = await message.channel.send(
                `✅ ${amount} pesan berhasil dihapus.`
            );

            setTimeout(() => {
                success.delete().catch(() => {});
            }, 3000);

        } catch (err) {
            console.error(err);

            message.channel.send(
                "❌ Gagal menghapus pesan."
            ).then(msg => {
                setTimeout(() => {
                    msg.delete().catch(() => {});
                }, 3000);
            });
        }
    }
};