// ==========================================
// ThreadFlow — Inventory Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';
import { InventoryCategory } from '@/types';

export interface InventoryDocument extends Document {
  name: string;
  category: InventoryCategory;
  color?: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  supplier?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<InventoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['thread', 'fabric', 'needle', 'stabilizer', 'misc'],
      required: true,
    },
    color: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    reorderLevel: { type: Number, required: true, min: 0 },
    supplier: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Inventory as mongoose.Model<InventoryDocument> ||
  mongoose.model<InventoryDocument>('Inventory', InventorySchema);
