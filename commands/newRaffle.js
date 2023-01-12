const { SlashCommandBuilder } = require('discord.js');
const { Raffles, editDatabaseTable, getNewID, constructDatabaseObject } = require('../dbObjects.js');

// The attributes of module.exports can be accessed in other files via require()
module.exports = {
    // Command name and description definition
    data: new SlashCommandBuilder()
        .setName('new-raffle')
        .setDescription('Adds a new raffle to the database (assumes active).')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL to the raffle.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Raffle title.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('prize')
                .setDescription('Raffle prize.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('no_of_tickets')
                .setDescription('Total number of tickets available.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('price_per_ticket')
                .setDescription('Price of 1 ticket. (£)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('fundraiser_id')
                .setDescription('ID of fundraiser this raffle is for')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('prize_cost')
                .setDescription('Cost of the prize (£) (for calculating money going to charity)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('date_start')
                .setDescription('Start date of raffle. Format: [YYYY]-[MM]-[DD]T[HH]:[MM]:[SS]')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('date_end')
                .setDescription('End date of raffle. Format: [YYYY]-[MM]-[DD]T[HH]:[MM]:[SS]')
                .setRequired(true)),

    // Define interaction function
    async execute(interaction) {
        const optionData = await constructDatabaseObject(interaction.options.data);

        // Assumes:
        // Tickets sold = 0
        // Number of participants = 0
        // ID = next available ID
        // Winner = TBD
        // Active = true
        // Replace respective values in the option data
        optionData.ID = await getNewID(Raffles);
        optionData.TICKETS_SOLD = 0;
        optionData.NO_OF_PARTICIPANTS = 0;
        optionData.WINNER = 'TBD';
        optionData.ACTIVE = true;

        if (await editDatabaseTable(Raffles, optionData)) {
            return interaction.reply('Database edit successful.');
        }

        return interaction.reply('Database edit failed.');
    },

    dev: true,
};