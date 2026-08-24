// ==========================================
// ThreadFlow — Machine Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';
import { MachineStatus } from '@/types';

export interface MachineDocument extends Document {
  name: string;
  type: string;
  stitchesPerHour: number;
  status: MachineStatus;
  currentOrder?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MachineSchema = new Schema<MachineDocument>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    stitchesPerHour: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'idle'],
      default: 'idle',
    },
    currentOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Machine as mongoose.Model<MachineDocument> ||
  mongoose.model<MachineDocument>('Machine', MachineSchema);
