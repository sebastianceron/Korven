const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { db } = require('../web/server.js'); // Conectamos la misma DB de la web

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// Carga de comandos Slash
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

// Evento listo
client.once('ready', async () => {
    console.log(`🤖 ¡Bot conectado como ${client.user.tag}!`);
    const commandsData = client.commands.map(cmd => cmd.data.toJSON());
    try {
        await client.application.commands.set(commandsData);
        console.log('✅ ¡Comandos Slash globales registrados!');
    } catch (error) {
        console.error('❌ Error al registrar comandos:', error);
    }
});

// Evento comandos
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        const reply = { content: '❌ Error al ejecutar el comando.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(reply);
        } else {
            await interaction.reply(reply);
        }
    }
});

// Evento bienvenidas y autoroles
client.on('guildMemberAdd', async (member) => {
    const config = db.get(`guilds.${member.guild.id}`).value();
    if (!config) return;

    // Auto Rol
    if (config.autoroleId) {
        try {
            const role = member.guild.roles.cache.get(config.autoroleId);
            if (role) await member.roles.add(role);
        } catch (err) {
            console.error('❌ Error Auto Rol:', err);
        }
    }

    // Bienvenida
    if (config.welcomeChannel && config.welcomeMessage) {
        try {
            const channel = member.guild.channels.cache.get(config.welcomeChannel);
            if (channel) {
                const msg = config.welcomeMessage.replace(/{user}/g, `<@${member.id}>`);
                await channel.send(msg);
            }
        } catch (err) {
            console.error('❌ Error mensaje bienvenida:', err);
        }
    }
});

module.exports = { client };

