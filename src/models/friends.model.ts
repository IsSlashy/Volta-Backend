import { Schema, model, Document } from 'mongoose';

interface Friend extends Document {
    created: Date;
    accountId: string;
    list: {
        accepted: string[];
        incoming: string[];
        outgoing: string[];
        blocked: string[];
    };
}

const FriendsSchema = new Schema<Friend>({
    created: { type: Date, required: true },
    accountId: { type: String, required: true, unique: true },
    list: { type: Object, default: { accepted: [], incoming: [], outgoing: [], blocked: [] } }
}, {
    collection: 'friends'
});

export const FriendsModel = model<Friend>('Friends', FriendsSchema);
 