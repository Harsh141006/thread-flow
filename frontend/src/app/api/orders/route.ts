// ==========================================
// ThreadFlow — Orders API (List + Create)
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import { requireRole } from '@/lib/api-auth';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import { getNextOrderId } from '@/models/Counter';

import Payment from '@/models/Payment';

// GET /api/orders — List orders with filters & pagination
export async function GET(req: NextRequest) {
  const { session, error } = await requireRole(['admin', 'sales', 'designer', 'production', 'qc', 'customer']);
  if (error) return error;

  try {
    await dbConnect();
    // Prevent Next.js from tree-shaking the Customer model
    if (!Customer.modelName) throw new Error('Customer model missing');

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    let customer = searchParams.get('customer');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || '-createdAt';

    // If customer role, force filter to their own orders
    if (session?.user.role === 'customer') {
      customer = session.user.customerId || null;
    }
    
    console.log('GET /api/orders called.', {
      role: session?.user?.role,
      sessionCustomerId: session?.user?.customerId,
      finalCustomerFilter: customer
    });

    const query: any = {};
    if (status) query.status = status;
    if (customer) query.customer = customer;
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { garmentType: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj: Record<string, 1 | -1> = {};
    if (sort.startsWith('-')) {
      sortObj[sort.slice(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    const [items, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'name company')
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
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
    console.error('Orders list error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders — Create a new order
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(['admin', 'sales', 'customer']);
  if (error) return error;

  try {
    const mongooseInstance = await dbConnect();

    const body = await req.json();
    let {
      customer, garmentType, quantity, sizes, embroideryPosition,
      designWidth, designHeight, stitchesPerItem, threadColors,
      deadline, priority, notes, estimatedTotal, paymentMethod,
      customerDesignPreview, shippingAddress, contactPhone
    } = body;

    // If role is customer, enforce their own customer ID
    if (session?.user.role === 'customer') {
      customer = session.user.customerId;
      // Also default statuses for self-serve
      priority = priority || 'normal';
    }

    if (!customer || !garmentType || !quantity || !sizes || !embroideryPosition ||
        !designWidth || !designHeight || !deadline) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const orderId = await getNextOrderId();

    const sessionTransaction = await mongooseInstance.startSession();
    sessionTransaction.startTransaction();

    try {
      const [order] = await Order.create([{
        orderId,
        customer,
        garmentType,
        quantity,
        sizes,
        embroideryPosition,
        designWidth,
        designHeight,
        stitchesPerItem: stitchesPerItem || 0,
        threadColors: threadColors || [],
        deadline: new Date(deadline),
        priority: priority || 'normal',
        notes,
        status: 'draft',
        customerDesignPreview,
        paymentMethod,
        shippingAddress,
        contactPhone,
        createdBy: session!.user.id,
      }], { session: sessionTransaction });

      // Create Payment if estimatedTotal is provided
      if (estimatedTotal && estimatedTotal > 0) {
        const payments = [];
        // We just record the intent for now or pretend it's paid/unpaid
        // We'll leave it unpaid but with totalAmount set
        await Payment.create([{
          order: order._id,
          totalAmount: estimatedTotal,
          status: 'unpaid',
          payments: [] 
          // If we want to record the method, we'd normally put it in an entry.
          // But since it's unpaid, we just setup the shell.
        }], { session: sessionTransaction });
      }

      await sessionTransaction.commitTransaction();
      sessionTransaction.endSession();

      return NextResponse.json({ success: true, data: order }, { status: 201 });
    } catch (err) {
      await sessionTransaction.abortTransaction();
      sessionTransaction.endSession();
      throw err;
    }
  } catch (error) {
    console.error('Order create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
