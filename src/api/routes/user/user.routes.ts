import { Router } from 'express';
import { getUserController, updateUserController } from './user.controller';

const router = Router();

router.get('/:userId', getUserController);
router.put('/:userId', updateUserController);

export default router;
