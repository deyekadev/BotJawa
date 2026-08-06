const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot) return;

		const content = message.content.trim();

		if (content === '.hm') {
			try {
				const rekMessage = '# #PRAY FOR ME.';
				return message.channel.send(rekMessage);
			} catch (err) {
				console.error('Gagal mengirim pesan .rek:', err);
			}
		}
	},
};
