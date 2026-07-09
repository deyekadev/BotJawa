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
            return message.reply(`❌ Contoh:\n.${command} @user`);
        }

        const role = message.guild.roles.cache.get(roles[command]);

        if (!role) {
            return message.reply("❌ Role tidak ditemukan.");
        }

        try {
            await member.roles.add(role);

            return message.reply(
                `✅ Berhasil memberikan role **${role.name}** kepada ${member}.`
            );

        } catch (err) {
            console.error(err);
            return message.reply("❌ Gagal memberikan role.");
        }
    }
};