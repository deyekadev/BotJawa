const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        if (message.author.bot) return;

        const content = message.content.toLowerCase();

        if (content === ".sv") {
            return message.reply("https://www.roblox.com/share?code=a302c099c374af40b235b75121a9e30a&type=Server");
        }
    }
};