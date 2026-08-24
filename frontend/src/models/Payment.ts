// ==========================================
// ThreadFlow — Payment Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';
import { PaymentStatus } from '@/types';

export interface PaymentEntryDoc {
  amount: number;
  method: string;
  date: Date;
  note?: string;
}

export interface PaymentDocument extends Document {
  order: mongoose.Types.ObjectId;
  totalAmount: number;
  payments: PaymentEntryDoc[];
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentEntrySchema = new Schema<PaymentEntryDoc>(
  {
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true },
  },
  { _id: true }
);

const PaymentSchema = new Schema<PaymentDocument>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    totalAmount: { type: Number, required: true, min: 0 },
    payments: [PaymentEntrySchema],
    status: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Payment as mongoose.Model<PaymentDocument> ||
  mongoose.model<PaymentDocument>('Payment', PaymentSchema);
