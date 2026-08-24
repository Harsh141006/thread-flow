// ==========================================
// ThreadFlow — Customer Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';

export interface CustomerDocument extends Document {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<CustomerDocument>(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Text index for search
CustomerSchema.index({ name: 'text', company: 'text', email: 'text' });

export default mongoose.models.Customer as mongoose.Model<CustomerDocument> ||
  mongoose.model<CustomerDocument>('Customer', CustomerSchema);
