const { SlashCommandBuilder, roleMention, EmbedBuilder, time } = require('discord.js');
const { Raffles, Fundraisers } = require('../dbObjects.js');
const { embedColour } = require('../config.json');
const { announceAllGuilds } = require('../handleAnnouncements.js');

// The attributes of module.exports can be accessed in other files via require()
module.exports = {
    // Command name and description definition
    data: new SlashCommandBuilder()
        .setName('announce-raffle')
        .setDescription('Send an announcement about a raffle to all servers.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID of the raffle to announce')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('promo_image_url')
                .setDescription('URL of the promo image to display in the announcement embed.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to put in the announcement.')),

    // Define interaction function
    async execute(interaction) {

        const makeAnnouncement = async (i, dbGuild) => {
            // Database attributes
            const pingRoleID = dbGuild.PING_ROLE_ID;

            // Fetch discord objects
            await dbGuild.getDiscordObjects(i.client, dbGuild);
            const guild = dbGuild.guild;
            const channel = dbGuild.channel;
            const role = dbGuild.role;

            // If successfully loaded...
            if (guild && channel && role) {
                const imageURL = i.options.getString('promo_image_url');
                const message = i.options.getString('message');

                // Retrieve raffle and fundraiser data
                const raffle = await Raffles.findOne({ where: { ID: i.options.getString('id') } });
                const fundraiser = await Fundraisers.findOne({ where: { ID: raffle.FUNDRAISER_ID } });

                // Construct announcement
                const embed = new EmbedBuilder()
                    .setColor(embedColour)
                    .setTitle(':tickets: ' + raffle.TITLE + ' :tickets:')
                    .setDescription(`${message}\n\nEnds ${time(raffle.DATE_END, 'R')} (${time(raffle.DATE_END)})`)
                    .addFields(
                        { name: `Fundraising for '${fundraiser.TITLE}'`, value: `${fundraiser.URL}` },
                        { name: `This Fundraiser Supports ${fundraiser.CHARITY}`, value: `${fundraiser.CAUSE} For more information, click the fundraiser link.` },
                        { name: 'Tickets: ', value: `${raffle.NO_OF_TICKETS - raffle.TICKETS_SOLD} remaining, £${raffle.PRICE_PER_TICKET} per ticket` },
                        { name: 'Prizes:', value: `${raffle.PRIZE} (worth £${raffle.PRIZE_COST})` },
                        { name: 'Join raffle here:', value: raffle.URL },
                    )
                    .setImage(imageURL);

                // Send announcement
                try {
                    const announcement = await channel.send({
                        content: `${roleMention(pingRoleID)}`,
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

        await announceAllGuilds(interaction, makeAnnouncement);
    },

    dev: true,
};