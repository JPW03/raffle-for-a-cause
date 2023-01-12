const { SlashCommandBuilder, codeBlock } = require('discord.js');
const { Raffles, listTable } = require('../dbObjects.js');
const { messageLimitSplit } = require('../utilities.js');

module.exports = {
    // Command name and description
    data: new SlashCommandBuilder()
        .setName('list-raffles')
        .setDescription('List all the raffles in the database.'),

    // Define interaction function
    async execute(interaction) {
        await messageLimitSplit(interaction, await listTable(Raffles), codeBlock);
    },

    dev: true,
};