// File for various functions used accross the program

module.exports = {

    // For logging bot activity to the console with timestamps
    log(string) {
        const date_time = new Date();

        // get current date
        const date = ('0' + date_time.getDate()).slice(-2);

        // Pads 0 to single digit dates/times
        const padZero = (n) => ('0' + (n)).slice(-2);

        const month = padZero(date_time.getMonth() + 1);
        const year = date_time.getFullYear();
        const hours = padZero(date_time.getHours());
        const minutes = padZero(date_time.getMinutes());
        const seconds = padZero(date_time.getSeconds());

        // Add date & time in YYYY-MM-DD HH:MM:SS format to output string
        string = ('[' + year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds + '] ') + string;

        // Output to console
        console.log(string);

        // Output to log file?
    },

    refreshCommands(client) {
        const filesystem = require('node:fs');
        const path = require('node:path');

        // Retrieve commands
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = filesystem.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        console.log('Loading commands...');

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            // Store command in commands with command name as the ID, and the whole module as the value
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`/${command.data.name}`);
            }
            else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }

        console.log('Commands loaded.\n');
    },

    async messageLimitSplit(interaction, string,
        wrapper = (str) => str) {
        // Maximum message length for a bot is 2000 characters
        // If above limit, split string into multiple messages

        // wrapper = optional function to wrap message string around
        // e.g. codeBlock()
        // If no wrapper provided, defaults to returning unchanged string

        const length = string.length;
        const nOfMessages = length / 2000;

        // Send first message as reply
        let start = 0;
        let end = (length > 2000) ? 2000 : length;
        let message = wrapper(string.substring(start, end));

        await interaction.reply(message);

        // Send rest of messages as followups
        for (let s = 1; s < nOfMessages; s++) {
            start = s * 2000;
            end = (length > (2000 * (s + 1))) ?
                2000 * (s + 1) :
                length;
            message = wrapper(string.substring(start, end));

            await interaction.followUp(message);
        }
    },
};