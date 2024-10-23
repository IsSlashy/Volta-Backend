import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Function to create a unique ID
export const MakeID = (): string => {
    return crypto.randomBytes(16).toString('hex');
};

// Function to decode base64 strings
export const DecodeBase64 = (data: string): string => {
    return Buffer.from(data, 'base64').toString();
};

// Function to send XMPP messages to a user by ID
export const sendXmppMessageToId = (message: any, accountId: string): void => {
    const client = global.Clients.find(c => c.accountId === accountId);
    if (client) {
        client.client.send(JSON.stringify(message));
    }
};

// Function to check if a file exists
export const fileExists = (filePath: string): boolean => {
    return fs.existsSync(filePath);
};

// Function to load configuration from a JSON file
export const loadConfig = (configPath: string): any => {
    if (!fileExists(configPath)) {
        throw new Error(`Config file not found: ${configPath}`);
    }

    const rawData = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(rawData);
};
