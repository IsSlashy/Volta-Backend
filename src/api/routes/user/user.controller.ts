import { Request, Response } from 'express';
import { getUserProfile, updateUserProfile } from './user.service';
import { createError } from '../../utils/error-handler';

export const getUserController = async (req: Request, res: Response) => {
    try {
        const user = await getUserProfile(req.params.userId);
        res.status(200).json(user);
    } catch (error) {
        createError(res, 404, 'User not found');
    }
};

export const updateUserController = async (req: Request, res: Response) => {
    try {
        const updatedUser = await updateUserProfile(req.params.userId, req.body);
        res.status(200).json(updatedUser);
    } catch (error) {
        createError(res, 400, error.message);
    }
};
