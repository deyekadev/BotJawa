const path = require("path");
const { AttachmentBuilder } = require("discord.js");

module.exports = (client) => {

    // Role yang diizinkan
    const ALLOWED_ROLES = [
        "1452199873989443717",
        "1452202000593719346"
    ];

    const TRIGGERS = {
        tutor: {
            text: "INI KA YA TUTORNYA",
            video: "TUTOR.mov"
        }
    };

    client.on("messageCreate", async (message) => {

        if (message.author.bot) return;
        if (!message.guild) return;

        // Cek role
        const hasPermission = message.member.roles.cache.some(role =>
            ALLOWED_ROLES.includes(role.name)
        );

        if (!hasPermission) return;

        const trigger = TRIGGERS[message.content.toLowerCase()];

        if (!trigger) return;

        const videoPath = path.join(
            process.cwd(),
            "VIDEO",
            trigger.video
        );

        try {
            await message.channel.send({
                content: trigger.text,
                files: [
                    new AttachmentBuilder(videoPath)
                ]
            });
        } catch (err) {
            console.error("[TRIGGER ERROR]", err);
        }

    });

};