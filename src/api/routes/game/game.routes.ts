import { Router } from 'express';
import { getGameController, matchmakingController } from './game.controller';

const router = Router();

router.get('/:gameId', getGameController);
router.post('/matchmaking', matchmakingController);

export default router;
