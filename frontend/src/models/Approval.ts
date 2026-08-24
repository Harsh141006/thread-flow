// ==========================================
// ThreadFlow — Approval Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';
import { ApprovalDecision } from '@/types';

export interface ApprovalDocument extends Document {
  order: mongoose.Types.ObjectId;
  design: mongoose.Types.ObjectId;
  designVersion: number;
  decision: ApprovalDecision;
  comment: string;
  decidedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ApprovalSchema = new Schema<ApprovalDocument>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    design: { type: Schema.Types.ObjectId, ref: 'Design', required: true },
    designVersion: { type: Number, required: true },
    decision: {
      type: String,
      enum: ['approved', 'revision'],
      required: true,
    },
    comment: { type: String, required: true, trim: true },
    decidedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ApprovalSchema.index({ order: 1, createdAt: -1 });

export default mongoose.models.Approval as mongoose.Model<ApprovalDocument> ||
  mongoose.model<ApprovalDocument>('Approval', ApprovalSchema);
