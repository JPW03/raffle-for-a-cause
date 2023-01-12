const Sequelize = require('sequelize');
const { log } = require('./utilities.js');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

// Define relations between database objects
const Raffles = require('./models/raffle.js')(sequelize, Sequelize.DataTypes);
const Fundraisers = require('./models/fundraiser.js')(sequelize, Sequelize.DataTypes);
const JoinedGuilds = require('./models/server.js')(sequelize, Sequelize.DataTypes);

// Table related functions
// Reflect.defineProperty(JoinedGuilds.prototype, 'getDiscordObjects', {
// 	value: async (client, entry, guild, channel, role) => {
// 		try {
// 			guild = await client.guilds.fetch(entry.ID);

// 			try {
// 				channel = await guild.channels.fetch(entry.ANNOUNCEMENTS_CHANNEL_ID);
// 			}
// 			catch {
// 				log(`Couldn't fetch channel ${entry.ANNOUNCEMENTS_CHANNEL_ID} in ${guild.name} (${entry.ID}). Deleted channel?`);
// 			}

// 			try {
// 				role = await guild.roles.fetch(entry.PING_ROLE_ID);
// 			}
// 			catch {
// 				log(`Couldn't fetch channel ${entry.} in ${guild.name} (${guildID}). Deleted channel?`);
// 			}
// 		}
// 		catch {
// 			log(`Couldn't fetch guild ${guildID} from client. Bot possibly kicked from guild.`);
// 		}
// 	},
// });

// Link property Fundraiser to Raffle where the ID of the
//  Fundraiser is the FundraiserID of the Raffle
Raffles.belongsTo(Fundraisers, { foreignKey: 'FUNDRAISER_ID', as: 'Fundraiser' });

// Use this file to access each model
module.exports = { Raffles, Fundraisers, JoinedGuilds,

	// For commands that edit/insert values in database tables
	// Returns true if successful, false if error occurred
	async editDatabaseTable(table, dbObject) {
		console.log(dbObject);

        // Update/insert data into database
		try {
			const original = await table.findOne({ where: { ID: dbObject.ID } });

			if (original) {
				log(`Updating entry. ID = ${dbObject.ID}`);
				const ID = dbObject.ID;
				delete dbObject.ID;
				await table.update(dbObject, { where: { ID: ID } });
			}
			else {
				log(`Creating new entry. ID = ${dbObject.ID}`);
				await table.create(dbObject);
			}

			return true;
		}
		catch (error) {
			console.error(error);
			return false;
		}
    },

	constructDatabaseObject(commandOptionData) {
		const dbObject = {};

        // Loop through each option
        for (const option of commandOptionData) {
            // Convert option name to upper case to match DB
            const name = option.name.toUpperCase();

            // Append the option to the object
            dbObject[name] = option.value;
        }

		return dbObject;
	},

	async deleteEntry(table, id) {
        if (id == 'null') id = null;

        const removedRows = await table.destroy({ where: { ID: id } });

        if (!removedRows) return 'ID not found.';

        return `Removed ${removedRows} entry from database.`;
	},

	async listTable(table) {
		const entryList = await table.findAll();

        // For technically detailed list:
        console.log(entryList);

        const stringList = await Promise.all(entryList.map(async entry => {
            let string = '';
            for (const property in entry.dataValues) {
				if (property !== 'createdAt' && property !== 'updatedAt') {
					string += `${property}: "${entry[property]}", \n`;
				}
            }
			string += '\n';
            return string;
        }));

        const stringFull = stringList.join('\n') || 'No entries found.';

		return stringFull;
	},

	async getNewID(table) {
		// Generates next numerical ID for a table
		const entryList = await table.findAll();

		return entryList.length + 1;
	},
};