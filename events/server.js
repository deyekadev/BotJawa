const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        if (message.author.bot) return;

        const content = message.content.toLowerCase();

        if (content === ".sv") {
            return message.reply("https://www.roblox.com/share?code=fcef15c0a9f2fd49b6b5508ef526febc&type=Server");
        }
    }
};