import { Schema, model, Document } from 'mongoose';

interface SACCode extends Document {
    created: Date;
    createdby: string;
    owneraccountId: string;
    code: string;
    code_lower: string;
    code_higher: string;
}

const SACCodesSchema = new Schema<SACCode>({
    created: { type: Date, required: true },
    createdby: { type: String, required: true },
    owneraccountId: { type: String, required: true },
    code: { type: String, required: true },
    code_lower: { type: String, required: true },
    code_higher: { type: String, required: true }
}, {
    collection: 'SACcodes'
});

export const SACCodeModel = model<SACCode>('SACCode', SACCodesSchema);
