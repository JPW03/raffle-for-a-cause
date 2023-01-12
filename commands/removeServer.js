// Definition for the /remove-server command

const { SlashCommandBuilder } = require('discord.js');
const { JoinedGuilds, deleteEntry } = require('../dbObjects.js');

module.exports = {
    // Command name and description
    data: new SlashCommandBuilder()
        .setName('remove-server')
        .setDescription('Remove server from database.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID of the server.')
                .setRequired(true)),

    // Define interaction function
    async execute(interaction) {
        await interaction.reply(await deleteEntry(JoinedGuilds, interaction.options.getString('id')));
    },

    dev: true,
};