const { SlashCommandBuilder, roleMention, EmbedBuilder, time } = require('discord.js');
const { JoinedGuilds, Raffles, Fundraisers } = require('../dbObjects.js');
const { embedColour, botIconURL } = require('../config.json');
const { log } = require('../utilities.js');

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
                .setRequired(true)),

    // Define interaction function
    async execute(interaction) {
        await interaction.deferReply();

        const dbGuilds = await JoinedGuilds.findAll();
        const client = interaction.client;

        // Instantiate list of failed guilds
        const failedGuilds = [];

        for (const dbGuild of dbGuilds) {
            // Database attributes
            const announcementsID = dbGuild.ANNOUNCEMENTS_CHANNEL_ID;
            const pingRoleID = dbGuild.PING_ROLE_ID;
            const guildID = dbGuild.ID;

            // Fetch discord objects
            let guild, channel, role;
            try {
                guild = await client.guilds.fetch(guildID);
                channel = await guild.channels.fetch(dbGuild.ANNOUNCEMENTS_CHANNEL_ID);
                role = await guild.roles.fetch(dbGuild.PING_ROLE_ID);
            }
            catch {
                failedGuilds.push(guildID);
                if (!guild) {
                    log(`Couldn't fetch guild ${guildID} from client. Bot possibly kicked from guild.`);
                }
                if (!channel) {
                    log(`Couldn't fetch channel ${announcementsID} in ${guild.name} (${guildID}). Deleted channel?`);
                }
                if (!role) {
                    log(`Couldn't fetch channel ${pingRoleID} in ${guild.name} (${guildID}). Deleted channel?`);
                }
            }

            // If successfully loaded...
            if (guild && channel && role) {
                const imageURL = interaction.options.getString('promo_image_url');

                // Retrieve raffle and fundraiser data
                const raffle = await Raffles.findOne({ where: { ID: interaction.options.getString('id') } });
                const fundraiser = await Fundraisers.findOne({ where: { ID: raffle.FUNDRAISER_ID } });

                // Construct announcement
                const embed = new EmbedBuilder()
                    .setColor(embedColour)
                    .setTitle(':tickets:' + raffle.TITLE + ':tickets:')
                    .setURL(raffle.URL)
                    .addFields(
                        { name: 'Fundraiser:', value: `'${fundraiser.TITLE}'\n${fundraiser.URL}` },
                        { name: `This Fundraiser Supports ${fundraiser.CHARITY}`, value: `${fundraiser.CAUSE} For more information, click the fundraiser link.` },
                        { name: 'Tickets: ', value: `${raffle.NO_OF_TICKETS - raffle.TICKETS_SOLD} remaining, £${raffle.PRICE_PER_TICKET} per ticket` },
                        { name: 'Prizes:', value: `${raffle.PRIZE} (worth £${raffle.PRIZE_COST})` },
                    )
                    .setDescription(`Raffle ends: ${time(raffle.DATE_END, 'R')} (${time(raffle.DATE_END)})`)
                    .setThumbnail(botIconURL)
                    .setImage(imageURL);

                // Send announcement
                try {
                    await channel.send({
                        content: `${roleMention(pingRoleID)}`,
                        embeds: [embed],
                    });
                }
                catch (error) {
                    console.error(error);
                }
            }
        }

        if (failedGuilds.length == 0) {
            log('All raffle announcements sent successfully.');
            return await interaction.editReply('All messages sent successfully.');
        }
        else {
            log(`Raffle announcements sent, except announcement failed in servers: ${failedGuilds}`);
            let message = 'Messages sent.\nSome messages failed to send in guilds:';
            for (const id of failedGuilds) {
                message += `\n${id}`;
            }
            return await interaction.editReply(message);
        }
    },

    dev: true,
};