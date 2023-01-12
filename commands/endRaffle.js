const { SlashCommandBuilder } = require('discord.js');
const { Raffles, editDatabaseTable, constructDatabaseObject } = require('../dbObjects.js');

// The attributes of module.exports can be accessed in other files via require()
module.exports = {
    // Command name and description definition
    data: new SlashCommandBuilder()
        .setName('end-raffle')
        .setDescription('Add/edit any server entry in the database.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID of the raffle to edit')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('no_of_participants')
                .setDescription('Number of raffle participants.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tickets_sold')
                .setDescription('Number of tickets sold.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('winner')
                .setDescription('Discord user ID of the winner')
                .setRequired(true)),

    // Define interaction function
    async execute(interaction) {
        const optionData = await constructDatabaseObject(interaction.options.data);

        // Deactivate raffle
        optionData.ACTIVE = false;

        if (await editDatabaseTable(Raffles, optionData)) {
            return interaction.reply('Database edit successful.');
        }

        return interaction.reply('Database edit failed.');
    },

    dev: true,
};