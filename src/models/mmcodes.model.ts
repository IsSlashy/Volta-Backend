import { Schema, model, Document } from 'mongoose';

interface MMCode extends Document {
    created: Date;
    owner: string;
    code: string;
    code_lower: string;
    ip: string;
    port: number;
    private?: boolean;
}

const MMCodesSchema = new Schema<MMCode>({
    created: { type: Date, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'UserSchema' },
    code: { type: String, required: true },
    code_lower: { type: String, required: true },
    ip: { type: String, required: true },
    port: { type: Number, required: true },
    private: { type: Boolean, default: false }
}, {
    collection: 'mmcodes'
});

export const MMCodeModel = model<MMCode>('MMCode', MMCodesSchema);
