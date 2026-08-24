// ==========================================
// ThreadFlow — Order Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus } from '@/types';

export interface OrderDocument extends Document {
  orderId: string;
  customer: mongoose.Types.ObjectId;
  garmentType: string;
  quantity: number;
  sizes: Record<string, any>; // Used to be string
  embroideryPosition: string;
  designWidth: number;
  designHeight: number;
  stitchesPerItem: number;
  threadColors: string[];
  clothColor?: string;
  deadline: Date;
  status: OrderStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedTo?: mongoose.Types.ObjectId;
  notes?: string;
  designFile?: string;
  customerDesignPreview?: string;
  paymentMethod?: string;
  shippingAddress?: string;
  contactPhone?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<OrderDocument>(
  {
    orderId: { type: String, required: true, unique: true }, // TF-1001
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    garmentType: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    sizes: { type: Schema.Types.Mixed, required: true }, // Can be object {S:10, M:20} or {blouseSize:34}
    embroideryPosition: { type: String, required: true, trim: true },
    designWidth: { type: Number, required: true, min: 1 }, // mm
    designHeight: { type: Number, required: true, min: 1 }, // mm
    stitchesPerItem: { type: Number, required: true, min: 0 },
    threadColors: [{ type: String, trim: true }],
    clothColor: { type: String, trim: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['draft', 'design', 'approval', 'scheduled', 'production', 'qc', 'rework', 'packed', 'dispatched', 'delivered', 'rejected'],
      default: 'draft',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true },
    designFile: { type: String }, // For admin uploading technical design
    customerDesignPreview: { type: String }, // Base64 image uploaded by customer
    paymentMethod: { type: String, trim: true },
    shippingAddress: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Index for efficient queries
OrderSchema.index({ status: 1, deadline: 1 });
OrderSchema.index({ customer: 1, createdAt: -1 });

export default mongoose.models.Order as mongoose.Model<OrderDocument> ||
  mongoose.model<OrderDocument>('Order', OrderSchema);
