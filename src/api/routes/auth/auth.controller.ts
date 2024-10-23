import { Request, Response } from 'express';
import { loginService, registerService } from './auth.service';
import { createError } from '../../../utils/error-handler';

export const loginController = async (req: Request, res: Response) => {
    try {
        const token = await loginService(req.body);
        res.status(200).json({ token });
    } catch (error) {
        createError(res, 401, 'Invalid credentials');
    }
};

export const registerController = async (req: Request, res: Response) => {
    try {
        const user = await registerService(req.body);
        res.status(201).json(user);
    } catch (error) {
        createError(res, 400, error.message);
    }
};
