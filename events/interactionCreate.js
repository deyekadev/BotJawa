const { MessageFlags } = require("discord.js");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);

            const payload = {
                content: 'Ada error saat menjalankan command!',
                flags: MessageFlags.Ephemeral,
            };

            // Kalau sudah dibalas / ditunda, pakai followUp supaya tidak error dua kali.
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp(payload).catch(() => {});
            } else {
                await interaction.reply(payload).catch(() => {});
            }
        }
    },
};
