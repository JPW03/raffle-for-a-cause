module.exports = (sequelize, DataTypes) => {
    return sequelize.define('raffles', {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            // Primary keys are automatically unique and not null
        },
        URL: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        TITLE: DataTypes.STRING,
        ACTIVE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        PRIZE: DataTypes.STRING,
        NO_OF_PARTICIPANTS: DataTypes.INTEGER,
        NO_OF_TICKETS: DataTypes.INTEGER,
        PRICE_PER_TICKET: DataTypes.DOUBLE,
        TICKETS_SOLD: DataTypes.INTEGER,
        WINNER: DataTypes.STRING,
        FUNDRAISER_ID: DataTypes.INTEGER,
        PRIZE_COST: DataTypes.DOUBLE,
        DATE_START: DataTypes.DATE,
        DATE_END: DataTypes.DATE,
    });
};