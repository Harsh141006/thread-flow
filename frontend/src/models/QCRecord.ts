// ==========================================
// ThreadFlow — QC Record Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';
import { QCResult } from '@/types';

export interface QCCheckItemDoc {
  name: string;
  passed: boolean;
  notes?: string;
}

export interface QCRecordDocument extends Document {
  order: mongoose.Types.ObjectId;
  checklist: QCCheckItemDoc[];
  result: QCResult;
  inspector: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
}

const QCCheckItemSchema = new Schema<QCCheckItemDoc>(
  {
    name: { type: String, required: true },
    passed: { type: Boolean, required: true },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const QCRecordSchema = new Schema<QCRecordDocument>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    checklist: [QCCheckItemSchema],
    result: {
      type: String,
      enum: ['pass', 'rework'],
      required: true,
    },
    inspector: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

QCRecordSchema.index({ order: 1, createdAt: -1 });

export default mongoose.models.QCRecord as mongoose.Model<QCRecordDocument> ||
  mongoose.model<QCRecordDocument>('QCRecord', QCRecordSchema);
