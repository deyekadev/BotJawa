const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        if (message.author.bot) return;

        const content = message.content.toLowerCase();

        if (content === ".sv") {
            return message.reply("https://www.roblox.com/share?code=8032fe0c92ae6f4f8c532493a18afdf6&type=Server");
        }
    }
};