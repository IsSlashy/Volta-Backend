import { Game } from '../models/game.model'; // Assuming you have a Game model
import { MatchmakingService } from '../services/matchmaking.service';

export const getGameDetails = async (gameId: string) => {
    const game = await Game.findById(gameId);
    if (!game) throw new Error('Game not found');
    return game;
};

export const startMatchmaking = async (matchmakingDetails: any) => {
    // Integrate matchmaking logic here
    return MatchmakingService.matchPlayers(matchmakingDetails);
};
