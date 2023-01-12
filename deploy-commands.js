const { REST, Routes } = require('discord.js');
const { clientId, devGuildId, token } = require('./config.json');
const filesystem = require('node:fs');
const path = require('node:path');

const commands = [];
const devCommands = [];

// Retrieve commands from files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = filesystem.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Convert all command data to JSON and append to list
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    // Ignore empty files, but give warning
    if (!command.data) {
        console.log(`[WARNING] Empty file ${filePath}`);
        continue;
    }

    // Ignore specified commands for debugging
    if (command.broke) continue;

    // Separate dev only commands from public commands
    if (command.dev) {
        devCommands.push(command.data.toJSON());
    }
    else {
        // Using SlashCommandBuilder#toJSON()
        commands.push(command.data.toJSON());
    }
}

// Construct REST module
const rest = new REST({ version: '10' }).setToken(token);

// Deploy commands
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application slash commands.`);

        // Use PUT to refresh all commands
        // Deploy non-developer (public) commands to all guilds
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application slash commands.`);
    }
    catch (error) {
        console.error(error);
    }


    try {
        console.log(`Started refreshing ${devCommands.length} developer application slash commands.`);

        // Deploy developer commands to only the developer guild
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, devGuildId),
            { body: devCommands },
        );

        console.log(`Successfully reloaded ${data.length} developer application slash commands.`);
    }
    catch (error) {
        console.error(error);
    }
})();


// Function for deploying commands to new guilds while the bot is running
module.exports = {
    async deployDevCommands() {
        try {
            console.log(`Started refreshing ${devCommands.length} developer application slash commands.`);

            // Deploy developer commands to only the developer guild
            const data = await rest.put(
                Routes.applicationGuildCommands(clientId, devGuildId),
                { body: devCommands },
            );

            console.log(`Successfully reloaded ${data.length} developer application slash commands.`);
        }
        catch (error) {
            console.error(error);
        }
    },
};