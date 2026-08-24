import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Consultation from '@/models/Consultation';

export async function GET(req: NextRequest) {
  const { session, error } = await requireRole(['admin', 'sales', 'customer']);
  if (error) return error;

  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    let customer: string | null | undefined = searchParams.get('customer');

    if (session?.user.role === 'customer') {
      customer = session.user.customerId;
    }

    const query: any = {};
    if (status) query.status = status;
    if (customer) query.customer = customer;

    const consultations = await Consultation.find(query)
      .populate('customer', 'name company email')
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: consultations });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(['admin', 'sales', 'customer']);
  if (error) return error;

  try {
    await dbConnect();
    const body = await req.json();
    let { customer, initialMessage } = body;

    if (session?.user.role === 'customer') {
      customer = session.user.customerId;
    }

    if (!customer || !initialMessage) {
      return NextResponse.json({ success: false, error: 'Missing customer or message' }, { status: 400 });
    }

    const consultation = await Consultation.create({
      customer,
      status: 'open',
      messages: [{ sender: session?.user.role === 'customer' ? 'customer' : 'admin', text: initialMessage }],
    });

    return NextResponse.json({ success: true, data: consultation }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
