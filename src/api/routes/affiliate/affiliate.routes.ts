import { Router, Request, Response } from 'express';
import { codesModel } from '../../../models/saccodes.model';
import { ProfileModel } from '../../../models/profiles.model';
import { verifyToken } from '../../../middleware/tokenVerify.middleware';
import { log } from '../../../utils/logger';

const router = Router();

// Get affiliate by slug
router.get('/affiliate/api/public/affiliates/slug/:slug', async (req: Request, res: Response) => {
    const slug = req.params.slug.toLowerCase();
    log.debug(`GET /affiliate/api/public/affiliates/slug/${slug} called`);

    const code = await codesModel.findOne({ code_lower: slug });
    if (!code) {
        log.debug(`Code not found: ${slug}`);
        return res.status(404).json({});
    }

    log.debug(`Code found: ${code.code}`);
    return res.json({
        id: code.code,
        slug: code.code,
        displayName: code.code,
        code_higher: code.code_higher,
        status: 'ACTIVE',
        verified: false
    });
});

// Set affiliate name
router.post('/fortnite/api/game/v2/profile/*/client/SetAffiliateName', verifyToken, async (req: Request, res: Response) => {
    const profiles = await ProfileModel.findOne({ accountId: req.params[0] });
    if (!profiles) return res.status(404).json({ error: 'Profile not found' });

    const profile = profiles.profiles[req.query.profileId as string];
    const slug = req.body.affiliateName.toLowerCase();
    const code = await codesModel.findOne({ code_lower: slug });

    if (!code) return res.status(404).json({});

    profile.stats.attributes.mtx_affiliate = code.code;
    profile.stats.attributes.mtx_affiliate_set_time = new Date().toISOString();
    profile.rvn += 1;
    profile.commandRevision += 1;

    await profiles.updateOne({ $set: { [`profiles.${req.query.profileId}`]: profile } });
    return res.json({
        profileRevision: profile.rvn,
        profileChangesBaseRevision: profile.rvn,
        profileChanges: [{ changeType: 'statModified', name: 'mtx_affiliate', value: code.code }],
        serverTime: new Date().toISOString(),
        responseVersion: 1
    });
});

export default router;
