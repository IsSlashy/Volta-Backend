import { Router, Request, Response } from 'express';

const router = Router();

// Example Party endpoint (you can adjust this based on what `party.js` had)
router.get('/fortnite/api/party', (req: Request, res: Response) => {
    res.json({
        partyId: "example-party-id",
        members: []
    });
});

export default router;
