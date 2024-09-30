const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageReactionRemove,
	async execute(reaction, user) {
		const targetChannelId = '1285236236071731270';
		const targetMessageId = '1290281677674774540';
		const roleId = '1286327443430445123';
        const targetEmoji = '1287552503608770600';

		if (reaction.message.id !== targetMessageId || reaction.message.channel.id !== targetChannelId) return;
        if (reaction.emoji.id !== targetEmoji) return;

		const member = await reaction.message.guild.members.fetch(user.id);
		const role = reaction.message.guild.roles.cache.get(roleId);

		if (member.roles.cache.has(roleId)) {
			await member.roles.remove(role);
            console.log(`Removed role ${role.name} from ${member.user.tag}.`);
		}
	}
};