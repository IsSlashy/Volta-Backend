import { Serve } from "bun";
import { config } from './config';
import { logger } from '../utils/logger';

const server: Serve = {
  port: config.port, // Changé de PORT à port
  fetch(req: Request) {
    const url = new URL(req.url);
    
    if (url.pathname === "/") {
      return new Response("Welcome to Fortnite Backend!");
    }
    
    // Ajouter d'autres routes ici
    
    return new Response("Not Found", { status: 404 });
  },
};

export function startServer() {
  Bun.serve(server);
  logger.info(`Server running at http://localhost:${config.port}`);
}