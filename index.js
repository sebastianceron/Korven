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
            <title>Korven - Smart Moderation</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                :root {
                    --bg-primary: #0b0c10;
                    --bg-secondary: #1f2833;
                    --text-primary: #ffffff;
                    --text-secondary: #c5c6c7;
                    --neon-blue: #66fcf1;
                    --neon-dark: #45a29e;
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                }

                body {
                    background-color: var(--bg-primary);
                    color: var(--text-primary);
                    overflow-x: hidden;
                }

                /* --- NAVBAR --- */
                header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 8%;
                    border-bottom: 1px solid rgba(102, 252, 241, 0.1);
                    background: rgba(11, 12, 16, 0.95);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    backdrop-filter: blur(10px);
                }

                .logo-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .logo-text {
                    font-size: 1.5rem;
                    font-weight: 800;
                    letter-spacing: 2px;
                    color: var(--neon-blue);
                    text-shadow: 0 0 10px rgba(102, 252, 241, 0.3);
                }

                /* --- HERO SECTION --- */
                .hero {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 80vh;
                    text-align: center;
                    padding: 40px 20px;
                    background: radial-gradient(circle, rgba(102,252,241,0.05) 0%, rgba(11,12,16,1) 70%);
                }

                /* Animación del Hero */
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                    100% { transform: translateY(0px); }
                }

                .hero-badge {
                    background-color: var(--bg-secondary);
                    border: 1px solid var(--neon-blue);
                    padding: 6px 16px;
                    border-radius: 50px;
                    font-size: 0.9rem;
                    color: var(--neon-blue);
                    font-weight: bold;
                    margin-bottom: 25px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 0 15px rgba(102, 252, 241, 0.15);
                }

                .hero-badge span {
                    width: 10px;
                    height: 10px;
                    background-color: #2ecc71;
                    border-radius: 50%;
                    display: inline-block;
                    box-shadow: 0 0 8px #2ecc71;
                }

                .hero h1 {
                    font-size: 4rem;
                    font-weight: 900;
                    letter-spacing: 3px;
                    margin-bottom: 15px;
                    animation: float 5s ease-in-out infinite;
                }

                .hero h1 span {
                    color: var(--neon-blue);
                    text-shadow: 0 0 20px rgba(102, 252, 241, 0.4);
                }

                .hero p {
                    color: var(--text-secondary);
                    font-size: 1.3rem;
                    max-width: 600px;
                    margin-bottom: 40px;
                    line-height: 1.6;
                }

                /* Botones */
                .btn-group {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    justify-content: center;
                }

                .btn {
                    padding: 14px 28px;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: bold;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .btn-primary {
                    background-color: var(--neon-blue);
                    color: var(--bg-primary);
                    box-shadow: 0 4px 15px rgba(102, 252, 241, 0.3);
                }

                .btn-primary:hover {
                    background-color: var(--neon-dark);
                    transform: translateY(-3px);
                    color: var(--text-primary);
                }

                .btn-secondary {
                    background-color: var(--bg-secondary);
                    color: var(--text-primary);
                    border: 1px solid rgba(197, 198, 199, 0.2);
                }

                .btn-secondary:hover {
                    background-color: rgba(197, 198, 199, 0.1);
                    border-color: var(--neon-blue);
                    transform: translateY(-3px);
                }

                /* --- ESTADÍSTICAS --- */
                .stats-container {
                    background-color: var(--bg-secondary);
                    padding: 50px 8%;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 30px;
                    text-align: center;
                    border-top: 1px solid rgba(102, 252, 241, 0.1);
                    border-bottom: 1px solid rgba(102, 252, 241, 0.1);
                }

                .stat-card h3 {
                    font-size: 2.5rem;
                    color: var(--neon-blue);
                    margin-bottom: 10px;
                    font-weight: 800;
                }

                .stat-card p {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                /* --- CARACTERÍSTICAS --- */
                .features {
                    padding: 80px 8%;
                    text-align: center;
                }

                .features h2 {
                    font-size: 2.5rem;
                    margin-bottom: 50px;
                    letter-spacing: 1px;
                }

                .features h2 span {
                    color: var(--neon-blue);
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 25px;
                }

                .feature-card {
                    background-color: rgba(31, 40, 51, 0.4);
                    border: 1px solid rgba(102, 252, 241, 0.05);
                    padding: 30px 20px;
                    border-radius: 12px;
                    text-align: left;
                    transition: all 0.3s ease;
                }

                .feature-card:hover {
                    border-color: var(--neon-blue);
                    transform: translateY(-5px);
                    background-color: rgba(31, 40, 51, 0.8);
                }

                .feature-icon {
                    font-size: 2rem;
                    color: var(--neon-blue);
                    margin-bottom: 20px;
                }

                .feature-card h4 {
                    font-size: 1.25rem;
                    margin-bottom: 10px;
                }

                .feature-card p {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                /* --- FOOTER --- */
                footer {
                    padding: 40px;
                    text-align: center;
                    border-top: 1px solid rgba(197, 198, 199, 0.05);
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }

                footer span {
                    color: var(--neon-blue);
                }
            </style>
        </head>
        <body>

            <header>
                <div class="logo-container">
                    <span class="logo-text">KORVEN</span>
                </div>
            </header>

            <section class="hero">
                <div class="hero-badge">
                    <span></span> Online • Uptime 99.99%
                </div>
                <h1>PROTECCIÓN <span>INTELIGENTE</span></h1>
                <p>El bot definitivo de moderación, automoderación y gestión de comunidades de Discord. Mantén tu servidor seguro de forma automatizada y profesional.</p>
                
                <div class="btn-group">
                    <a href="https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands" target="_blank" class="btn btn-primary">
                        <i class="fab fa-discord"></i> Invitar a Korven
                    </a>
                    <a href="#" class="btn btn-secondary">
                        <i class="fas fa-sliders"></i> Ir al Dashboard
                    </a>
                    <a href="#" class="btn btn-secondary">
                        <i class="fas fa-book"></i> Documentación
                    </a>
                </div>
            </section>

            <section class="stats-container">
                <div class="stat-card">
                    <h3>1,254</h3>
                    <p>👥 Servidores</p>
                </div>
                <div class="stat-card">
                    <h3>284,000</h3>
                    <p>👤 Usuarios Protegidos</p>
                </div>
                <div class="stat-card">
                    <h3>15,203,114</h3>
                    <p>⚡ Acciones Realizadas</p>
                </div>
                <div class="stat-card">
                    <h3>99.99%</h3>
                    <p>⏱️ Uptime Oficial</p>
                </div>
            </section>

            <section class="features">
                <h2>Servicios de <span>Korven</span></h2>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon"><i class="fas fa-shield-halved"></i></div>
                        <h4>Moderación Inteligente</h4>
                        <p>Comandos avanzados de administración: Bans, Kicks, Mutes y Warns centralizados en un potente sistema.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon"><i class="fas fa-robot"></i></div>
                        <h4>AutoMod Configurable</h4>
                        <p>Bloqueo instantáneo de enlaces no autorizados, invitaciones y filtrado de palabras prohibidas ajustable.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon"><i class="fas fa-list-check"></i></div>
                        <h4>Logs y Auditoría</h4>
                        <p>Monitoreo completo de acciones en canales de texto, ediciones, eliminaciones y registros de actividad.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon"><i class="fas fa-door-open"></i></div>
                        <h4>Bienvenida y Autoroles</h4>
                        <p>Recibe a tus nuevos miembros con mensajes personalizados de bienvenida y asignación automática de roles.</p>
                    </div>
                </div>
            </section>

            <footer>
                <p>&copy; 2026 <span>Korven Bot</span>. Smart Moderation. Powerful Protection.</p>
            </footer>

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

const commands = [
    {
        name: 'ping',
        description: 'Verifica la latencia de Korven en el servidor'
    }
];

client.once('ready', async () => {
    console.log(`🤖 ¡Korven ha iniciado sesión con éxito como ${client.user.tag}!`);

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('🔄 Actualizando comandos globales de Korven...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('✅ ¡Comandos (/) de Korven listos a nivel global!');
    } catch (error) {
        console.error('❌ Error al registrar los comandos:', error);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        const pingDeConsola = client.ws.ping;
        await interaction.reply({
            content: `🏓 **¡Pong!** Korven está activo.\n⚡ Latencia de la API: **${pingDeConsola}ms**`
        });
    }
});

client.login(process.env.DISCORD_TOKEN);

