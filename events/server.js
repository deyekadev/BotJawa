const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        if (message.author.bot) return;

        const content = message.content.toLowerCase();

        if (content === ".sv") {
            return message.reply("https://www.roblox.com/share?code=f19431897186a844a12090cff198096f&type=Server");
        }
    }
};