// Dependencies
const { functions: { checkMusic } } = require('../../utils'),
    { ApplicationCommandOptionType } = require('discord.js'),
    Command = require('../../structures/Command.js');

/**
 * remove-last command
 * @extends {Command}
*/
class RemoveLast extends Command {
    /**
     * @param {Client} client The instantiating client
     * @param {CommandData} data The data for the command
    */
    constructor(bot) {
        super(bot, {
            name: 'remove-last',
            guildOnly: true,
            dirname: __dirname,
            aliases: ['rlast', 'rl'],
            description: 'Removes the most recently added song from the queue.',
            usage: 'remove-last',
            cooldown: 3000,
            examples: ['remove-last'],
            slash: true,
        });
    }

    /**
     * Function for receiving message.
     * @param {bot} bot The instantiating client
     * @param {message} message The message that ran the command
     * @readonly
    */
    async run(bot, message, settings) {
        // check to make sure bot can play music based on permissions
        const playable = checkMusic(message.member, bot);
        if (typeof (playable) !== 'boolean') return message.channel.error(playable);

        const player = bot.manager?.players.get(message.guild.id);
        if (!player || !player.queue.length) {
            return message.channel.error(message.translate('music/misc:NO_QUEUE'));
        }

        // Remove the last song in the queue (not the currently playing song)
        const lastIndex = player.queue.length - 1;
        const { title } = player.queue[lastIndex];
        player.queue.splice(lastIndex, 1);

        return message.channel.send(message.translate('music/remove:REMOVED', { TITLE: title }));
    }

    /**
     * Function for receiving interaction.
     * @param {bot} bot The instantiating client
     * @param {interaction} interaction The interaction that ran the command
     * @param {guild} guild The guild the interaction ran in
     * @param {args} args The options provided in the command, if any
     * @readonly
    */
    async callback(bot, interaction, guild, args) {
        const member = guild.members.cache.get(interaction.user.id),
            channel = guild.channels.cache.get(interaction.channelId);

        const playable = checkMusic(member, bot);
        if (typeof (playable) !== 'boolean') {
            return interaction.reply({ embeds: [channel.error(playable, {}, true)], ephemeral: true });
        }

        const player = bot.manager?.players.get(guild.id);
        if (!player || !player.queue.length) {
            return interaction.reply({ content: guild.translate('music/misc:NO_QUEUE') });
        }

        // Remove the last song in the queue (not the currently playing song)
        const lastIndex = player.queue.length - 1;
        const { title } = player.queue[lastIndex];
        player.queue.splice(lastIndex, 1);

        return interaction.reply({ content: guild.translate('music/remove:REMOVED', { TITLE: title }) });
    }
}

module.exports = RemoveLast;