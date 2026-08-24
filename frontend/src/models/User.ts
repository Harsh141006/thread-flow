// ==========================================
// ThreadFlow — User Model
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@/types';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  active: boolean;
  customerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'sales', 'designer', 'production', 'qc', 'customer'],
      required: true,
    },
    phone: { type: String, trim: true },
    active: { type: Boolean, default: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  },
  { timestamps: true }
);

// Prevent model recompilation in development (Next.js hot reload)
export default mongoose.models.User as mongoose.Model<UserDocument> ||
  mongoose.model<UserDocument>('User', UserSchema);
