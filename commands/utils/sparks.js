const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const SPREADSHEET_ID = '1rPiG51FxpQmJ3lpLuoSwLt3NRKLOwYL4F2xU-R9dF_Y';
const API_KEY = process.env.GOOGLE_API;
const roleMapping = {
    BLAZE: '1267847683675000883',
    FLAME: '1267847632995221569',
    SPARK: '1267847593833140386',
};

async function getSheetTabs() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties.title&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    return data.sheets.map(sheet => sheet.properties.title);
}

async function getUserDataFromTab(tabName) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${tabName}!B:C?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    return data.values;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spark')
        .setDescription('Assign roles to the current winners of the sparks program.')
        .addStringOption(option =>
            option.setName('tab')
                .setDescription('Select the Google Sheets tab to retrieve user data')
                .setAutocomplete(true)
                .setRequired(true)
        ),
    async autocomplete(interaction) {
        const tabs = await getSheetTabs();

        const focusedValue = interaction.options.getFocused();
        const filtered = tabs.filter(tab => tab.toLowerCase().startsWith(focusedValue.toLowerCase()));

        await interaction.respond(
            filtered.map(tab => ({ name: tab, value: tab }))
        );
    },
    async execute(interaction) {
        const selectedTab = interaction.options.getString('tab');
        const data = await getUserDataFromTab(selectedTab);

        const guild = interaction.guild;
        await interaction.guild.members.fetch();

        let progress = 0;
        let progressBar = '▓'.repeat(0) + '░'.repeat(10);
        const failedAssignments = [];

        const message = await interaction.reply({ content: `Progress: [${progressBar}] 0%`, fetchReply: true });

        for (let i = 0; i < data.length; i++) {
            const [roleName, userId] = data[i];
            const roleId = roleMapping[roleName.toUpperCase()];
            const member = guild.members.cache.get(userId);
            let assigned = false;

            if (member && roleId) {
                try {
                    await member.roles.add(roleId);
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
                    id: userId,
                    username: 'Unknown (User not found or invalid role)',
                    reason: member ? 'Invalid role mapping' : 'User not found in guild',
                });
            }

            if ((i + 1) % Math.ceil(data.length / 10) === 0) {
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