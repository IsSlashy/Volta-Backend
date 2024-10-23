import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

router.get('/fortnite/api/cloudstorage/system', (req: Request, res: Response) => {
    const cloudPath = path.join(__dirname, '../../CloudStorage');
    const files = fs.readdirSync(cloudPath).map(file => {
        return {
            uniqueFilename: file,
            filename: file,
            hash: 'hash123', // Replace with actual hash logic
            hash256: 'hash256',
            length: fs.statSync(path.join(cloudPath, file)).size,
            contentType: 'application/octet-stream',
            uploaded: new Date().toISOString()
        };
    });
    res.json(files);
});

export default router;
