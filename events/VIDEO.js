const { AttachmentBuilder } = require("discord.js");
const path = require("path");

module.exports = (client) => {

    client.on("messageCreate", async (message) => {

        if (message.author.bot) return;

        // Role yang boleh trigger
        const ROLE_IDS = [
            "1452199873989443717",
            "1452202000593719346"
        ];

        const hasRole = message.member?.roles.cache.some(role =>
            ROLE_IDS.includes(role.id)
        );

        if (!hasRole) return;

        if (message.content.toLowerCase() === ".tutor") {

            const videoPath = path.join(
                process.cwd(),
                "VIDEO",
                "TUTOR.mov"
            );

            await message.channel.send({
                content: "INI YA KA TUTORNYA",
                files: [
                    new AttachmentBuilder(videoPath)
                ]
            });

        }

    });

};