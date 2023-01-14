// Definition for the /setup command

const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, EmbedBuilder, roleMention, channelMention, userMention } = require('discord.js');
const { JoinedGuilds } = require('../dbObjects.js');
const { embedColour } = require('../config.json');
const { log } = require('../utilities.js');

// The attributes of module.exports can be accessed in other files via require()
module.exports = {
    // Command name and description definition
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Run this command after the bot has been added to the server.')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    // Define interaction function
    async execute(interaction) {

        const guildId = interaction.guildId;
        const guildInDB = (await JoinedGuilds.findOne({ where: { ID: guildId } })).dataValues;

        // Fetch guild object (for calling name in messages)
        const guild = await interaction.client.guilds.fetch(guildId);

        // Fetch bot role (for mentions using ID later)
        const botInGuild = await guild.members.fetchMe();
        const botRole = await botInGuild.roles.botRole;

        // Time (ms) between interactions after which the setup is automatically cancelled
        const timeout = 60000;
        // Call this function when a timeout is activated
        const timeoutFunction = () => {
            embed.setDescription(embed.data.description + `\n\nSetup timed out (${timeout / 1000}s), try again.`);

            // Remove interactive elements from message and update embed.
            interaction.editReply({ components: [], embeds: [embed] });

            log(`'${guild.name}' /setup timed out.`);
        };

        // Create continue button
        const continueButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('continue')
                .setLabel('Continue?')
                .setStyle(ButtonStyle.Primary),
        );

        // Create message embed (encases the message into an embed)
        const embed = new EmbedBuilder()
            .setColor(embedColour)
            .setTitle(':heart: Thank you for adding Raffle For A Cause to your server!')
            .setDescription(`This bot will use a specified announcements channel to announce new raffles and winners. A message will be sent allowing users to assign themselves a ping role.\n\nPlease create this announcements channel (if it isn't already created). Ensure this channel allows the role ${roleMention(botRole.id)} to send messages.\n\nPress 'Continue?' when the channel is created.`);

        // Add warning to embed if the server is already setup
        if (guildInDB.ANNOUNCEMENTS_CHANNEL_ID && guildInDB.PING_ROLE_ID) {
            embed.setDescription(embed.data.description + '\n\n**WARNING:**\nThis server is already setup. Completing the setup again will reassign the announcements channel and send a new role ping message. (The ping role will not be re-created)');
        }

        await interaction.reply({
            embeds: [embed],
            components: [continueButton],
        });


        // Listener for interactions with the continue button
        const filter1 = i => i.customId === 'continue' && i.user.id === interaction.user.id;
        const continueCollector = interaction.channel.createMessageComponentCollector({ filter1, time: timeout });

        // Time out listener
        continueCollector.on('end', collected => {
            if (collected.size == 0) {
                timeoutFunction();
            }
        });

        // When the button is clicked...
        continueCollector.once('collect', async i => {
            embed.setDescription('  ').setTitle('Please select the announcements channel for raffles.');

            const channelSelect = await new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder({
                    custom_id: 'channel',
                    placeholder: 'Select channel...',
                }),
            );

            // Update previous message with a channel selection drop-down menu.
            i.update({ components: [channelSelect], embeds: [embed] });

            // Listener for channel selection
            const filter2 = i2 => i2.customId === 'channel' && i2.user.id === interaction.user.id;
            const channelCollector = i.channel.createMessageComponentCollector({ filter2, time: timeout });

            // Time out listener
            channelCollector.on('end', collected => {
                if (collected.size == 0) {
                    timeoutFunction();
                }
            });

            // When a channel is selected
            channelCollector.once('collect', async i2 => {
                const channelId = i2.values[0];
                const channel = await guild.channels.fetch(channelId);

                embed.setTitle(`Announcement channel selected: #${channel.name}`);
                // Can't use channelMention in the title of embed
                embed.setDescription('Creating ping role...');

                // Reply to previous message with the channel selection drop-down menu.
                interaction.editReply({ components: [], embeds: [embed] });

                // Add channel to DB object
                guildInDB.ANNOUNCEMENTS_CHANNEL_ID = channelId;

                // Check if the ping role doesn't already exist
                let pingRole;
                if (guildInDB.PING_ROLE_ID) {
                    // Check if the ID in the database matches an existing role
                    try {
                        pingRole = await guild.roles.fetch(guildInDB.PING_ROLE_ID);
                        log(`Found role ${guildInDB.PING_ROLE_ID} (${pingRole.name}) in DB and in server.`);
                    }
                    catch {
                        log(`Found role ${guildInDB.PING_ROLE_ID} in DB but not in server. Possibly deleted.`);
                    }
                }

                if (!pingRole) {
                    // Create ping role
                    try {
                        pingRole = await guild.roles.create();

                        await pingRole.setName('Raffle Pings');
                        await pingRole.setColor(embedColour);
                        await pingRole.setPermissions(0n);

                        log(`Created role '${pingRole.name}' in '${guild.name}'.`);

                        embed.setDescription(`Role created. ${roleMention(pingRole.id)}\n\nSending role assignment message...`);
                        interaction.editReply({ embeds: [embed] });

                        // Add ping role to DB object
                        guildInDB.PING_ROLE_ID = pingRole.id;
                    }
                    catch (error) {
                        console.error(error);

                        embed.setTitle(':skull: Error');
                        embed.setDescription(`Unable to create ping role.\nDouble check the role ${roleMention(botRole.id)} has 'Manage Roles' permission enabled.`);
                        interaction.editReply({ embeds: [embed] });

                        // Delete the role if it did get created.
                        if (pingRole) {
                            await pingRole.delete();
                        }

                        return;
                    }
                }

                embed.setTitle(':exclamation: Raffle For A Cause :exclamation:')
                    .setDescription('Do you like winning prizes? Do you like donating to a good cause? Of course you do, and that\'s what Raffle For A Cause is all about!\n\nWe are a group of university students hosting online raffles to support charity fundraisers, which are promoted in this channel in this server by this bot.\n')
                    .addFields(
                        { name: 'Want to be notified when raffles start or the winner is chosen?', value: `Press the button to assign/unassign ${roleMention(pingRole.id)}.` },
                    );

                const roleButton = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('role_' + guildId)
                        .setEmoji('🎟️')
                        .setStyle(ButtonStyle.Primary),
                );

                // Send role ping message
                try {
                    await channel.send({
                        components: [roleButton],
                        embeds: [embed],
                    });
                }
                catch (error) {
                    console.error(error);
                    log(`'${guild.name}' /setup: Failed to send role message. Likely due to missing permissions for the bot role in #${channel.name}.`);

                    embed.setTitle(':skull: Error');
                    embed.setDescription(`Unable to send role assignment message.\nDouble check that ${channelMention(channelId)} has 'Send Messages' enabled for the role ${roleMention(botRole.id)}`);
                    embed.spliceFields(0, 1);
                    interaction.editReply({ embeds: [embed] });

                    // Delete the role (only if this is the first setup)
                    if (!guildInDB.PING_ROLE_ID) {
                        await pingRole.delete();
                    }

                    return;
                }

                // Update guild in DB
                await JoinedGuilds.update(guildInDB, { where: { ID: guildId } });

                const emojiGreenTick = ':white_check_mark:';
                // formatEmoji('✅');
                embed.setTitle(`${emojiGreenTick} Set up complete! ${emojiGreenTick}`);
                embed.setDescription(`Thank you for adding ${userMention(botInGuild.id)} to your server. :heart:\n\nBy simply adding me to your server, you are helping charity fundraisers promote themselves, raise money and hopefully make a difference to someone in need.\n\nConsider sharing the bot to other servers to further support our fundraiers! Use '/invite' to obtain the bot's invite link.\nA message has been sent in ${channelMention(channelId)} allowing users to assign/unassign ${roleMention(pingRole.id)}. It's recommended you pin this message to the channel so it's easier to access.`);
                embed.spliceFields(0, 1);
                await interaction.editReply({ embeds: [embed] });
            });
        });
    },
};