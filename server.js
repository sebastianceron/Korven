const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

function startServer() {
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
                    * { margin: 0; padding: 0; box-sizing: border-box; font-family: sans-serif; }
                    body { background-color: var(--bg-primary); color: var(--text-primary); text-align: center; }
                    header { padding: 20px; border-bottom: 1px solid rgba(102, 252, 241, 0.1); }
                    .logo-text { font-size: 1.5rem; font-weight: bold; color: var(--neon-blue); letter-spacing: 2px; }
                    .hero { padding: 60px 20px; }
                    .hero-badge { display: inline-block; background: var(--bg-secondary); border: 1px solid var(--neon-blue); padding: 5px 15px; border-radius: 50px; font-size: 0.9rem; color: var(--neon-blue); margin-bottom: 20px; }
                    .hero-badge span { width: 10px; height: 10px; background: #2ecc71; border-radius: 50%; display: inline-block; margin-right: 5px; }
                    h1 { font-size: 3rem; margin-bottom: 15px; }
                    h1 span { color: var(--neon-blue); }
                    p { color: var(--text-secondary); max-width: 600px; margin: 0 auto 30px; font-size: 1.1rem; }
                    .btn-group { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
                    .btn { padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
                    .btn-primary { background: var(--neon-blue); color: var(--bg-primary); }
                    .btn-secondary { background: var(--bg-secondary); color: var(--text-primary); border: 1px solid rgba(197,198,199,0.2); }
                    .stats-container { background: var(--bg-secondary); padding: 40px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-top: 40px; }
                    .stat-card h3 { color: var(--neon-blue); font-size: 2rem; }
                    .features { padding: 60px 20px; }
                    .features h2 { margin-bottom: 40px; }
                    .features h2 span { color: var(--neon-blue); }
                    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; max-width: 1000px; margin: 0 auto; }
                    .feature-card { background: rgba(31, 40, 51, 0.4); padding: 25px; border-radius: 12px; text-align: left; border: 1px solid rgba(102, 252, 241, 0.05); }
                    .feature-icon { color: var(--neon-blue); font-size: 1.8rem; margin-bottom: 15px; }
                    footer { padding: 30px; border-top: 1px solid rgba(197,198,199,0.05); color: var(--text-secondary); }
                </style>
            </head>
            <body>
                <header><span class="logo-text">KORVEN</span></header>
                <section class="hero">
                    <div class="hero-badge"><span></span> Online • Uptime 99.99%</div>
                    <h1>PROTECCIÓN <span>INTELIGENTE</span></h1>
                    <p>El bot definitivo de moderación, automoderación y gestión de comunidades de Discord.</p>
                    <div class="btn-group">
                        <a href="https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=8&scope=bot%20applications.commands" target="_blank" class="btn btn-primary"><i class="fab fa-discord"></i> Invitar</a>
                        <a href="#" class="btn btn-secondary">Dashboard</a>
                        <a href="#" class="btn btn-secondary">Documentación</a>
                    </div>
                </section>
                <section class="stats-container">
                    <div class="stat-card"><h3>1,254</h3><p>👥 Servidores</p></div>
                    <div class="stat-card"><h3>284,000</h3><p>👤 Usuarios</p></div>
                    <div class="stat-card"><h3>15,203,114</h3><p>⚡ Acciones</p></div>
                </section>
                <section class="features">
                    <h2>Servicios de <span>Korven</span></h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon"><i class="fas fa-shield-halved"></i></div>
                            <h4>Moderación Inteligente</h4>
                            <p>Bans, Kicks, Mutes y Warns bajo control.</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon"><i class="fas fa-robot"></i></div>
                            <h4>AutoMod</h4>
                            <p>Filtros anti-spam, enlaces y palabras.</p>
                        </div>
                    </div>
                </section>
                <footer><p>&copy; 2026 Korven Bot.</p></footer>
            </body>
            </html>
        `);
    });

    app.listen(PORT, () => {
        console.log(`🌐 Servidor web escuchando en el puerto ${PORT}`);
    });
}

module.exports = startServer;

