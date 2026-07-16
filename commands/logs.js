const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Configura el canal de registros (logs) de moderación')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Solo para Administradores
        .addSubcommand(subcommand =>
            subcommand
                .setName('establecer')
                .setDescription('Establece el canal para enviar los logs de moderación')
                .addChannelOption(option =>
                    option
                        .setName('canal')
                        .setDescription('El canal de texto donde se enviarán los logs')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('desactivar')
                .setDescription('Desactiva el envío de logs de moderación')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        // Ruta del archivo de configuración del servidor (guardamos en la base de datos local JSON que ya usas)
        const dbPath = path.join(__dirname, `../data/guilds/${guildId}.json`); 
        
        // Cargar los datos actuales o crear un objeto vacío
        let guildData = {};
        if (fs.existsSync(dbPath)) {
            try {
                guildData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            } catch (e) {
                console.error("Error al leer la base de datos:", e);
            }
        }

        if (subcommand === 'establecer') {
            const canal = interaction.options.getChannel('canal');

            // Validar que sea un canal de texto
            if (!canal.isTextBased()) {
                return interaction.reply({ 
                    content: '❌ Por favor, selecciona un canal de texto válido.', 
                    ephemeral: true 
                });
            }

            // Guardamos el ID del canal de logs
            guildData.logsChannelId = canal.id;

            // Asegurar que la carpeta de datos exista y escribir el JSON
            fs.mkdirSync(path.dirname(dbPath), { recursive: true });
            fs.writeFileSync(dbPath, JSON.stringify(guildData, null, 4));
            
            const embed = new EmbedBuilder()
                .setTitle('⚙️ Logs de Seguridad Configurados')
                .setDescription(`Los registros de moderación ahora se enviarán al canal ${canal}.`)
                .setColor('#66fcf1')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            // Mensaje de prueba en el canal de logs
            try {
                await canal.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('🛡️ Canal de Logs Activado')
                            .setDescription('Este canal ha sido establecido para recibir el historial de acciones de Korven.')
                            .setColor('#66fcf1')
                            .setTimestamp()
                    ]
                });
            } catch (err) {
                await interaction.followUp({ 
                    content: '⚠️ Advertencia: No pude enviar un mensaje de prueba. Asegúrate de que tengo permisos de escribir en ese canal.', 
                    ephemeral: true 
                });
            }

        } else if (subcommand === 'desactivar') {
            // Eliminar el ajuste
            guildData.logsChannelId = null;
            
            fs.mkdirSync(path.dirname(dbPath), { recursive: true });
            fs.writeFileSync(dbPath, JSON.stringify(guildData, null, 4));

            await interaction.reply({ 
                content: '✅ Se han desactivado los logs de moderación para este servidor.', 
                ephemeral: true 
            });
        }
    },
};

