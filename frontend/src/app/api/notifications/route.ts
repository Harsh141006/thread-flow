// ==========================================
// ThreadFlow — Notifications API
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import Notification from '@/models/Notification';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    await dbConnect();
    const notifications = await Notification.find({ user: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    await dbConnect();
    const body = await req.json();
    
    // Support marking a single notification or all as read
    if (body.markAllRead) {
      await Notification.updateMany(
        { user: session.user.id, read: false },
        { $set: { read: true } }
      );
    } else if (body.notificationId) {
      await Notification.findOneAndUpdate(
        { _id: body.notificationId, user: session.user.id },
        { $set: { read: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notifications read:', error);
    return NextResponse.json({ success: false, error: 'Failed to update notifications' }, { status: 500 });
  }
}
