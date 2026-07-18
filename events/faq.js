const { Events } = require("discord.js");

const cooldown = new Set();

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        try {
            if (message.author.bot) return;

            // WHITELIST ROLE
            const whitelistRoles = [
                "1463866960436789411",
                "1452202000593719346",
                "1452199873989443717"
            ];

            if (
                message.member &&
                message.member.roles.cache.some(role =>
                    whitelistRoles.includes(role.id)
                )
            ) {
                return;
            }

            // HANYA BERJALAN DI CHANNEL TERTENTU
            if (message.channel.id !== "1452194244881158144") return;

            const content = message.content.toLowerCase();

            const triggers = {
                drama: "📢 KALAU ADA DRAMA SILAHKAN MENUJU KE <#1500295305239728188> MAS/MBA",
                laser: "📢 ADA LASER? WAH SILAHKAN MENUJU KE <#1500295305239728188> KAK",
                cheater: "📢 ADA CHEATER? SUNG KE <#1500295305239728188> KAK",
                ribut: "📢 ADA KERIBUTAN? SILAHKAN MENUJU KE <#1500295305239728188> KAK",
                titan: "📢 ADA TITAN? SUNG KE <#1500295305239728188> KAK",
                vip : "📢 Sebagai bentuk kompensasi atas kendala yang terjadi sebelumnya, kami telah menyediakan klaim VIP GRATIS selama 1 bulan (11 Juni 2026 - 11 Juli 2026). Perlu kami informasikan bahwa periode klaim gratis tersebut telah berakhir sesuai dengan jadwal yang telah ditentukan. Oleh karena itu, apabila saat ini anda sudah TIDAK dapat melakukan klaim VIP GRATIS, hal tersebut karena masa klaim telah selesai, bukan karena adanya kesalahan sistem. Terima kasih atas pengertian dan dukungan dari seluruh komunitas❤️"
            };

            for (const trigger in triggers) {
                if (content.includes(trigger)) {

                    // Cooldown per trigger
                    if (cooldown.has(trigger)) return;

                    cooldown.add(trigger);

                    setTimeout(() => {
                        cooldown.delete(trigger);
                    }, 10000);

                    console.log(
                        `[AUTO RESPON] ${message.author.tag} -> ${trigger}`
                    );

                    await message.reply({
                        content: triggers[trigger]
                    });

                    return;
                }
            }

        } catch (err) {
            console.error("Error Auto Response:", err);
        }
    }
};