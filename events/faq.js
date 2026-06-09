const autoResponses = [
    {
        trigger: ["drama", "derama", "drma"],
        response: "KALAU ADA DRAMA SILAHKAN MENUJU KE <#1500295305239728188> MAS/MBA"
    },
    {
        trigger: ["laser", "lser"],
        response: "ADA LASER? WAH SILAHKAN MENUJU KE <#1500295305239728188> KAK"
    },
    {
        trigger: ["keributan", "ribut", "rbut"],
        response: "ADA DRAMA? WAH SILAHKAN MENUJU KE <#1500295305239728188> KAK"
    }
    {
        trigger: ["cheater", "cheat"],
        response: "ADA CHEATER SUNG KE <#1500295305239728188> KAK"
    }
    {
        trigger: ["titan"],
        response: "ADA TITAN? SUNG KE <#1500295305239728188> KAK"
    }
];

module.exports = {
    name: "messageCreate",

    async execute(message) {
        if (message.author.bot) return;

        const content = message.content.toLowerCase();

        for (const item of autoResponses) {
            if (item.trigger.includes(content)) {
                return message.reply(item.response);
            }
        }
    }
};