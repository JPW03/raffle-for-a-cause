const { SlashCommandBuilder, roleMention, EmbedBuilder, userMention } = require('discord.js');
const { Raffles, Fundraisers, editDatabaseTable } = require('../dbObjects.js');
const { embedColour } = require('../config.json');
const { announceAllGuilds } = require('../handleAnnouncements.js');
const { log } = require('../utilities.js');

// The attributes of module.exports can be accessed in other files via require()
module.exports = {
    // Command name and description definition
    data: new SlashCommandBuilder()
        .setName('announce-raffle-winner')
        .setDescription('Send an announcement about a raffle winner to all servers.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID of the raffle to announce')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('donation_image_url')
                .setDescription('URL of the donation proof image.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('winner')
                .setDescription('Discord user ID of winner. Leave empty for anonymous'))
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
                const imageURL = i.options.getString('donation_image_url');
                const message = i.options.getString('message');
                const winner = i.options.getString('winner');

                // Retrieve raffle and fundraiser data
                const raffle = await Raffles.findOne({ where: { ID: i.options.getString('id') } });
                const fundraiser = await Fundraisers.findOne({ where: { ID: raffle.FUNDRAISER_ID } });

                // Construct announcement
                const embed = new EmbedBuilder()
                    .setColor(embedColour)
                    .setTitle(':trophy: Winner of ' + raffle.TITLE + ' :trophy:')
                    .setDescription(`${message}`)
                    .setImage(imageURL);

                // If winner wants to be shouted out
                if (winner) {

                    // Check if the winner is in the current server
                    try {
                        await guild.members.fetch(winner);

                        embed.addFields({ name: 'Congrats to our winner!', value: `${userMention(winner)} has won ${raffle.PRIZE}` });
                    }
                    catch {
                        embed.addFields({ name: 'Congrats to our winner!', value: `A user in another server has won ${raffle.PRIZE}` });
                    }
                }
                // If winner wants to stay anonymous
                else {
                    embed.addFields({ name: 'Congrats to our winner!', value: `Anonymous has won ${raffle.PRIZE}` });
                }

                // Add remaining fields
                embed.addFields(
                    { name: 'Tickets Sold: ', value: `${raffle.TICKETS_SOLD} sold in total, that's £${raffle.PRICE_PER_TICKET * raffle.TICKETS_SOLD} raised!\n\nView the raffle here: ${raffle.URL}` },
                    { name: 'See the fundraiser and our donation here:', value: fundraiser.URL },
                );


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


        // Update raffle database entry
        const id = interaction.options.getString('id');
        const winner = interaction.options.getString('winner');

        // If the winner isn't anonymous
        if (winner) {

            const dbRaffle = {
                ID: id,
                WINNER: winner,
            };

            if (await editDatabaseTable(Raffles, dbRaffle)) {
                log(`Winner assigned to raffle ${id}.`);
            }
            else {
                log(`Failed to assign winner ${winner} to raffle ${id}`);
            }

        }

        await announceAllGuilds(interaction, makeAnnouncement);
    },

    dev: true,
};