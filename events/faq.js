const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        if (message.author.bot) return;

        const responses = {
            "drama": "KALAU ADA DRAMA SILAHKAN MENUJU KE <#1500295305239728188> MAS/MBA",
            "ada laser": "ADA LASER? WAH SILAHKAN MENUJU KE <#1500295305239728188> KAK",
            "keributan": "ADA DRAMA? WAH SILAHKAN MENUJU KE <#1500295305239728188> KAK",
            "cheater": "ADA CHEATER SUNG KE <#1500295305239728188> KAK",
            "ada titan": "ADA TITAN? SUNG KE <#1500295305239728188> KAK"
        };

        const content = message.content.toLowerCase();

        if (responses[content]) {
            message.reply(responses[content]);
        }
    }
};