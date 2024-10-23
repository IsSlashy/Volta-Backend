import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import path from 'path';

// Import custom modules (now using the correct paths)
import { KV } from './utils/kv';
import { log } from './utils/logger';
import { createError } from './utils/error-handler';
import { MakeID } from './utils/functions';
import { CheckForUpdate } from './services/checkforupdate.service';
import { AutoBackendRestart } from './services/autobackendrestart.service';

// Read config file
const config = JSON.parse(fs.readFileSync('./src/core/config.ts').toString());

const app = express();
const PORT = config.port;
const WEBSITEPORT = config.Website.websiteport;

// Ensure necessary directories exist
if (!fs.existsSync('./ClientSettings')) fs.mkdirSync('./ClientSettings');

global.JWT_SECRET = MakeID();

console.log('Welcome to Volta Backend');

// Token management
const tokens = JSON.parse(fs.readFileSync('./src/services/tokenManager/tokens.json').toString());


// Expire tokens based on time
tokens.accessTokens = tokens.accessTokens.filter(token => {
    const decodedToken = jwt.decode(token.replace('eg1~', '')) as any;
    return DateAddHours(new Date(decodedToken.creation_date), decodedToken.hours_expire) > new Date();
});

// Assign to global scope
global.accessTokens = tokens.accessTokens;
global.refreshTokens = tokens.refreshTokens;
global.clientTokens = tokens.clientTokens;
global.kv = kv;
global.exchangeCodes = [];

// Setup mongoose connection with error handling
mongoose.set('strictQuery', true);
mongoose.connect(config.mongodb.database, () => log.backend('Successfully connected to MongoDB!'));

mongoose.connection.on('error', (err) => {
    log.error('MongoDB connection error');
    throw err;
});

// Apply middlewares
app.use(rateLimit({ windowMs: 30 * 1000, max: 45 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Load CloudStorage and Friends routes explicitly (if needed)
app.use(require('./src/api/routes/cloudstorage/cloudstorage.routes').default);
app.use(require('./src/api/routes/friends/friends.routes').default);

// Load routes from api/routes
fs.readdirSync('./src/api/routes').forEach((folder) => {
    fs.readdirSync(`./src/api/routes/${folder}`).forEach((file) => {
        try {
            const route = require(`./src/api/routes/${folder}/${file}`);
            app.use(route.default || route);
        } catch (err) {
            log.error(`Failed to load route: ${file}`);
        }
    });
});

// Setup website if enabled
if (config.Website.bUseWebsite) {
    const websiteApp = express();
    require('./src/Website/website')(websiteApp);

    websiteApp.listen(WEBSITEPORT, () => {
        log.website(`Website running on port ${WEBSITEPORT}`);
    });
}

// Catch all route for unknown paths
app.use((req, res, next) => {
    log.debug(`Missing endpoint: ${req.method} ${req.originalUrl}`);
    createError('errors.com.epicgames.common.not_found', 'Resource not found', undefined, 1004, undefined, 404, res);
});

// Start the server
app.listen(PORT, () => {
    log.backend(`Backend listening on port ${PORT}`);
    require('./src/xmpp/xmpp');
    if (config.discord.bUseDiscordBot) {
        require('./src/DiscordBot/index');
    }
});

// Automatic backend restart
if (config.bEnableAutoBackendRestart) {
    AutoBackendRestart.scheduleRestart(config.bRestartTime);
}

// Utility function to add hours to a date
function DateAddHours(date: Date, hours: number): Date {
    date.setHours(date.getHours() + hours);
    return date;
}
