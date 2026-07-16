const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { startServer, db } = require('./server.js'); // Aquí ya está corregido el import con las llaves { }
const fs = require('fs');
const path = require('path');

// Inicializamos el cliente de Discord con sus intents correspondientes
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// ==========================================
// 🔌 CARGA DINÁMICA DE COMANDOS (SLASH)
// ==========================================
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`⚠️ Al advertencia: El comando en ${filePath} no tiene las propiedades "data" o "execute".`);
        }
    }
}

// ==========================================
// 🚀 EVENTO: BOT LISTO
// ==========================================
client.once('ready', async () => {
    console.log(`🤖 ¡Bot conectado exitosamente como ${client.user.tag}!`);
    
    // Registramos los comandos Slash de forma global en Discord
    const commandsData = client.commands.map(cmd => cmd.data.toJSON());
    try {
        await client.application.commands.set(commandsData);
        console.log('✅ ¡Comandos de moderación cargados a nivel global!');
    } catch (error) {
        console.error('❌ Error al registrar los comandos:', error);
    }
});

// ==========================================
// ⚡ EVENTO: INTERACCIÓN DE COMANDOS (SLASH)
// ==========================================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`❌ Error ejecutando el comando ${interaction.commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '❌ Ocurrió un error interno al ejecutar este comando.', ephemeral: true });
        } else {
            await interaction.reply({ content: '❌ Ocurrió un error interno al ejecutar este comando.', ephemeral: true });
        }
    }
});

// ==========================================
// 👋 EVENTO: BIENVENIDA Y AUTOROLES AUTOMÁTICOS
// ==========================================
client.on('guildMemberAdd', async (member) => {
    const guildId = member.guild.id;
    
    // Leemos la configuración del servidor desde nuestra base de datos JSON
    const config = db.get(`guilds.${guildId}`).value();
    if (!config) return;

    // 🏷️ Auto Roles
    if (config.autoroleId) {
        try {
            const role = member.guild.roles.cache.get(config.autoroleId);
            if (role) await member.roles.add(role);
        } catch (err) {
            console.error('❌ Error al asignar el auto rol:', err);
        }
    }

    // 🚪 Mensaje de Bienvenida
    if (config.welcomeChannel && config.welcomeMessage) {
        try {
            const channel = member.guild.channels.cache.get(config.welcomeChannel);
            if (channel) {
                const finalMessage = config.welcomeMessage.replace(/{user}/g, `<@${member.id}>`);
                await channel.send(finalMessage);
            }
        } catch (err) {
            console.error('❌ Error al enviar mensaje de bienvenida:', err);
        }
    }
});

// ==========================================
// 🔑 INICIO DE SESIÓN Y ARRANQUE DEL SERVIDOR
// ==========================================
const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error('❌ ERROR: No se encontró la variable DISCORD_TOKEN en el entorno.');
    process.exit(1);
}

// Iniciamos el bot de Discord
client.login(token).then(() => {
    // Una vez que el bot se conecta, levantamos el servidor web para el Dashboard de Render
    startServer();
}).catch(err => {
    console.error('❌ Error crítico al iniciar el bot de Discord:', err);
});

