const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		await client.guilds.cache.forEach(guild => {
			console.log(`Guild found - ${guild.name}`);
		});

		const guild = client.guilds.cache.get('1187435395823185960');
		await guild.members.fetch();

		console.log(`Fetched ${guild.members.cache.size} members from ${guild.name}`);

		// Add the emoji 1287552503608770600 to the message ID 1290281677674774540 in the channel ID 1285236236071731270
		console.log('Adding reaction to message...');
		const channel = guild.channels.cache.get('1285236236071731270');
		const message = await channel.messages.fetch('1290281677674774540');
		await message.react('1287552503608770600');
		console.log('Added reaction to message.');
	}
};