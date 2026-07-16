const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un usuario del servidor.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario a expulsar')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('razon')
                .setDescription('Razón de la expulsión')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'No se especificó ninguna razón.';
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: '❌ Ese usuario no está en este servidor.', ephemeral: true });
        }

        if (!member.kickable) {
            return interaction.reply({ content: '❌ No puedo expulsar a este usuario. ¿Tiene un rol más alto que el mío?', ephemeral: true });
        }

        try {
            await member.kick(reason);
            await interaction.reply({ content: `✅ **${user.tag}** ha sido expulsado con éxito.\n**Razón:** ${reason}` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Hubo un error al intentar expulsar al usuario.', ephemeral: true });
        }
    },
};

