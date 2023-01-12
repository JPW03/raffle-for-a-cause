const { SlashCommandBuilder } = require('discord.js');
const { Fundraisers, deleteEntry } = require('../dbObjects.js');

module.exports = {
    // Command name and description
    data: new SlashCommandBuilder()
        .setName('remove-fundraiser')
        .setDescription('Remove fundraiser from database.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID of the fundraiser.')
                .setRequired(true)),

    // Define interaction function
    async execute(interaction) {
        await interaction.reply(await deleteEntry(Fundraisers, interaction.options.getString('id')));
    },

    dev: true,
};