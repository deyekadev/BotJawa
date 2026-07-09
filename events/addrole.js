const { Events } = require("discord.js");

// ===========================
// ROLE YANG BOLEH MENGGUNAKAN COMMAND
// ===========================
const whitelistRoles = [
    "1452202000593719346",
    "1452199873989443717"
];

// ===========================
// ROLE YANG AKAN DIBERIKAN
// ===========================
const roles = {
    raja: "1524553799329513514",
    sultan: "1524554008776413356",
    donatur: "1524565078303572129"
};

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        if (!message.content.startsWith(".")) return;

        // ===========================
        // WHITELIST ROLE
        // ===========================
        if (
            !message.member.roles.cache.some(role =>
                whitelistRoles.includes(role.id)
            )
        ) {
            return;
        }

        const args = message.content.slice(1).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (!["raja", "sultan", "donatur"].includes(command)) return;

        const member = message.mentions.members.first();

        if (!member) {
            const reply = await message.reply(`❌ Contoh:\n.${command} @user`);

            setTimeout(() => {
                reply.delete().catch(() => {});
                message.delete().catch(() => {});
            }, 5000);

            return;
        }

        const role = message.guild.roles.cache.get(roles[command]);

        if (!role) {
            const reply = await message.reply("❌ Role tidak ditemukan.");

            setTimeout(() => {
                reply.delete().catch(() => {});
                message.delete().catch(() => {});
            }, 5000);

            return;
        }

        try {
            await member.roles.add(role);

            // Hapus pesan command admin
            await message.delete().catch(() => {});

            // Kirim balasan bot
            const reply = await message.channel.send(
                `✅ Berhasil memberikan role **${role.name}** kepada ${member}.`
            );

            // Hapus balasan bot setelah 5 detik
            setTimeout(() => {
                reply.delete().catch(() => {});
            }, 5000);

        } catch (err) {
            console.error(err);

            const reply = await message.reply("❌ Gagal memberikan role.");

            setTimeout(() => {
                reply.delete().catch(() => {});
            }, 5000);
        }
    }
};