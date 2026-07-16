const { Client, GatewayIntentBits, REST, Routes, PermissionFlagsBits, ApplicationCommandOptionType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

// Lista definitiva de Comandos de Barra (/)
const commands = [
    {
        name: 'ping',
        description: 'Verifica la latencia de Korven en el servidor'
    },
    {
        name: 'clear',
        description: 'Borra una cantidad específica de mensajes del chat.',
        defaultMemberPermissions: PermissionFlagsBits.ManageMessages.toString(),
        options: [
            {
                name: 'cantidad',
                description: 'Número de mensajes a eliminar (1 - 100).',
                type: ApplicationCommandOptionType.Integer,
                required: true
            }
        ]
    },
    {
        name: 'kick',
        description: 'Expulsa a un usuario.',
        defaultMemberPermissions: PermissionFlagsBits.KickMembers.toString(),
        options: [
            {
                name: 'usuario',
                description: 'El miembro a expulsar.',
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: 'razon',
                description: 'Razón de la expulsión.',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    {
        name: 'ban',
        description: 'Banea permanentemente a un usuario.',
        defaultMemberPermissions: PermissionFlagsBits.BanMembers.toString(),
        options: [
            {
                name: 'usuario',
                description: 'El miembro a banear.',
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: 'razon',
                description: 'Razón del baneo.',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    {
        name: 'unban',
        description: 'Desbanea a un usuario utilizando su ID de Discord.',
        defaultMemberPermissions: PermissionFlagsBits.BanMembers.toString(),
        options: [
            {
                name: 'id',
                description: 'La ID de Discord del usuario desbaneado.',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'razon',
                description: 'Razón del desbaneo.',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    {
        name: 'warn',
        description: 'Aplica una advertencia formal.',
        defaultMemberPermissions: PermissionFlagsBits.ModerateMembers.toString(),
        options: [
            {
                name: 'usuario',
                description: 'El miembro a advertir.',
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: 'razon',
                description: 'Razón de la advertencia.',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    {
        name: 'unwarn',
        description: 'Retira una advertencia a un usuario.',
        defaultMemberPermissions: PermissionFlagsBits.ModerateMembers.toString(),
        options: [
            {
                name: 'usuario',
                description: 'El miembro al que se le retirará la advertencia.',
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: 'razon',
                description: 'Razón del unwarn.',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    {
        name: 'logs',
        description: 'Configura el canal de registros (logs) de moderación.',
        defaultMemberPermissions: PermissionFlagsBits.Administrator.toString(),
        options: [
            {
                name: 'establecer',
                description: 'Establece el canal de texto para los logs.',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'canal',
                        description: 'El canal de texto donde se enviarán los logs.',
                        type: ApplicationCommandOptionType.Channel,
                        required: true
                    }
                ]
            },
            {
                name: 'desactivar',
                description: 'Desactiva el envío de logs de moderación.',
                type: ApplicationCommandOptionType.Subcommand
            }
        ]
    }
];

function startBot() {
    client.once('ready', async () => {
        console.log(`🤖 Korven conectado como ${client.user.tag}`);
        
        // Obtenemos de forma ultra-segura el CLIENT_ID directo del bot si no existe en las variables de entorno
        const clientId = process.env.CLIENT_ID || client.user.id;
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        
        try {
            console.log('Registrando comandos globales de barra...');
            await rest.put(Routes.applicationCommands(clientId), { body: commands });
            console.log('✅ ¡Comandos globales registrados en los servidores de Discord!');
        } catch (error) {
            console.error('❌ Error registrando comandos:', error);
        }
    });

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        const { commandName, options, guild } = interaction;

        // --- PING ---
        if (commandName === 'ping') {
            return interaction.reply({ content: `🏓 ¡Pong! Latencia: **${client.ws.ping}ms**`, ephemeral: true });
        }

        // --- CLEAR ---
        if (commandName === 'clear') {
            const cantidad = options.getInteger('cantidad');
            if (cantidad < 1 || cantidad > 100) return interaction.reply({ content: '❌ Elige de 1 a 100.', ephemeral: true });
            try {
                await interaction.channel.bulkDelete(cantidad, true);
                return interaction.reply({ content: `🧹 Borrados **${cantidad}** mensajes.`, ephemeral: true });
            } catch (error) {
                return interaction.reply({ content: '❌ Error al borrar (mensajes muy viejos).', ephemeral: true });
            }
        }

        // --- KICK ---
        if (commandName === 'kick') {
            const usuario = options.getUser('usuario');
            const razon = options.getString('razon') || 'Sin razón especificada';
            const miembro = guild.members.cache.get(usuario.id);
            if (!miembro) return interaction.reply({ content: '❌ El usuario no está en el servidor.', ephemeral: true });
            try {
                await miembro.kick(razon);
                return interaction.reply({ content: `👢 **${usuario.tag}** fue expulsado. Razón: ${razon}` });
            } catch (err) {
                return interaction.reply({ content: '❌ No tengo permisos suficientes para expulsar a este usuario.', ephemeral: true });
            }
        }

        // --- BAN ---
        if (commandName === 'ban') {
            const usuario = options.getUser('usuario');
            const razon = options.getString('razon') || 'Sin razón especificada';
            const miembro = guild.members.cache.get(usuario.id);
            if (!miembro) return interaction.reply({ content: '❌ El usuario no está en el servidor.', ephemeral: true });
            try {
                await miembro.ban({ reason: razon });
                return interaction.reply({ content: `🔨 **${usuario.tag}** fue baneado. Razón: ${razon}` });
            } catch (err) {
                return interaction.reply({ content: '❌ No tengo permisos suficientes para banear a este usuario.', ephemeral: true });
            }
        }

        // --- UNBAN ---
        if (commandName === 'unban') {
            const userId = options.getString('id');
            const razon = options.getString('razon') || 'Sin razón especificada';
            try {
                await guild.members.unban(userId, razon);
                return interaction.reply({ content: `🔓 El usuario con ID **${userId}** ha sido desbaneado con éxito.\n📄 **Razón:** ${razon}` });
            } catch (err) {
                return interaction.reply({ content: '❌ No se pudo desbanear al usuario. Verifica que la ID sea válida o que realmente esté baneado.', ephemeral: true });
            }
        }

        // --- WARN ---
        if (commandName === 'warn') {
            const user = options.getUser('usuario');
            const razon = options.getString('razon');
            await user.send(`⚠️ Has sido advertido en **${guild.name}**: ${razon}`).catch(() => {});
            return interaction.reply({ content: `⚠️ **${user.tag}** advertido. Razón: ${razon}` });
        }

        // --- UNWARN ---
        if (commandName === 'unwarn') {
            const user = options.getUser('usuario');
            const razon = options.getString('razon') || 'Arrepentimiento / Buen comportamiento';
            await user.send(`✅ Se te ha retirado una advertencia en el servidor **${guild.name}**.\n📄 **Razón:** ${razon}`).catch(() => {});
            return interaction.reply({ content: `✅ Se ha retirado la advertencia a **${user.tag}** con éxito.\n📄 **Razón:** ${razon}` });
        }

        // --- LOGS ---
        if (commandName === 'logs') {
            const subcommand = options.getSubcommand();
            const guildId = guild.id;
            const dbPath = path.join(__dirname, `data/guilds/${guildId}.json`);

            let guildData = {};
            if (fs.existsSync(dbPath)) {
                try {
                    guildData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                } catch (e) {
                    console.error("Error al leer base de datos local:", e);
                }
            }

            if (subcommand === 'establecer') {
                const canal = options.getChannel('canal');

                if (!canal.isTextBased()) {
                    return interaction.reply({ 
                        content: '❌ Por favor, selecciona un canal de texto válido.', 
                        ephemeral: true 
                    });
                }

                guildData.logsChannelId = canal.id;

                fs.mkdirSync(path.dirname(dbPath), { recursive: true });
                fs.writeFileSync(dbPath, JSON.stringify(guildData, null, 4));

                await interaction.reply({ 
                    content: `⚙️ **Logs Configurados:** Los registros de moderación ahora se enviarán al canal ${canal}.`,
                    ephemeral: true 
                });

                try {
                    await canal.send({
                        content: '🛡️ **Canal de Logs Activado:** Este canal recibirá el historial de acciones de Korven.'
                    });
                } catch (err) {
                    await interaction.followUp({ 
                        content: '⚠️ **Advertencia:** No pude enviar un mensaje al canal. Revisa mis permisos.', 
                        ephemeral: true 
                    });
                }

            } else if (subcommand === 'desactivar') {
                guildData.logsChannelId = null;

                fs.mkdirSync(path.dirname(dbPath), { recursive: true });
                fs.writeFileSync(dbPath, JSON.stringify(guildData, null, 4));

                await interaction.reply({ 
                    content: '✅ Se han desactivado los logs de moderación.', 
                    ephemeral: true 
                });
            }
        }
    });

    client.login(process.env.DISCORD_TOKEN);
}

module.exports = startBot;

