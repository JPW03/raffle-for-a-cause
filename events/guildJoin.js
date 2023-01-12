const { log } = require('../utilities.js');
const { Events } = require('discord.js');
const { JoinedGuilds } = require('../dbObjects.js');
const { devGuildId } = require('../config.json');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        log(`Joined guild ${guild.name} (ID = ${guild.id})`);

        // For debugging, if joining dev guild, refresh commands
        if (guild.id == devGuildId) {
            const { deployDevCommands } = require('../deploy-commands.js');
            deployDevCommands();
        }

        // Store guild ID in database
        JoinedGuilds.upsert({ ID: guild.id });
    },
};
