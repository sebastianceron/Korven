require('dotenv').config();
const startServer = require('./server.js');
const startBot = require('./bot.js');

// Encendemos ambos servicios juntos
startServer();
startBot();

