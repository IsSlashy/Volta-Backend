import { Router, Request, Response } from 'express';
import { FriendsModel } from '../../../models/friends.model';

const router = Router();

router.get('/fortnite/api/friends/:accountId', async (req: Request, res: Response) => {
    const accountId = req.params.accountId;
    const friendsList = await FriendsModel.findOne({ accountId });

    if (!friendsList) {
        return res.status(404).json({ error: 'Friends list not found' });
    }

    res.json(friendsList.list);
});

export default router;
