import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import { createError } from '../utils/error-handler';

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('bearer eg1~')) {
        return createError(res, 401, 'Authorization failed');
    }

    const token = req.headers.authorization.replace('bearer eg1~', '');

    try {
        const decodedToken = jwt.decode(token) as any;
        if (!global.accessTokens.find(i => i.token === `eg1~${token}`)) {
            throw new Error('Invalid token.');
        }

        if (new Date(decodedToken.creation_date).getTime() + decodedToken.hours_expire * 3600000 <= Date.now()) {
            throw new Error('Expired access token.');
        }

        req.user = await UserModel.findOne({ accountId: decodedToken.sub }).lean();
        if (req.user?.banned) {
            return createError(res, 400, 'User is banned');
        }

        next();
    } catch {
        global.accessTokens = global.accessTokens.filter(i => i.token !== `eg1~${token}`);
        return createError(res, 401, 'Authorization failed');
    }
};
