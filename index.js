require('dotenv').config();
const { client } = require('./bot/client.js');
const { startServer } = require('./web/server.js');

// 1. Iniciamos el bot de Discord
const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error('❌ ERROR: Falta la variable DISCORD_TOKEN en el .env');
    process.exit(1);
}

client.login(token).then(() => {
    // 2. Una vez que el bot conecta, levantamos la web
    startServer();
}).catch(err => {
    console.error('❌ Error crítico al iniciar el bot:', err);
});

