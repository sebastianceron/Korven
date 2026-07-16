const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Desbanea a un usuario utilizando su ID.')
        .addStringOption(option => 
            option.setName('id')
                .setDescription('La ID de Discord del usuario a desbanear')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const userId = interaction.options.getString('id');

        try {
            await interaction.guild.members.unban(userId);
            await interaction.reply({ content: `✅ El usuario con ID **${userId}** ha sido desbaneado correctamente de este servidor.` });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ No se pudo desbanear al usuario. Verifica que la ID sea correcta o que el usuario realmente esté baneado.', ephemeral: true });
        }
    },
};

