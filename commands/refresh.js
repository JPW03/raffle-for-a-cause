// Definition for the /refresh command

const { SlashCommandBuilder } = require('discord.js');
const { refreshCommands } = require('../utilities.js');

// The attributes of module.exports can be accessed in other files via require()
module.exports = {
    // Command name and description definition
    data: new SlashCommandBuilder()
        .setName('refresh')
        .setDescription('Refreshes the functions of each command.'),

    // Define interaction function
    async execute(interaction) {

        refreshCommands(interaction.client);

        await interaction.reply({
            content: 'Commands refreshed',
            ephemeral: true,
        });
    },

    dev: true,
};

// DOESNT WORK DOESNT WORK DOESNT WORK DOESNT WORK DOESNT WORK DOESNT WORK DOESNT WORK DOESNT WORK DOESNT WORK DOESNT WORK DOESNT WORK DOESNT WORK