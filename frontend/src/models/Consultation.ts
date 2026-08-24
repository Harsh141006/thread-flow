// ==========================================
// ThreadFlow — Consultation Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';
import { IConsultation } from '@/types';

export interface ConsultationDocument extends Document, Omit<IConsultation, '_id'> {}

const ConsultationMessageSchema = new Schema(
  {
    sender: { type: String, enum: ['customer', 'admin'], required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ConsultationSchema = new Schema<ConsultationDocument>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    status: {
      type: String,
      enum: ['open', 'resolved'],
      default: 'open',
    },
    messages: [ConsultationMessageSchema],
  },
  { timestamps: true }
);

// Index for efficient queries
ConsultationSchema.index({ customer: 1, status: 1 });
ConsultationSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Consultation as mongoose.Model<ConsultationDocument> ||
  mongoose.model<ConsultationDocument>('Consultation', ConsultationSchema);
