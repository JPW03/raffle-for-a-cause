const { SlashCommandBuilder, codeBlock } = require('discord.js');
const { Fundraisers, listTable } = require('../dbObjects.js');
const { messageLimitSplit } = require('../utilities.js');

module.exports = {
    // Command name and description
    data: new SlashCommandBuilder()
        .setName('list-fundraisers')
        .setDescription('List all the fundraisers in the database.'),

    // Define interaction function
    async execute(interaction) {
        await messageLimitSplit(interaction, await listTable(Fundraisers), codeBlock);
    },

    dev: true,
};