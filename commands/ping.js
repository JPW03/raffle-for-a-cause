// Definition for the /ping command

// Require the slash command constructor from discord.js
const { SlashCommandBuilder } = require('discord.js');

// The attributes of module.exports can be accessed in other files via require()
module.exports = {
    // Command name and description definition
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),

    // Define interaction function
    async execute(interaction) {
        await interaction.reply('Pong!');
    },

    dev: true,
};