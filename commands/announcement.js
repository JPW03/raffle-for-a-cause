const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
                .setDescription('The specific guild to send the message in.')),

    // Define interaction function
    async execute(interaction) {

        const makeAnnouncement = async (i, dbGuild) => {

            // Fetch discord objects
            await dbGuild.getDiscordObjects(i.client, dbGuild);
            const guild = dbGuild.guild;
            const channel = dbGuild.channel;
            const role = dbGuild.role;

            // If successfully loaded...
            if (guild && channel && role) {
                const title = i.options.getString('title');
                const message = i.options.getString('message');

                // Construct announcement
                const embed = new EmbedBuilder()
                    .setColor(embedColour)
                    .setTitle(title)
                    .setDescription(message);

                // Send announcement
                try {
                    const announcement = await channel.send({
                        embeds: [embed],
                    });

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