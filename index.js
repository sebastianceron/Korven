require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const express = require('express');

// ==========================================
// 🌐 CONFIGURACIÓN DEL SERVIDOR WEB
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Korven Dashboard</title>
            <style>
                body {
                    background-color: #0b0c10;
                    color: #ffffff;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                }
                h1 {
                    color: #66fcf1;
                    font-size: 3rem;
                    margin-bottom: 10px;
                }
                p {
                    color: #c5c6c7;
                    font-size: 1.2rem;
                }
                .status {
                    background-color: #1f2833;
                    padding: 10px 20px;
                    border-radius: 8px;
                    border: 1px solid #66fcf1;
                }
            </style>
        </head>
        <body>
            <h1>🤖 Korven Dashboard</h1>
            <div class="status">
                <p>🟢 Estado: <strong>Online</strong></p>
            </div>
            <p>El bot de moderación inteligente está listo y protegiendo servidores.</p>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🌐 Servidor web escuchando en el puerto ${PORT}`);
});

// ==========================================
// 🤖 CONFIGURACIÓN DEL BOT DE DISCORD
// ==========================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

// Definición de nuestros Slash Commands
const commands = [
    {
        name: 'ping',
        description: 'Verifica la latencia de Korven en el servidor'
    }
];

// Evento cuando el bot se conecta
client.once('ready', async () => {
    console.log(`🤖 ¡Korven ha iniciado sesión con éxito como ${client.user.tag}!`);

    // Registrar los Slash Commands en Discord de forma automática al encenderse
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('🔄 Iniciando la actualización de los comandos globales (/) de Korven...');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log('✅ ¡Comandos (/) registrados con éxito en todos los servidores!');
    } catch (error) {
        console.error('❌ Error al registrar los comandos:', error);
    }
});

// Evento para detectar y responder a los Slash Commands (interacciones)
client.on('interactionCreate', async (interaction) => {
    // Si la interacción no es un comando de barra diagonal (/), no hacemos nada
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    // Manejar el comando /ping
    if (commandName === 'ping') {
        const pingDeConsola = client.ws.ping;
        await interaction.reply({
            content: `🏓 **¡Pong!** Korven está activo.\n⚡ Latencia de la API: **${pingDeConsola}ms**`
        });
    }
});

// Conectamos el bot
client.login(process.env.DISCORD_TOKEN);

