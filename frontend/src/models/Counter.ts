// ==========================================
// ThreadFlow — Counter Model (auto-increment order IDs)
// ==========================================

import mongoose, { Schema, Document } from 'mongoose';

export interface CounterDocument extends Document {
  name: string;
  value: number;
}

const CounterSchema = new Schema<CounterDocument>({
  name: { type: String, required: true, unique: true },
  value: { type: Number, required: true, default: 1000 },
});

/**
 * Get next order ID (TF-1001, TF-1002, etc.)
 * Uses findOneAndUpdate for atomic increment.
 */
export async function getNextOrderId(): Promise<string> {
  const Counter = mongoose.models.Counter as mongoose.Model<CounterDocument> ||
    mongoose.model<CounterDocument>('Counter', CounterSchema);

  const counter = await Counter.findOneAndUpdate(
    { name: 'orderId' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  return `TF-${counter.value}`;
}

export default mongoose.models.Counter as mongoose.Model<CounterDocument> ||
  mongoose.model<CounterDocument>('Counter', CounterSchema);
