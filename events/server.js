const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        if (message.author.bot) return;

        const content = message.content.toLowerCase();

        if (content === ".sv") {
            return message.reply("https://www.roblox.com/share?code=00b9bfa1349f3d4dadd8140711ed3c5a&type=Server");
        }
    }
};