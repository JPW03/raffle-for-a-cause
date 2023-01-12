const { SlashCommandBuilder } = require('discord.js');
const { Fundraisers, editDatabaseTable, getNewID, constructDatabaseObject } = require('../dbObjects.js');

// The attributes of module.exports can be accessed in other files via require()
module.exports = {
    // Command name and description definition
    data: new SlashCommandBuilder()
        .setName('edit-fundraiser')
        .setDescription('Add/edit any fundraiser entry in the database.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID of the fundraiser to edit. (Type "new" for next ID)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL to the fundraiser.'))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Fundraiser title.'))
        .addStringOption(option =>
            option.setName('active')
                .setDescription('Whether the fundraiser is still active or not'))
        .addStringOption(option =>
            option.setName('charity')
                .setDescription('The charity the fundraiser supports'))
        .addStringOption(option =>
            option.setName('cause')
                .setDescription('The cause the charity runs for.'))
        .addStringOption(option =>
            option.setName('goal')
                .setDescription('Amount of money the fundraiser aims for.')),

    // Define interaction function
    async execute(interaction) {
        const optionData = await constructDatabaseObject(interaction.options.data);

        // Check if a new ID is requested
        if (optionData.ID === 'new') {
            optionData.ID = await getNewID(Fundraisers);
        }

        if (await editDatabaseTable(Fundraisers, optionData)) {
            return interaction.reply('Database edit successful.');
        }

        return interaction.reply('Database edit failed.');
    },

    dev: true,
};