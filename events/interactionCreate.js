const { Events, roleMention } = require('discord.js');
const { log } = require('../utilities.js');
const { JoinedGuilds } = require('../dbObjects.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        console.log(interaction);

        // Check if the interaction is with a role assignment message
        if (interaction.isButton() && interaction.customId.startsWith('role_')) {
            const guildId = interaction.guildId;

            // Variables for logs
            const guildName = interaction.member.guild.name;
            const username = interaction.user.username;

            log(`Assigning/Unassigning ping role from ${username} in '${guildName}'`);

            // Get GuildMemberRoleManager object of user to assign role to
            const userRoleManager = interaction.member.roles;

            // Lookup the ping role of the server
            let pingRole;
            try {
                const guildInDB = await JoinedGuilds.findOne({ where: { ID: guildId } });
                pingRole = guildInDB.PING_ROLE_ID;
            }
            catch {
                interaction.reply({
                    content: 'Error: Could not find role in database. Ask server admins to complete the bot setup command.',
                    ephemeral: true,
                });
                log(`Failed to find PingRole for guild ${guildId} ('${guildName}')`);
                return;
            }

            // Check if the user already has the role
            if (userRoleManager.cache.has(pingRole)) {

                // Remove the role if the user already has it.
                try {
                    await userRoleManager.remove(pingRole);
                }
                catch {
                    interaction.reply({
                        content: 'Error: Could not unassign role. Unknown reason.',
                        ephemeral: true,
                    });
                    log(`Failed to unassign PingRole from ${username} in '${guildName}'`);
                    return;
                }

                // Give feedback that role was added
                interaction.reply({
                    content: `You have been unassigned the ${roleMention(pingRole)} role`,
                    ephemeral: true,
                });
                log(`Successfully unassigned ping role from ${username} in '${guildName}'`);
            }
            else {
                // Add role to user
                try {
                    await userRoleManager.add(pingRole);
                }
                catch (error) {
                    console.error(error);
                    interaction.reply({
                        content: 'Error: Could not assign role. Role may have been deleted. Ask your server admins.',
                        ephemeral: true,
                    });
                    log(`Failed to assign PingRole to ${username} in '${guildName}'`);
                    return;
                }

                // Give feedback that role was added
                interaction.reply({
                    content: `You have been assigned the ${roleMention(pingRole)} role`,
                    ephemeral: true,
                });
                log(`Successfully assigned ping role to ${username} in '${guildName}'`);
            }
            return;
        }

        if (!interaction.isChatInputCommand()) return;

        // Check for a matching command
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        // If there is a matching command, execute it
        try {
            // Message if command in guild
            log(`User '${interaction.user.username}' executing /${interaction.commandName} in guild '${ (!interaction.member) ? 'DMs' : (interaction.member.guild.name) }'`);
            await command.execute(interaction);
        }
        catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while executing this command.',
                ephemeral: true,
            });
        }
    },
};
