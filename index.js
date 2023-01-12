// Require necessary node modules
const filesystem = require('node:fs');
const path = require('node:path');

// Require necessary discord.js classes
const { Client, Collection, GatewayIntentBits } = require('discord.js');
    // Collection is an extended version of Map

const { token } = require('./config.json');
const { refreshCommands } = require('./utilities.js');

// Instantiate Client with number of joined Guilds
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Append commands property to client
client.commands = new Collection();

// Retrieve commands
refreshCommands(client);

// Retrieve event listeners
const eventsPath = path.join(__dirname, 'events');
const eventsFiles = filesystem.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

console.log('Loading event listeners...');
for (const file of eventsFiles) {
    const filePath = path.join(eventsPath, file);
    const eventListener = require(filePath);

    if ('name' in eventListener && 'execute' in eventListener) {
        if (eventListener.once) {
            client.once(eventListener.name, (...args) => eventListener.execute(...args));
        }
        else {
            client.on(eventListener.name, (...args) => eventListener.execute(...args));
        }
    }
    else {
        console.log(`[WARNING] The event listener at ${filePath} is missing a required "name" or "execute" property.`);
    }
}
console.log(`Event listeners loaded.
`);

// Log the bot onto Discord
client.login(token);