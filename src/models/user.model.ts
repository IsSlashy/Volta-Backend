import { Schema, model, Document } from 'mongoose';

export interface User extends Document {
    created: Date;
    banned: boolean;
    discordId: string;
    accountId: string;
    username: string;
    username_lower: string;
    email: string;
    password: string;
    matchmakingId: string;
    isServer: boolean;
    currentSACCode?: string;
}

const UserSchema = new Schema<User>({
    created: { type: Date, required: true },
    banned: { type: Boolean, default: false },
    discordId: { type: String, required: true, unique: true },
    accountId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    username_lower: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    matchmakingId: { type: String, required: true, unique: true },
    isServer: { type: Boolean, default: false },
    currentSACCode: { type: String, default: null }
}, {
    collection: 'users'
});

export const UserModel = model<User>('User', UserSchema);
