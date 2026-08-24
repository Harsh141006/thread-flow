// ==========================================
// ThreadFlow — Production Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';
import { ProductionStatus } from '@/types';

export interface ProductionDocument extends Document {
  order: mongoose.Types.ObjectId;
  machine: mongoose.Types.ObjectId;
  status: ProductionStatus;
  startTime?: Date;
  endTime?: Date;
  completedQuantity: number;
  totalQuantity: number;
  assignedBy: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductionSchema = new Schema<ProductionDocument>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    machine: { type: Schema.Types.ObjectId, ref: 'Machine', required: true },
    status: {
      type: String,
      enum: ['queued', 'running', 'paused', 'done'],
      default: 'queued',
    },
    startTime: { type: Date },
    endTime: { type: Date },
    completedQuantity: { type: Number, default: 0, min: 0 },
    totalQuantity: { type: Number, required: true, min: 1 },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

ProductionSchema.index({ status: 1 });
ProductionSchema.index({ order: 1 });

export default mongoose.models.Production as mongoose.Model<ProductionDocument> ||
  mongoose.model<ProductionDocument>('Production', ProductionSchema);
