const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

// Base de datos local ligera
const adapter = new FileSync('database.json');
const db = low(adapter);
db.defaults({ guilds: {} }).write();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function startServer() {
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

    // Middleware para verificar autenticación
    function isAuthenticated(req, res, next) {
        if (req.isAuthenticated()) return next();
        res.redirect('/api/auth/login');
    }

    // --- RUTAS DE AUTENTICACIÓN ---
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

    // --- ENDPOINTS AUXILIARES DE SESIÓN (API) ---
    app.get('/api/user/me', (req, res) => {
        res.json({
            loggedIn: req.isAuthenticated(),
            user: req.user || null,
            clientId: process.env.CLIENT_ID
        });
    });

    // --- PÁGINAS VISUALES ---
    // Página de Inicio (Pública)
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'views', 'home.html'));
    });

    // Dashboard (Privada)
    app.get('/dashboard', isAuthenticated, (req, res) => {
        res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
    });

    // --- RUTAS DE CONFIGURACIÓN DEL BOT ---
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

module.exports = { startServer, db };

