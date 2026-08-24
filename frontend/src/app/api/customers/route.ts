// ==========================================
// ThreadFlow — Customers API (List + Create)
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Customer from '@/models/Customer';

// GET /api/customers — List customers with search & pagination
export async function GET(req: NextRequest) {
  const { session, error } = await requireRole(['admin', 'sales', 'designer', 'production']);
  if (error) return error;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Customer.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Customer.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Customers list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST /api/customers — Create a new customer
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(['admin', 'sales']);
  if (error) return error;

  try {
    await dbConnect();

    const body = await req.json();
    const { name, company, email, phone, address, notes } = body;

    if (!name || !company || !email || !phone || !address) {
      return NextResponse.json(
        { success: false, error: 'Name, company, email, phone, and address are required' },
        { status: 400 }
      );
    }

    const customer = await Customer.create({
      name,
      company,
      email,
      phone,
      address,
      notes,
      createdBy: session!.user.id,
    });

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error: unknown) {
    console.error('Customer create error:', error);
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A customer with this email already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
