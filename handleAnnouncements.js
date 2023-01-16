const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { JoinedGuilds } = require('./dbObjects.js');
const { log } = require('./utilities.js');

module.exports = {

    // Cycles through each guild, calls makeAnnouncement for each guild
    async announceToGuilds(interaction, makeAnnouncement, dbGuilds) {

        // Instantiate list of failed guilds
        const failedGuilds = [];

        // Instantiate list of announcements
        // Announcement = { guild ID, channel ID, message ID }
        const announcements = [];

        for (const dbGuild of dbGuilds) {
            // Send announcement
            let announcementID;
            try {
                // makeAnnouncement must return:
                //  false if announcement not sent
                //  the ID of the announcement message if sent

                announcementID = await makeAnnouncement(
                    interaction,
                    dbGuild,
                );
                console.log(announcementID);

                if (!announcementID) {
                    failedGuilds.push(dbGuild.ID);
                }
                else {
                    announcements.push({
                        guild: dbGuild.ID,
                        channel: dbGuild.ANNOUNCEMENTS_CHANNEL_ID,
                        message: announcementID,
                    });
                }
            }
            catch (error) {
                console.error(error);
                failedGuilds.push(dbGuild.ID);
            }
        }

        // Give feedback
        if (failedGuilds.length == 0) {
            log('All raffle announcements sent successfully.');
            await interaction.editReply('All messages sent successfully.');
        }
        else {
            log(`Raffle announcements sent, except announcement failed in servers: ${failedGuilds}`);
            let message = 'Messages sent.\nSome messages failed to send in guilds:';
            for (const id of failedGuilds) {
                message += `\n${id}`;
            }
            await interaction.editReply(message);
        }

        // Allow retraction of all announcement messages within 10 minutes

        // Time (ms) between interactions after which retraction is impossible
        const timeout = 600000;

        // Add retraction button
        const retractButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('retract')
                .setLabel('Retract all?')
                .setStyle(ButtonStyle.Primary),
        );
        interaction.editReply({ components: [retractButton] });

        // Listener for interactions with the continue button
        const filter = i => i.customId === 'retract' && i.user.id === interaction.user.id;
        const retractCollector = interaction.channel.createMessageComponentCollector({ filter, time: timeout });

        // Time out listener
        retractCollector.on('end', collected => {
            if (collected.size == 0) {
                // Remove retract button
                interaction.editReply({ components: [] });
            }
        });

        // When the button is clicked...
        retractCollector.once('collect', async i => {
            let failMessage = '';

            // Delete each message
            for (const announcement of announcements) {

                let guild;
                try {
                    guild = await i.client.guilds.fetch(announcement.guild);
                    const channel = await guild.channels.fetch(announcement.channel);
                    const message = await channel.messages.fetch(announcement.message);

                    await message.delete();
                    log(`Retracted announcement ${announcement.message} from ${guild.name}.`);
                }
                catch (error) {
                    console.error(error);
                    log(`Failed to retract announcement ${announcement.message} from ${ (!guild) ? announcement.guild : guild.name}`);
                    failMessage += `\n${announcement.message} from ${ (!guild) ? announcement.guild : guild.name}`;
                }

            }

            if (!failMessage) {
                i.reply('All announcements successfully retracted.');
            }
            else {
                i.reply('Retracted announcements.\nFailed to retract:');
            }

            // Remove retract button
            interaction.editReply({ components: [] });
        });
    },

    async announceOneGuild(interaction, makeAnnouncement, guildId) {
        await interaction.deferReply();

        const dbGuildArray = [(await JoinedGuilds.findOne({ where: { ID: guildId } }))];

        const { announceToGuilds } = require('./handleAnnouncements.js');
        announceToGuilds(interaction, makeAnnouncement, dbGuildArray);
    },

    async announceAllGuilds(interaction, makeAnnouncement) {
        await interaction.deferReply();

        const dbGuilds = await JoinedGuilds.findAll();

        const { announceToGuilds } = require('./handleAnnouncements.js');
        announceToGuilds(interaction, makeAnnouncement, dbGuilds);
    },
};