const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un usuario del servidor.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario a banear')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('razon')
                .setDescription('Razón del baneo')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'No se especificó ninguna razón.';
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: '❌ Ese usuario no está en este servidor.', ephemeral: true });
        }

        if (!member.bannable) {
            return interaction.reply({ content: '❌ No puedo banear a este usuario. ¿Tiene un rol más alto que el mío?', ephemeral: true });
        }

        try {
            await member.ban({ reason: reason });
            await interaction.reply({ content: `✅ **${user.tag}** ha sido baneado con éxito.\n**Razón:** ${reason}` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Hubo un error al intentar banear al usuario.', ephemeral: true });
        }
    },
};

