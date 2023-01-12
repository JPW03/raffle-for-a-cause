const { SlashCommandBuilder } = require('discord.js');
const { Raffles, deleteEntry } = require('../dbObjects.js');

module.exports = {
    // Command name and description
    data: new SlashCommandBuilder()
        .setName('remove-raffle')
        .setDescription('Remove raffle from database.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID of the raffle.')
                .setRequired(true)),

    // Define interaction function
    async execute(interaction) {
        await interaction.reply(await deleteEntry(Raffles, interaction.options.getString('id')));
    },

    dev: true,
};