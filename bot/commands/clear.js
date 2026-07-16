const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../../web/server.js'); // Usamos la misma DB compartida

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Añade una advertencia a un usuario.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario a advertir')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('razon')
                .setDescription('Razón de la advertencia')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'No se especificó ninguna razón.';
        const guildId = interaction.guild.id;

        if (user.bot) {
            return interaction.reply({ content: '❌ No puedes advertir a un Bot.', ephemeral: true });
        }

        // Obtener historial actual del servidor o inicializar
        const path = `guilds.${guildId}.warnings.${user.id}`;
        let userWarns = db.get(path).value() || [];

        const newWarn = {
            id: Date.now().toString(36), // ID único para poder removerlo luego si se quiere
            moderator: interaction.user.tag,
            reason: reason,
            date: new Date().toLocaleDateString()
        };

        userWarns.push(newWarn);
        db.set(path, userWarns).write();

        await interaction.reply({ 
            content: `⚠️ **${user.tag}** ha recibido una advertencia.\n**Razón:** ${reason}\n*Total acumulado:* **${userWarns.length} advertencia(s).**` 
        });
    },
};

