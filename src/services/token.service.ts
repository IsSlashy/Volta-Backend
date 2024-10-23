import jwt from 'jsonwebtoken';
import { MakeID } from '../utils/functions';

export const createClient = (clientId: string, grant_type: string, ip: string, expiresIn: number): string => {
    const clientToken = jwt.sign({
        p: Buffer.from(MakeID()).toString('base64'),
        clsvc: 'fortnite',
        t: 's',
        mver: false,
        clid: clientId,
        ic: true,
        am: grant_type,
        jti: MakeID().replace(/-/g, ''),
        creation_date: new Date(),
        hours_expire: expiresIn
    }, process.env.JWT_SECRET!, { expiresIn: `${expiresIn}h` });

    global.clientTokens.push({ ip, token: `eg1~${clientToken}` });
    return clientToken;
};

export const createAccess = (user: any, clientId: string, grant_type: string, deviceId: string, expiresIn: number): string => {
    const accessToken = jwt.sign({
        app: 'fortnite',
        sub: user.accountId,
        dvid: deviceId,
        mver: false,
        clid: clientId,
        dn: user.username,
        am: grant_type,
        p: Buffer.from(MakeID()).toString('base64'),
        iai: user.accountId,
        sec: 1,
        clsvc: 'fortnite',
        t: 's',
        ic: true,
        jti: MakeID().replace(/-/g, ''),
        creation_date: new Date(),
        hours_expire: expiresIn
    }, process.env.JWT_SECRET!, { expiresIn: `${expiresIn}h` });

    global.accessTokens.push({ accountId: user.accountId, token: `eg1~${accessToken}` });
    return accessToken;
};

export const createRefresh = (user: any, clientId: string, grant_type: string, deviceId: string, expiresIn: number): string => {
    const refreshToken = jwt.sign({
        sub: user.accountId,
        dvid: deviceId,
        t: 'r',
        clid: clientId,
        am: grant_type,
        jti: MakeID().replace(/-/g, ''),
        creation_date: new Date(),
        hours_expire: expiresIn
    }, process.env.JWT_SECRET!, { expiresIn: `${expiresIn}h` });

    global.refreshTokens.push({ accountId: user.accountId, token: `eg1~${refreshToken}` });
    return refreshToken;
};
