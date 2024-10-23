import { Router, Request, Response } from 'express';
import Profile from '../../models/profiles.model';
import { verifyToken } from '../../middleware/tokenVerify.middleware';
import * as profileManager from '../../services/profileManager.service';
import { createError } from '../../utils/error-handler';
import { log } from '../../utils/logger';
import { MakeID } from '../../utils/functions';
import quests from '../../responses/quests.json';

const router = Router();

// Endpoint to set the ability to receive gifts
router.post('/fortnite/api/game/v2/profile/*/client/SetReceiveGiftsEnabled', verifyToken, async (req: Request, res: Response) => {
    log.debug(`SetReceiveGiftsEnabled: Request received with body: ${JSON.stringify(req.body)}`);

    const profiles = await Profile.findOne({ accountId: req.user.accountId });
    log.debug(`SetReceiveGiftsEnabled: Fetched profiles for accountId: ${req.user.accountId}`);

    if (!await profileManager.validateProfile(req.query.profileId, profiles)) {
        log.debug(`SetReceiveGiftsEnabled: Validation failed for profileId: ${req.query.profileId}`);
        return createError(
            'errors.com.epicgames.modules.profiles.operation_forbidden',
            `Unable to find template configuration for profile ${req.query.profileId}`,
            [req.query.profileId],
            12813,
            undefined,
            403,
            res
        );
    }

    let profile = profiles.profiles[req.query.profileId];
    if (req.query.profileId !== 'common_core') {
        return createError(
            'errors.com.epicgames.modules.profiles.invalid_command',
            `SetReceiveGiftsEnabled is not valid on ${req.query.profileId} profile`,
            ['SetReceiveGiftsEnabled', req.query.profileId],
            12801,
            undefined,
            400,
            res
        );
    }

    if (typeof req.body.bReceiveGifts !== 'boolean') {
        return res.status(400).json({ error: 'bReceiveGifts must be a boolean' });
    }

    profile.stats.attributes.allowed_to_receive_gifts = req.body.bReceiveGifts;
    await profiles.updateOne({ $set: { [`profiles.${req.query.profileId}`]: profile } });

    res.json({
        profileRevision: profile.rvn,
        profileId: req.query.profileId,
        profileChanges: [{
            changeType: 'statModified',
            name: 'allowed_to_receive_gifts',
            value: profile.stats.attributes.allowed_to_receive_gifts
        }],
        serverTime: new Date().toISOString(),
        responseVersion: 1
    });
});

