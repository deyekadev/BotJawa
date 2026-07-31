const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot) return;

		const content = message.content.trim();

		if (content === '.rek') {
			try {
				const rekMessage = 'Mandiri 1710017138903 - ALMASITA JIHAN KHOIR.';
				return message.channel.send(rekMessage);
			} catch (err) {
				console.error('Gagal mengirim pesan .rek:', err);
			}
		}
	},
};
