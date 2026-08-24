import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Consultation from '@/models/Consultation';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireRole(['admin', 'sales', 'customer']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const consultation = await Consultation.findById(id).populate('customer', 'name company email').lean();

    if (!consultation) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const customerId = typeof consultation.customer === 'object' && consultation.customer !== null 
      ? (consultation.customer as any)._id?.toString() 
      : consultation.customer?.toString();

    if (session?.user.role === 'customer' && customerId !== session.user.customerId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: consultation });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireRole(['admin', 'sales', 'customer']);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const customerId = typeof consultation.customer === 'object' && consultation.customer !== null 
      ? (consultation.customer as any)._id?.toString() 
      : consultation.customer?.toString();

    if (session?.user.role === 'customer' && customerId !== session.user.customerId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    if (body.message) {
      consultation.messages.push({
        sender: session?.user.role === 'customer' ? 'customer' : 'admin',
        text: body.message,
        createdAt: new Date()
      });
      // automatically reopen if a new message is sent
      consultation.status = 'open';
    }

    if (body.status && ['admin', 'sales'].includes(session?.user.role || '')) {
      consultation.status = body.status;
    }

    await consultation.save();
    return NextResponse.json({ success: true, data: consultation });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
