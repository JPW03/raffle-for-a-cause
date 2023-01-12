// Definition for the /addServer command

const { SlashCommandBuilder } = require('discord.js');
const { JoinedGuilds, editDatabaseTable, constructDatabaseObject } = require('../dbObjects.js');

// The attributes of module.exports can be accessed in other files via require()
module.exports = {
    // Command name and description definition
    data: new SlashCommandBuilder()
        .setName('edit-server')
        .setDescription('Add/edit any server entry in the database.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID of the server to edit')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('announcements_channel_id')
                .setDescription('ID of the text channel for bot announcements.'))
        .addStringOption(option =>
            option.setName('ping_role_id')
                .setDescription('ID of the ping role.')),

    // Define interaction function
    async execute(interaction) {

        if (await editDatabaseTable(JoinedGuilds, constructDatabaseObject(interaction.options.data))) {
            return interaction.reply('Database edit successful.');
        }

        return interaction.reply('Database edit failed.');
    },

    dev: true,
};