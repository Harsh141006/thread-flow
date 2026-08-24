// ==========================================
// ThreadFlow — Signup API
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Customer from '@/models/Customer';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, company, email, phone, address, password } = body;

    if (!name || !email || !password || !phone || !address) {
      return NextResponse.json(
        { success: false, error: 'Name, email, password, phone, and address are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Start a MongoDB session for atomic transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Create User
      const passwordHash = await bcrypt.hash(password, 10);
      const [user] = await User.create([{
        name,
        email: email.toLowerCase(),
        password: passwordHash,
        role: 'customer',
        active: true,
        phone,
      }], { session });

      // 2. Create Customer Profile
      const [customer] = await Customer.create([{
        name,
        company: company || name,
        email: email.toLowerCase(),
        phone,
        address,
        createdBy: user._id, // Self-created
      }], { session });

      // 3. Link User to Customer
      user.customerId = customer._id;
      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({ success: true, message: 'Account created successfully' }, { status: 201 });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create account. Please try again later.' },
      { status: 500 }
    );
  }
}
