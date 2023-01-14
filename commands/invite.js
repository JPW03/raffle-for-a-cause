// Definition for the /invite command

const { SlashCommandBuilder } = require('discord.js');
const { inviteURL } = require('../config.json');

module.exports = {
    // Command name and description
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Returns the link for inviting the bot to other servers.'),

    // Define interaction function
    async execute(interaction) {
        await interaction.reply({ content: `Thank you so much for considering inviting me to another server!\n\nBot Invite Link: ${inviteURL}\n\nJust add the bot to your server, and use the /setup in that server to get started.`, ephemeral: true });
    },
};