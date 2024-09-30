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
	},
};