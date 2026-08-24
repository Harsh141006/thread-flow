// ==========================================
// ThreadFlow — Design Model (versioned)
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';

export interface DesignVersionDoc {
  _id: mongoose.Types.ObjectId;
  version: number;
  imageUrl: string;
  thumbnailUrl?: string;
  uploadedBy: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
}

export interface DesignDocument extends Document {
  order: mongoose.Types.ObjectId;
  versions: DesignVersionDoc[];
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const DesignVersionSchema = new Schema<DesignVersionDoc>(
  {
    version: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const DesignSchema = new Schema<DesignDocument>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    versions: [DesignVersionSchema],
    currentVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.models.Design as mongoose.Model<DesignDocument> ||
  mongoose.model<DesignDocument>('Design', DesignSchema);
