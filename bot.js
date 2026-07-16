const { Client, GatewayIntentBits, REST, Routes, PermissionFlagsBits, ApplicationCommandOptionType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

const commands = [
    {
        name: 'ping',
        description: 'Verifica la latencia de Korven en el servidor'
    },
    {
        name: 'clear',
        description: 'Borra una cantidad específica de mensajes del chat',
        defaultMemberPermissions: PermissionFlagsBits.ManageMessages.toString(),
        options: [
            {
                name: 'cantidad',
                description: 'Número de mensajes a eliminar (1 - 100)',
                type: ApplicationCommandOptionType.Integer,
                required: true
            }
        ]
    },
    {
        name: 'kick',
        description: 'Expulsa a un usuario',
        defaultMemberPermissions: PermissionFlagsBits.KickMembers.toString(),
        options: [
            {
                name: 'usuario',
                description: 'El miembro a expulsar',
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: 'razon',
                description: 'Razón de la expulsión',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    {
        name: 'ban',
        description: 'Banea permanentemente a un usuario',
        defaultMemberPermissions: PermissionFlagsBits.BanMembers.toString(),
        options: [
            {
                name: 'usuario',
                description: 'El miembro a banear',
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: 'razon',
                description: 'Razón del baneo',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    {
        name: 'warn',
        description: 'Aplica una advertencia formal',
        defaultMemberPermissions: PermissionFlagsBits.ModerateMembers.toString(),
        options: [
            {
                name: 'usuario',
                description: 'El miembro a advertir',
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: 'razon',
                description: 'Razón de la advertencia',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    }
];

function startBot() {
    client.once('ready', async () => {
        console.log(`🤖 Korven conectado como ${client.user.tag}`);
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        try {
            console.log('🔄 Registrando comandos globales...');
            await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
            console.log('✅ ¡Comandos registrados!');
        } catch (error) {
            console.error('❌ Error registrando comandos:', error);
        }
    });

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
        const { commandName, options, guild } = interaction;

        if (commandName === 'ping') {
            return interaction.reply({ content: `🏓 ¡Pong! Latencia: **${client.ws.ping}ms**`, ephemeral: true });
        }

        if (commandName === 'clear') {
            const cantidad = options.getInteger('cantidad');
            if (cantidad < 1 || cantidad > 100) return interaction.reply({ content: '❌ Elige de 1 a 100.', ephemeral: true });
            try {
                await interaction.channel.bulkDelete(cantidad, true);
                return interaction.reply({ content: `🧹 Borrados **${cantidad}** mensajes.`, ephemeral: true });
            } catch {
                return interaction.reply({ content: '❌ Error al borrar (mensajes muy viejos).', ephemeral: true });
            }
        }

        if (commandName === 'kick') {
            const user = options.getMember('usuario');
            const razon = options.getString('razon') || 'Sin razón';
            if (!user || !user.kickable) return interaction.reply({ content: '❌ No puedo expulsar a este usuario.', ephemeral: true });
            await user.kick(razon);
            return interaction.reply({ content: `👢 **${user.user.tag}** expulsado. Razón: ${razon}` });
        }

        if (commandName === 'ban') {
            const user = options.getMember('usuario');
            const razon = options.getString('razon') || 'Sin razón';
            if (!user || !user.bannable) return interaction.reply({ content: '❌ No puedo banear a este usuario.', ephemeral: true });
            await user.ban({ reason: razon });
            return interaction.reply({ content: `🔨 **${user.user.tag}** baneado. Razón: ${razon}` });
        }

        if (commandName === 'warn') {
            const user = options.getUser('usuario');
            const razon = options.getString('razon');
            await user.send(`⚠️ Advertencia en **${guild.name}**: ${razon}`).catch(() => {});
            return interaction.reply({ content: `⚠️ **${user.tag}** advertido. Razón: ${razon}` });
        }
    });

    client.login(process.env.DISCORD_TOKEN);
}

module.exports = startBot;

