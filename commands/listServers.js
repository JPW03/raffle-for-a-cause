// Definition for the /listServers command

const { SlashCommandBuilder, codeBlock } = require('discord.js');
const { JoinedGuilds } = require('../dbObjects.js');
const { messageLimitSplit } = require('../utilities.js');

module.exports = {
    // Command name and description
    data: new SlashCommandBuilder()
        .setName('list-servers')
        .setDescription('List all the servers in the database (servers that the bot has joined).'),

    // Define interaction function
    async execute(interaction) {
        const guildList = await JoinedGuilds.findAll();

        // For technically detailed list:
        // console.log(guildList);

        const guildStringList = await Promise.all(guildList.map(async guild => {

            if (guild.ID) {
                const guildObject = await interaction.client.guilds.fetch(guild.ID);
                const channelObject = await guildObject.channels.fetch(guild.ANNOUNCEMENTS_CHANNEL_ID);
                // console.log(channelObject);
                const roleObject = await guildObject.roles.fetch(guild.PING_ROLE_ID);
                // console.log(roleObject);

                return `'${guildObject.name}' (${guild.ID}), Announcements: #${channelObject.name} (${channelObject.id}), Ping Role: '${roleObject.name}' (${roleObject.id})`;
            }
            else {
                return `${guild.ID}, Announcements: ${guild.ANNOUNCEMENTS_CHANNEL_ID}, Ping Role: ${guild.PING_ROLE_ID}`;
            }
        }));

        const guildString = guildStringList.join('\n') || 'No servers found.';

        await messageLimitSplit(interaction, guildString, codeBlock);
    },

    dev: true,
};