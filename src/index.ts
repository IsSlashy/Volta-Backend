import { Serve } from "bun";
import { config } from './core/config';
import { connectDatabase } from './core/database';
import { logger } from './utils/logger';
import { setupRoutes } from './routes';
import { initTokenManager } from './tokenManager';
import { setupXMPP } from './xmpp/xmpp';

async function main() {
  try {
    // Initialize essential services
    await connectDatabase();
    initTokenManager();

    // Setup server
    const server: Serve = {
      port: config.port,
      fetch: setupRoutes(),
    };

    // Start server
    Bun.serve(server);
    logger.info(`Server running on http://localhost:${config.port}`);

    // Setup XMPP (non-blocking)
    setupXMPP();

    // Optional services
    if (config.discord.bUseDiscordBot) {
      import('./services/discordBot').then(module => module.startDiscordBot());
    }

    if (config.bUseAutoRotate) {
      import('./services/autoRotate').then(module => module.startAutoRotate());
    }

    // Check for updates (non-blocking)
    import('./services/updateChecker').then(module => module.startUpdateChecker());

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => Bun.gracefulExit());
process.on('SIGTERM', () => Bun.gracefulExit());

main();