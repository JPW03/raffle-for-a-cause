module.exports = (sequelize, DataTypes) => {
    return sequelize.define('servers', {
        ID: {
            type: DataTypes.STRING,
            primaryKey: true,
            // Primary keys are automatically unique and not null
        },
        ANNOUNCEMENTS_CHANNEL_ID: DataTypes.STRING,
        PING_ROLE_ID: DataTypes.STRING,
    });
};