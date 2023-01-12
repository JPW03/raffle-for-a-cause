const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    // Only need to specify once if true, intepreted as false if not mentioned
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}
        `);
    },
};