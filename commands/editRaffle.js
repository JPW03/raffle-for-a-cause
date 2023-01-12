const { SlashCommandBuilder } = require('discord.js');
const { Raffles, editDatabaseTable, constructDatabaseObject } = require('../dbObjects.js');

// The attributes of module.exports can be accessed in other files via require()
module.exports = {
    // Command name and description definition
    data: new SlashCommandBuilder()
        .setName('edit-raffle')
        .setDescription('Add/edit any server entry in the database.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID of the raffle to edit')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL to the raffle.'))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Raffle title.'))
        .addStringOption(option =>
            option.setName('active')
                .setDescription('Whether the raffle is still active or not'))
        .addStringOption(option =>
            option.setName('prize')
                .setDescription('Raffle prize.'))
        .addStringOption(option =>
            option.setName('no_of_participants')
                .setDescription('Number of raffle participants.'))
        .addStringOption(option =>
            option.setName('no_of_tickets')
                .setDescription('Total number of tickets available.'))
        .addStringOption(option =>
            option.setName('price_per_ticket')
                .setDescription('Price of 1 ticket.'))
        .addStringOption(option =>
            option.setName('tickets_sold')
                .setDescription('Number of tickets sold.'))
        .addStringOption(option =>
            option.setName('winner')
                .setDescription('Discord user ID of the winner'))
        .addStringOption(option =>
            option.setName('fundraiser_id')
                .setDescription('ID of fundraiser this raffle is for'))
        .addStringOption(option =>
            option.setName('prize_cost')
                .setDescription('Cost of the prize (for calculating money going to charity)'))
        .addStringOption(option =>
            option.setName('date_start')
                .setDescription('Start date of raffle.'))
        .addStringOption(option =>
            option.setName('date_end')
                .setDescription('End date of raffle.')),

    // Define interaction function
    async execute(interaction) {

        if (await editDatabaseTable(Raffles, constructDatabaseObject(interaction.options.data))) {
            return interaction.reply('Database edit successful.');
        }

        return interaction.reply('Database edit failed.');
    },

    dev: true,
};