// Client Quest Login Endpoint with daily quests management
router.post('/fortnite/api/game/v2/profile/*/client/ClientQuestLogin', verifyToken, async (req: Request, res: Response) => {
    const profiles = await Profile.findOne({ accountId: req.user.accountId });

    if (!await profileManager.validateProfile(req.query.profileId, profiles)) {
        return createError(
            'errors.com.epicgames.modules.profiles.operation_forbidden',
            `Unable to find template configuration for profile ${req.query.profileId}`,
            [req.query.profileId],
            12813,
            undefined,
            403,
            res
        );
    }

    let profile = profiles.profiles[req.query.profileId];
    const athenaProfile = profiles.profiles['athena'];
    let ApplyProfileChanges: any[] = [];
    let StatChanged = false;
    const DateFormat = (new Date().toISOString()).split("T")[0];
    let QuestCount = 0;
    let ShouldGiveQuest = true;

    // Check existing daily quests in the profile
    for (const itemKey in profile.items) {
        if (profile.items[itemKey].templateId.toLowerCase().startsWith("quest:daily")) {
            QuestCount++;
        }
    }

    // Check if we should give new daily quests
    if (profile.stats.attributes.quest_manager?.dailyLoginInterval?.includes("T")) {
        const lastLoginDate = profile.stats.attributes.quest_manager.dailyLoginInterval.split("T")[0];
        ShouldGiveQuest = lastLoginDate !== DateFormat;
        if (!ShouldGiveQuest) {
            profile.stats.attributes.quest_manager.dailyQuestRerolls++;
        }
    }

    // Assign new daily quest if needed
    if (QuestCount < 3 && ShouldGiveQuest) {
        const NewQuestID = MakeID();
        const randomQuestIndex = Math.floor(Math.random() * quests.Daily.length);
        const selectedQuest = quests.Daily[randomQuestIndex];

        profile.items[NewQuestID] = {
            templateId: selectedQuest.templateId,
            attributes: {
                creation_time: new Date().toISOString(),
                level: -1,
                item_seen: false,
                sent_new_notification: false,
                xp_reward_scalar: 1,
                quest_state: "Active",
                last_state_change_time: new Date().toISOString(),
                max_level_bonus: 0,
                xp: 0,
                favorite: false
            },
            quantity: 1
        };

        ApplyProfileChanges.push({
            changeType: 'itemAdded',
            itemId: NewQuestID,
            item: profile.items[NewQuestID]
        });

        StatChanged = true;
    }

    // Apply changes if any stats were updated
    if (StatChanged) {
        profile.rvn += 1;
        profile.commandRevision += 1;
        profile.updated = new Date().toISOString();
        await profiles.updateOne({ $set: { [`profiles.${req.query.profileId}`]: profile } });
    }

    res.json({
        profileRevision: profile.rvn || 0,
        profileId: req.query.profileId,
        profileChanges: ApplyProfileChanges,
        serverTime: new Date().toISOString(),
        responseVersion: 1
    });
});
router.post('/fortnite/api/game/v2/profile/*/client/FortRerollDailyQuest', verifyToken, async (req: Request, res: Response) => {
    const profiles = await Profile.findOne({ accountId: req.user.accountId });
    let profile = profiles.profiles[req.query.profileId];

    let ApplyProfileChanges = [];
    let Notifications = [];
    let BaseRevision = profile.rvn || 0;
    let QueryRevision = req.query.rvn || -1;
    let StatChanged = false;

    const DailyQuestPath = req.query.profileId === 'profile0' ? './../responses/quests.json' : undefined;
    const DailyQuestIDS = JSON.parse(JSON.stringify(require(DailyQuestPath))).Daily;

    const NewQuestID = MakeID();
    let randomNumber = Math.floor(Math.random() * DailyQuestIDS.length);

    for (const key in profile.items) {
        while (DailyQuestIDS[randomNumber].templateId.toLowerCase() === profile.items[key].templateId.toLowerCase()) {
            randomNumber = Math.floor(Math.random() * DailyQuestIDS.length);
        }
    }

    if (req.body.questId && profile.stats.attributes.quest_manager.dailyQuestRerolls >= 1) {
        profile.stats.attributes.quest_manager.dailyQuestRerolls -= 1;
        delete profile.items[req.body.questId];

        profile.items[NewQuestID] = {
            templateId: DailyQuestIDS[randomNumber].templateId,
            attributes: {
                creation_time: new Date().toISOString(),
                level: -1,
                item_seen: false,
                sent_new_notification: false,
                xp_reward_scalar: 1,
                quest_state: 'Active',
                last_state_change_time: new Date().toISOString(),
                max_level_bonus: 0,
                xp: 0,
                favorite: false
            },
            quantity: 1
        };

        for (const objective of DailyQuestIDS[randomNumber].objectives) {
            profile.items[NewQuestID].attributes[`completion_${objective.toLowerCase()}`] = 0;
        }

        StatChanged = true;
    }

    if (StatChanged) {
        profile.rvn += 1;
        profile.commandRevision += 1;
        profile.updated = new Date().toISOString();

        ApplyProfileChanges.push({
            changeType: 'statModified',
            name: 'quest_manager',
            value: profile.stats.attributes.quest_manager
        });

        ApplyProfileChanges.push({
            changeType: 'itemAdded',
            itemId: NewQuestID,
            item: profile.items[NewQuestID]
        });

        ApplyProfileChanges.push({
            changeType: 'itemRemoved',
            itemId: req.body.questId
        });

        Notifications.push({
            type: 'dailyQuestReroll',
            primary: true,
            newQuestId: DailyQuestIDS[randomNumber].templateId
        });

        await profiles.updateOne({ $set: { [`profiles.${req.query.profileId}`]: profile } });
    }

    if (QueryRevision !== BaseRevision) {
        ApplyProfileChanges = [{
            changeType: 'fullProfileUpdate',
            profile: profile
        }];
    }

    res.json({
        profileRevision: profile.rvn || 0,
        profileId: req.query.profileId || 'athena',
        profileChangesBaseRevision: BaseRevision,
        profileChanges: ApplyProfileChanges,
        notifications: Notifications,
        profileCommandRevision: profile.commandRevision || 0,
        serverTime: new Date().toISOString(),
        responseVersion: 1
    });
});

export default router;
