import { Request, Response } from 'express';
import { getGameDetails, startMatchmaking } from './game.service';
import { createError } from '../../utils/error-handler';

export const getGameController = async (req: Request, res: Response) => {
    try {
        const gameDetails = await getGameDetails(req.params.gameId);
        res.status(200).json(gameDetails);
    } catch (error) {
        createError(res, 404, 'Game not found');
    }
};

export const matchmakingController = async (req: Request, res: Response) => {
    try {
        const match = await startMatchmaking(req.body);
        res.status(200).json(match);
    } catch (error) {
        createError(res, 500, 'Matchmaking failed');
    }
};
