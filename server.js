const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// Inicializamos la base de datos local en formato JSON
const adapter = new FileSync('database.json');
const db = low(adapter);

// Definimos valores por defecto si el archivo está vacío
db.defaults({ guilds: {} }).write();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para procesar datos de formularios (POST)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function startServer() {
    // ==========================================
    // ⚙️ CONFIGURACIÓN DE SESIONES Y PASSPORT
    // ==========================================
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));

    passport.use(new DiscordStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL || 'https://korven.onrender.com/api/auth/callback',
        scope: ['identify', 'guilds']
    }, (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
    }));

    app.use(session({
        secret: process.env.SESSION_SECRET || 'KorvenSecretoFuerte123!',
        resave: false,
        saveUninitialized: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    function isAuthenticated(req, res, next) {
        if (req.isAuthenticated()) return next();
        res.redirect('/api/auth/login');
    }

    // ==========================================
    // 🔌 RUTAS DE CONTROL DE ACCESO
    // ==========================================
    app.get('/api/auth/login', passport.authenticate('discord'));
    
    app.get('/api/auth/callback', passport.authenticate('discord', {
        failureRedirect: '/'
    }), (req, res) => {
        res.redirect('/dashboard');
    });

    app.get('/api/auth/logout', (req, res) => {
        req.logout(() => {
            res.redirect('/');
        });
    });

    // ==========================================
    // 🏠 PÁGINA DE INICIO (PÚBLICA)
    // ==========================================
    app.get('/', (req, res) => {
        const dashLink = req.isAuthenticated() ? '/dashboard' : '/api/auth/login';
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
                    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
                    body { background-color: var(--bg-primary); color: var(--text-primary); overflow-x: hidden; }
                    header { display: flex; justify-content: space-between; align-items: center; padding: 20px 8%; border-bottom: 1px solid rgba(102, 252, 241, 0.1); background: rgba(11, 12, 16, 0.95); position: sticky; top: 0; z-index: 1000; backdrop-filter: blur(10px); }
                    .logo-text { font-size: 1.5rem; font-weight: 800; letter-spacing: 2px; color: var(--neon-blue); text-shadow: 0 0 10px rgba(102, 252, 241, 0.3); }
                    .hero { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center; padding: 40px 20px; background: radial-gradient(circle, rgba(102,252,241,0.05) 0%, rgba(11,12,16,1) 70%); }
                    .hero-badge { background-color: var(--bg-secondary); border: 1px solid var(--neon-blue); padding: 6px 16px; border-radius: 50px; font-size: 0.9rem; color: var(--neon-blue); font-weight: bold; margin-bottom: 25px; display: flex; align-items: center; gap: 8px; }
                    .hero-badge span { width: 10px; height: 10px; background-color: #2ecc71; border-radius: 50%; display: inline-block; }
                    .hero h1 { font-size: 4rem; font-weight: 900; margin-bottom: 15px; }
                    .hero h1 span { color: var(--neon-blue); text-shadow: 0 0 20px rgba(102, 252, 241, 0.4); }
                    .hero p { color: var(--text-secondary); font-size: 1.3rem; max-width: 600px; margin-bottom: 40px; line-height: 1.6; }
                    .btn-group { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; }
                    .btn { padding: 14px 28px; border-radius: 8px; font-size: 1rem; font-weight: bold; text-decoration: none; transition: all 0.3s ease; display: flex; align-items: center; gap: 10px; }
                    .btn-primary { background-color: var(--neon-blue); color: var(--bg-primary); }
                    .btn-primary:hover { background-color: var(--neon-dark); transform: translateY(-3px); color: var(--text-primary); }
                    .btn-secondary { background-color: var(--bg-secondary); color: var(--text-primary); border: 1px solid rgba(197, 198, 199, 0.2); }
                    .btn-secondary:hover { border-color: var(--neon-blue); transform: translateY(-3px); }
                    .stats-container { background-color: var(--bg-secondary); padding: 50px 8%; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px; text-align: center; border-top: 1px solid rgba(102, 252, 241, 0.1); border-bottom: 1px solid rgba(102, 252, 241, 0.1); }
                    .stat-card h3 { font-size: 2.5rem; color: var(--neon-blue); margin-bottom: 10px; }
                    .stat-card p { color: var(--text-secondary); font-size: 0.95rem; text-transform: uppercase; }
                    footer { padding: 40px; text-align: center; border-top: 1px solid rgba(197, 198, 199, 0.05); color: var(--text-secondary); }
                </style>
            </head>
            <body>
                <header>
                    <div class="logo-container"><span class="logo-text">KORVEN</span></div>
                </header>
                <section class="hero">
                    <div class="hero-badge"><span></span> Online • Uptime 99.99%</div>
                    <h1>PROTECCIÓN <span>INTELIGENTE</span></h1>
                    <p>El bot definitivo de moderación, automoderación y gestión de comunidades de Discord.</p>
                    <div class="btn-group">
                        <a href="https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands" target="_blank" class="btn btn-primary">
                            <i class="fab fa-discord"></i> Invitar a Korven
                        </a>
                        <a href="${dashLink}" class="btn btn-secondary">
                            <i class="fas fa-sliders"></i> Ir al Dashboard
                        </a>
                    </div>
                </section>
                <section class="stats-container">
                    <div class="stat-card"><h3>1,254</h3><p>👥 Servidores</p></div>
                    <div class="stat-card"><h3>284,000</h3><p>👤 Usuarios Protegidos</p></div>
                    <div class="stat-card"><h3>15,203,114</h3><p>⚡ Acciones Realizadas</p></div>
                </section>
                <footer><p>&copy; 2026 <span>Korven Bot</span>. Smart Moderation.</p></footer>
            </body>
            </html>
        `);
    });

    // ==========================================
    // 🎛️ PANEL PRIVADO: DASHBOARD DE CONFIGURACIÓN
    // ==========================================
    app.get('/dashboard', isAuthenticated, (req, res) => {
        const user = req.user;
        
        // Filtramos solo los servidores donde el usuario es ADMINISTRADOR
        const adminGuilds = user.guilds.filter(guild => (guild.permissions & 0x8) === 0x8);

        let guildOptionsHtml = adminGuilds.map(guild => `
            <option value="${guild.id}">${guild.name}</option>
        `).join('');

        if (adminGuilds.length === 0) {
            guildOptionsHtml = `<option disabled selected>No tienes servidores con Admin</option>`;
        }

        res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Korven - Dashboard</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    :root {
                        --bg-dark: #0b0c10;
                        --sidebar-bg: #1f2833;
                        --accent-blue: #66fcf1;
                        --text-light: #ffffff;
                        --text-muted: #c5c6c7;
                    }
                    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
                    body { background: var(--bg-dark); color: var(--text-light); display: flex; height: 100vh; overflow: hidden; }

                    /* --- SIDEBAR IZQUIERDA --- */
                    .sidebar { width: 280px; background-color: var(--sidebar-bg); display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid rgba(102, 252, 241, 0.1); padding: 20px; }
                    .sidebar-header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid rgba(197, 198, 199, 0.1); }
                    .sidebar-header h2 { color: var(--accent-blue); letter-spacing: 1px; font-size: 1.4rem; }
                    .server-select-box { margin: 20px 0; }
                    .server-select-box label { font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 8px; }
                    .server-select { width: 100%; padding: 10px; background: var(--bg-dark); border: 1px solid var(--accent-blue); color: var(--text-light); border-radius: 6px; outline: none; }
                    .nav-menu { display: flex; flex-direction: column; gap: 10px; }
                    .nav-item { display: flex; align-items: center; gap: 15px; padding: 12px 15px; color: var(--text-muted); text-decoration: none; border-radius: 8px; transition: all 0.3s; font-weight: 500; cursor: pointer; }
                    .nav-item:hover, .nav-item.active { background: rgba(102, 252, 241, 0.1); color: var(--accent-blue); }
                    .user-profile { display: flex; align-items: center; gap: 12px; padding-top: 15px; border-top: 1px solid rgba(197, 198, 199, 0.1); }
                    .user-avatar { width: 45px; height: 45px; border-radius: 50%; border: 2px solid var(--accent-blue); }
                    .user-info { display: flex; flex-direction: column; }
                    .username { font-weight: bold; font-size: 0.95rem; }
                    .logout-btn { font-size: 0.75rem; color: #e74c3c; text-decoration: none; font-weight: bold; }

                    /* --- CONTENIDO PRINCIPAL --- */
                    .main-content { flex: 1; padding: 40px; overflow-y: auto; display: flex; flex-direction: column; gap: 30px; }
                    .content-section { display: none; background: rgba(31, 40, 51, 0.4); border: 1px solid rgba(102, 252, 241, 0.05); padding: 30px; border-radius: 12px; }
                    .content-section.active { display: block; }
                    h1 { color: var(--accent-blue); margin-bottom: 10px; }
                    .subtitle { color: var(--text-muted); margin-bottom: 25px; }
                    .form-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
                    .form-group label { font-weight: bold; }
                    .form-control { padding: 12px; background: var(--bg-dark); border: 1px solid rgba(197, 198, 199, 0.2); color: var(--text-light); border-radius: 8px; outline: none; }
                    .form-control:focus { border-color: var(--accent-blue); }
                    .save-btn { background: var(--accent-blue); color: var(--bg-dark); border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; display: inline-flex; width: fit-content; }
                    .save-btn:hover { background: var(--text-light); }
                </style>
            </head>
            <body>

                <div class="sidebar">
                    <div>
                        <div class="sidebar-header"><h2>KORVEN PANEL</h2></div>
                        <div class="server-select-box">
                            <label>Servidor Activo</label>
                            <select class="server-select" id="guild-selector" onchange="loadGuildSettings()">
                                ${guildOptionsHtml}
                            </select>
                        </div>
                        <div class="nav-menu">
                            <div class="nav-item active" onclick="switchSection('welcome-section', this)">
                                <i class="fas fa-door-open"></i> Bienvenidas
                            </div>
                            <div class="nav-item" onclick="switchSection('autorole-section', this)">
                                <i class="fas fa-user-tag"></i> Auto Roles
                            </div>
                        </div>
                    </div>
                    <div class="user-profile">
                        <img class="user-avatar" src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" alt="Avatar">
                        <div class="user-info">
                            <span class="username">${user.username}</span>
                            <a href="/api/auth/logout" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</a>
                        </div>
                    </div>
                </div>

                <div class="main-content">
                    <div id="welcome-section" class="content-section active">
                        <h1>Configuración de Bienvenidas</h1>
                        <p class="subtitle">Personaliza cómo recibe Korven a los nuevos miembros del servidor.</p>
                        <div class="form-group">
                            <label>ID del Canal de Bienvenida</label>
                            <input type="text" class="form-control" placeholder="Ej: 112233445566778899" id="welcome-channel">
                        </div>
                        <div class="form-group">
                            <label>Mensaje de Bienvenida</label>
                            <textarea class="form-control" rows="4" placeholder="¡Hola {user}! Bienvenido a nuestro servidor." id="welcome-message"></textarea>
                        </div>
                        <button class="save-btn" onclick="saveWelcome()"><i class="fas fa-save"></i> Guardar Ajustes</button>
                    </div>

                    <div id="autorole-section" class="content-section">
                        <h1>Configuración de Auto Roles</h1>
                        <p class="subtitle">Asigna roles de forma automática a los miembros nuevos cuando entran.</p>
                        <div class="form-group">
                            <label>ID del Rol Automático</label>
                            <input type="text" class="form-control" placeholder="Ej: 998877665544332211" id="autorole-id">
                        </div>
                        <button class="save-btn" onclick="saveAutorole()"><i class="fas fa-save"></i> Guardar Ajustes</button>
                    </div>
                </div>

                <script>
                    function switchSection(sectionId, element) {
                        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
                        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                        document.getElementById(sectionId).classList.add('active');
                        element.classList.add('active');
                    }

                    // Carga dinámicamente los datos configurados en la DB para el servidor seleccionado
                    async function loadGuildSettings() {
                        const guildId = document.getElementById('guild-selector').value;
                        if(!guildId) return;

                        const res = await fetch('/api/settings/' + guildId);
                        const data = await res.json();

                        document.getElementById('welcome-channel').value = data.welcomeChannel || '';
                        document.getElementById('welcome-message').value = data.welcomeMessage || '';
                        document.getElementById('autorole-id').value = data.autoroleId || '';
                    }

                    async function saveWelcome() {
                        const guildId = document.getElementById('guild-selector').value;
                        const welcomeChannel = document.getElementById('welcome-channel').value;
                        const welcomeMessage = document.getElementById('welcome-message').value;

                        const res = await fetch('/api/settings/' + guildId, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ welcomeChannel, welcomeMessage })
                        });
                        if (res.ok) alert('✅ ¡Configuración de Bienvenida guardada!');
                    }

                    async function saveAutorole() {
                        const guildId = document.getElementById('guild-selector').value;
                        const autoroleId = document.getElementById('autorole-id').value;

                        const res = await fetch('/api/settings/' + guildId, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ autoroleId })
                        });
                        if (res.ok) alert('✅ ¡Configuración de Auto Roles guardada!');
                    }

                    // Carga inicial al abrir la página
                    window.onload = loadGuildSettings;
                </script>
            </body>
            </html>
        `);
    });

    // ==========================================
    // 💾 RUTAS DE API INTERNAS PARA LA BASE DE DATOS
    // ==========================================
    app.get('/api/settings/:guildId', isAuthenticated, (req, res) => {
        const { guildId } = req.params;
        const guildData = db.get(`guilds.${guildId}`).value() || {};
        res.json(guildData);
    });

    app.post('/api/settings/:guildId', isAuthenticated, (req, res) => {
        const { guildId } = req.params;
        const currentData = db.get(`guilds.${guildId}`).value() || {};
        const newData = { ...currentData, ...req.body };
        
        db.set(`guilds.${guildId}`, newData).write();
        res.sendStatus(200);
    });

    app.listen(PORT, () => {
        console.log(`🌐 Servidor web escuchando en el puerto ${PORT}`);
    });
}

// Exportamos la DB para que bot.js pueda leer las configuraciones guardadas de forma directa
module.exports = { startServer, db };

