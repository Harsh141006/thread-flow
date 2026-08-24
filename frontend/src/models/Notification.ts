// ==========================================
// ThreadFlow — Notification Model
// ==========================================

import mongoose from 'mongoose';
import { INotification } from '@/types';

const NotificationSchema = new mongoose.Schema<INotification>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
