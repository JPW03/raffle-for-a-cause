module.exports = (sequelize, DataTypes) => {
    return sequelize.define('fundraisers', {
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
        CHARITY: DataTypes.STRING,
        CAUSE: DataTypes.TEXT,
        GOAL: DataTypes.DOUBLE,
    });
};