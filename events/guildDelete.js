const { log } = require('../utilities.js');
const { Events } = require('discord.js');
const { JoinedGuilds } = require('../dbObjects.js');

module.exports = {
    name: Events.GuildDelete,
    async execute(guild) {
        log(`Left guild ${guild.name} (ID = ${guild.id}), reason: either kicked or server was deleted.`);

        // Store guild ID in database
        try {
            await JoinedGuilds.destroy({ where: { ID: guild.id } });
            log(`Removed guild ${guild.name} from database.`);
        }
        catch (error) {
            log('Couldn\'t remove guild from database. Possible due to a missing entry.');
        }
    },
};
