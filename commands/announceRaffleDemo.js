const { SlashCommandBuilder, roleMention, time } = require('discord.js');
const { JoinedGuilds, Raffles, Fundraisers } = require('../dbObjects.js');
const { log, templateAnnouncementEmbed } = require('../utilities.js');

// The attributes of module.exports can be accessed in other files via require()
module.exports = {
    // Command name and description definition
    data: new SlashCommandBuilder()
        .setName('announce-raffle-demo')
        .setDescription('Send an announcement about a raffle to the same channel as command.')
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
        await interaction.deferReply();

        const thisGuildDB = await JoinedGuilds.findOne({ where: { ID: interaction.guild.id } });
        const pingRoleID = thisGuildDB.PING_ROLE_ID;

        // ====== START COPY-PASTE TO announceRaffle.js ======

        // If successfully loaded...
        const imageURL = interaction.options.getString('promo_image_url');
        const message = interaction.options.getString('message');

        // Retrieve raffle and fundraiser data
        const raffle = await Raffles.findOne({ where: { ID: interaction.options.getString('id') } });
        const fundraiser = await Fundraisers.findOne({ where: { ID: raffle.FUNDRAISER_ID } });

        // Construct announcement
        const embed = templateAnnouncementEmbed()
            .setTitle(':tickets: ' + raffle.TITLE + ' :tickets:')
            .setURL(raffle.URL)
            .setDescription(`${message}\n\nClick the link in the title if you are interested!\n\nEnds ${time(raffle.DATE_END, 'R')} (${time(raffle.DATE_END)})`)
            .addFields(
                { name: 'Fundraiser:', value: `'${fundraiser.TITLE}'\n${fundraiser.URL}` },
                { name: `This Fundraiser Supports ${fundraiser.CHARITY}`, value: `${fundraiser.CAUSE} For more information, click the fundraiser link.` },
                { name: 'Tickets: ', value: `${raffle.NO_OF_TICKETS - raffle.TICKETS_SOLD} remaining, £${raffle.PRICE_PER_TICKET} per ticket`, inline: true },
                { name: 'Prizes:', value: `${raffle.PRIZE} (worth £${raffle.PRIZE_COST})`, inline: true },
            )
            .setImage(imageURL);

        // Send announcement
        try {
            await interaction.editReply({
                content: `${roleMention(pingRoleID)}`,
                embeds: [embed],
            });
            log('Announcement test sent');
        }
        catch (error) {
            console.error(error);
            interaction.reply('Unable to send test announcement.');
        }

        // ====== END COPY-PASTE TO announceRaffle.js ======
    },

    dev: true,
};