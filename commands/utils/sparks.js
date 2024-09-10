const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const winners = require('../../winners');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spark')
        .setDescription('Assign roles to the current winners of the sparks program.'),
    async execute(interaction) {
        const roleFirst10 = '1267847683675000883';
        const roleNext15 = '1267847632995221569';
        const roleRemaining = '1267847593833140386';
        const totalUsers = winners.length;
        const guild = interaction.guild;

        let progress = 0;
        let progressBar = '▓'.repeat(0) + '░'.repeat(10);
        const failedAssignments = [];

        const message = await interaction.reply({ content: `Progress: [${progressBar}] 0%`, fetchReply: true });

        await interaction.guild.members.fetch();

        for (let i = 0; i < totalUsers; i++) {
            const member = guild.members.cache.get(winners[i]);
            let assigned = false;

            if (member) {
                try {
                    if (i < 10) {
                        await member.roles.add(roleFirst10);
                    } else if (i < 25) {
                        await member.roles.add(roleNext15);
                    } else {
                        await member.roles.add(roleRemaining);
                    }
                    assigned = true;
                } catch (error) {
                    failedAssignments.push({
                        id: member.id,
                        username: member.user.tag,
                        reason: error.message || 'Unknown error',
                    });
                }
            } else {
                failedAssignments.push({
                    id: winners[i],
                    username: 'Unknown (User not found)',
                    reason: 'User not found in guild',
                });
            }

            if ((i + 1) % Math.ceil(totalUsers / 10) === 0) {
                progress += 1;
                progressBar = '▓'.repeat(progress) + '░'.repeat(10 - progress);
                await message.edit(`Progress: [${progressBar}] ${progress * 10}%`);
            }
        }

        progressBar = '▓▓▓▓▓▓▓▓▓▓';
        await message.edit(`Progress: [${progressBar}] 100% - Roles have been assigned.`);

        if (failedAssignments.length > 0) {
            const embed = new EmbedBuilder()
                .setTitle('Failed Role Assignments')
                .setColor(0xff0000)
                .setDescription('The following users did not receive the role because of an error:')
                .addFields(
                    failedAssignments.map(failure => ({
                        name: `${failure.username} (ID: ${failure.id})`,
                        value: `Reason: ${failure.reason}`,
                    }))
                );

            await interaction.followUp({ embeds: [embed] });
        } else {
            await interaction.followUp({ content: 'All users received their roles successfully.' });
        }
    },
};