const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../../web/server.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Remueve la última advertencia de un usuario.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario al que quitar la advertencia')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const guildId = interaction.guild.id;

        const path = `guilds.${guildId}.warnings.${user.id}`;
        let userWarns = db.get(path).value() || [];

        if (userWarns.length === 0) {
            return interaction.reply({ content: `❌ **${user.tag}** no tiene advertencias en este servidor.`, ephemeral: true });
        }

        // Quitamos la última advertencia agregada
        const removed = userWarns.pop();
        db.set(path, userWarns).write();

        await interaction.reply({ 
            content: `✅ Se ha removido una advertencia de **${user.tag}**.\n**Detalle eliminado:** "${removed.reason}" (puesta por ${removed.moderator})\n*Restantes:* **${userWarns.length}**` 
        });
    },
};

