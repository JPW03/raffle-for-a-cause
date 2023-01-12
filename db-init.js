const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

// Define DB models
require('./models/fundraiser.js')(sequelize, Sequelize.DataTypes);
require('./models/raffle.js')(sequelize, Sequelize.DataTypes);
require('./models/server.js')(sequelize, Sequelize.DataTypes);

// Check if the DB is being reset
const force = process.argv.includes('--hardreset');

sequelize.sync({ force });