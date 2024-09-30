const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageReactionAdd,
	async execute(reaction, user) {
		const targetChannelId = 'SPECIFIC_CHANNEL_ID';
		const targetMessageId = 'SPECIFIC_MESSAGE_ID';
		const roleId = 'SPECIFIC_ROLE_ID';

		if (reaction.message.id !== targetMessageId || reaction.message.channel.id !== targetChannelId) return;

		const member = await reaction.message.guild.members.fetch(user.id);
		const role = reaction.message.guild.roles.cache.get(roleId);

		if (!member.roles.cache.has(roleId)) {
			await member.roles.add(role);
            console.log(`Added role ${role.name} to ${member.user.tag}.`);
		}
	}
};