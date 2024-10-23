import { Schema, model, Document } from 'mongoose';

interface Profile extends Document {
    created: Date;
    accountId: string;
    profiles: Record<string, any>;
}

const ProfilesSchema = new Schema<Profile>({
    created: { type: Date, required: true },
    accountId: { type: String, required: true, unique: true },
    profiles: { type: Object, required: true }
}, {
    collection: 'profiles'
});

export const ProfileModel = model<Profile>('Profile', ProfilesSchema);
