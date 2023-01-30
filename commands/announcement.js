const { SlashCommandBuilder, EmbedBuilder, roleMention } = require('discord.js');
// const { JoinedGuilds } = require('../dbObjects.js');
const { embedColour } = require('../config.json');
// const { log } = require('../utilities.js');
const { announceAllGuilds, announceOneGuild } = require('../handleAnnouncements.js');

// The attributes of module.exports can be accessed in other files via require()
module.exports = {
    // Command name and description definition
    data: new SlashCommandBuilder()
        .setName('announce-anything')
        .setDescription('Send an announcement about a raffle to all servers.')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Title of embed of announcement.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to put in the announcement.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('guild')
                .setDescription('The specific guild to send the message in.'))
        .addStringOption(option =>
            option.setName('ping')
                .setDescription('Enter any value to send a Raffle Ping alongside announcement.')),

    // Define interaction function
    async execute(interaction) {

        const makeAnnouncement = async (i, dbGuild) => {

            const pingRoleID = dbGuild.PING_ROLE_ID;

            // Fetch discord objects
            await dbGuild.getDiscordObjects(i.client, dbGuild);
            const guild = dbGuild.guild;
            const channel = dbGuild.channel;
            const role = dbGuild.role;

            // If successfully loaded...
            if (guild && channel && role) {
                const title = i.options.getString('title');
                let message = i.options.getString('message');
                const ping = i.options.getString('ping');

                // Replace all '\n's with a newline character
                message = message.replaceAll('\\n', '\n');

                // Construct announcement
                const embed = new EmbedBuilder()
                    .setColor(embedColour)
                    .setTitle(title)
                    .setDescription(message);

                // Create announcement content object
                const sendContent = {
                    embeds: [embed],
                };

                // Add a ping to the announcement if specified
                if (ping) {
                    sendContent.content = `${roleMention(pingRoleID)}`;
                }

                // Send announcement
                try {
                    const announcement = await channel.send(sendContent);

                    return announcement.id;
                }
                catch (error) {
                    console.error(error);
                    return false;
                }
            }
            else {
                return false;
            }
        };

        const guild = interaction.options.getString('guild');

        if (guild) {
            await announceOneGuild(interaction, makeAnnouncement, guild);
        }
        else {
            await announceAllGuilds(interaction, makeAnnouncement);
        }
    },

    dev: true,
};