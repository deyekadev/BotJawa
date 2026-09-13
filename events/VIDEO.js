const { Events, AttachmentBuilder } = require("discord.js");
const path = require("path");

const ALLOWED_ROLE_IDS = [
    "1463866960436789411", // Admin

];

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {

        if (message.author.bot) return;
        if (!message.guild) return;

        if (message.content.toLowerCase() !== ".tutor") return;

        const hasRole = message.member.roles.cache.some(role =>
            ALLOWED_ROLE_IDS.includes(role.id)
        );

        if (!hasRole) return;
        const videoPath = path.join(
            process.cwd(),
            "VIDEO",
            "TUTOR.mov"
        );

        await message.channel.send({
            content: "INI YA KA TUTORNYA",
            files: [new AttachmentBuilder(videoPath)]
        });
    }
};