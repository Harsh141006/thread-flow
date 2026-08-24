// ==========================================
// ThreadFlow — Seed Script
// ==========================================

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, OrderStatus, ProductionStatus, RiskLevel } from '../frontend/src/types';

// Connection String (Ensure you pass this via env variable when running)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/threadflow';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    // Clear existing data
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      await mongoose.connection.collections[collectionName].deleteMany({});
      console.log(`Cleared ${collectionName}`);
    }

    // 1. Users (Roles)
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [
      { name: 'Admin User', email: 'admin@threadflow.com', password: passwordHash, role: 'admin' as UserRole, active: true },
      { name: 'Sales Manager', email: 'sales@threadflow.com', password: passwordHash, role: 'sales' as UserRole, active: true },
      { name: 'Lead Designer', email: 'designer@threadflow.com', password: passwordHash, role: 'designer' as UserRole, active: true },
      { name: 'Production Lead', email: 'production@threadflow.com', password: passwordHash, role: 'production' as UserRole, active: true },
      { name: 'QC Inspector', email: 'qc@threadflow.com', password: passwordHash, role: 'qc' as UserRole, active: true },
      { name: 'Customer Demo', email: 'customer@threadflow.com', password: passwordHash, role: 'customer' as UserRole, active: true },
    ];

    const User = mongoose.connection.collection('users');
    const { insertedIds: userIds } = await User.insertMany(users.map(u => ({ ...u, createdAt: new Date(), updatedAt: new Date() })));
    console.log('Created Users');

    const adminId = userIds[0];
    const customerUserId = userIds[5];

    // 2. Customers
    const Customer = mongoose.connection.collection('customers');
    const customers = [
      { name: 'John Doe', company: 'Acme Corp', email: 'customer@threadflow.com', phone: '123-456-7890', address: '123 Main St', createdBy: adminId, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Jane Smith', company: 'Tech Innovators', email: 'jane@techinnovators.com', phone: '987-654-3210', address: '456 Tech Park', createdBy: adminId, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bob Johnson', company: 'Global Merch', email: 'bob@globalmerch.com', phone: '555-555-5555', address: '789 Merch Ave', createdBy: adminId, createdAt: new Date(), updatedAt: new Date() },
    ];
    const { insertedIds: customerIds } = await Customer.insertMany(customers);
    
    // Link the customer demo user to the first customer
    await User.updateOne({ _id: customerUserId }, { $set: { customerId: customerIds[0] } });
    console.log('Created Customers');

    // 3. Counter for Order ID
    const Counter = mongoose.connection.collection('counters');
    await Counter.insertOne({ name: 'orderId', value: 1010 });

    // 4. Orders
    const Order = mongoose.connection.collection('orders');
    const now = new Date();
    const orders = [
      { orderId: 'TF-1001', customer: customerIds[0], garmentType: 'Polo Shirt', quantity: 100, sizes: 'S-20, M-40, L-40', embroideryPosition: 'Left Chest', designWidth: 80, designHeight: 80, stitchesPerItem: 12000, threadColors: ['Navy', 'White'], deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), status: 'scheduled' as OrderStatus, priority: 'normal', createdBy: adminId, createdAt: new Date(), updatedAt: new Date() },
      { orderId: 'TF-1002', customer: customerIds[1], garmentType: 'Cap', quantity: 50, sizes: 'One Size', embroideryPosition: 'Front Center', designWidth: 100, designHeight: 50, stitchesPerItem: 8000, threadColors: ['Red', 'Black'], deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), status: 'design' as OrderStatus, priority: 'high', createdBy: adminId, createdAt: new Date(), updatedAt: new Date() },
      { orderId: 'TF-1003', customer: customerIds[2], garmentType: 'Jacket', quantity: 200, sizes: 'M-100, L-100', embroideryPosition: 'Back Center', designWidth: 250, designHeight: 200, stitchesPerItem: 45000, threadColors: ['Gold', 'Silver'], deadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), status: 'production' as OrderStatus, priority: 'normal', createdBy: adminId, createdAt: new Date(), updatedAt: new Date() },
      { orderId: 'TF-1004', customer: customerIds[0], garmentType: 'T-Shirt', quantity: 500, sizes: 'Various', embroideryPosition: 'Left Chest', designWidth: 60, designHeight: 60, stitchesPerItem: 5000, threadColors: ['Blue'], deadline: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), status: 'approval' as OrderStatus, priority: 'urgent', createdBy: adminId, createdAt: new Date(), updatedAt: new Date() }, // Overdue
      { orderId: 'TF-1005', customer: customerIds[1], garmentType: 'Hoodie', quantity: 150, sizes: 'L-150', embroideryPosition: 'Left Chest', designWidth: 70, designHeight: 70, stitchesPerItem: 10000, threadColors: ['White'], deadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), status: 'qc' as OrderStatus, priority: 'high', createdBy: adminId, createdAt: new Date(), updatedAt: new Date() },
    ];
    const { insertedIds: orderIds } = await Order.insertMany(orders);
    console.log('Created Orders');

    // 5. Machines
    const Machine = mongoose.connection.collection('machines');
    const machines = [
      { name: 'Tajima 1', type: '6-Head', stitchesPerHour: 45000, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Barudan 1', type: '4-Head', stitchesPerHour: 32000, status: 'active', currentOrder: orderIds[2], createdAt: new Date(), updatedAt: new Date() },
      { name: 'SWF 1', type: 'Single-Head', stitchesPerHour: 8000, status: 'maintenance', createdAt: new Date(), updatedAt: new Date() },
    ];
    const { insertedIds: machineIds } = await Machine.insertMany(machines);
    console.log('Created Machines');

    // 6. Production Records
    const Production = mongoose.connection.collection('productions');
    await Production.insertOne({
      order: orderIds[2], // TF-1003
      machine: machineIds[1],
      status: 'running' as ProductionStatus,
      startTime: new Date(),
      completedQuantity: 50,
      totalQuantity: 200,
      assignedBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Created Production Records');

    // 7. Inventory
    const Inventory = mongoose.connection.collection('inventories');
    const inventoryItems = [
      { name: 'Navy Blue Thread', category: 'thread', color: 'Navy Blue', quantity: 15, unit: 'cones', reorderLevel: 20, supplier: 'Madeira', createdAt: new Date(), updatedAt: new Date() }, // Low stock
      { name: 'White Thread', category: 'thread', color: 'White', quantity: 50, unit: 'cones', reorderLevel: 10, supplier: 'Madeira', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Cutaway Stabilizer', category: 'stabilizer', quantity: 2, unit: 'rolls', reorderLevel: 5, supplier: 'Gunold', createdAt: new Date(), updatedAt: new Date() }, // Low stock
      { name: 'Needles 75/11', category: 'needle', quantity: 1000, unit: 'pcs', reorderLevel: 200, supplier: 'Groz-Beckert', createdAt: new Date(), updatedAt: new Date() },
    ];
    await Inventory.insertMany(inventoryItems);
    console.log('Created Inventory');

    // 8. Payments
    const Payment = mongoose.connection.collection('payments');
    const payments = [
      { order: orderIds[0], totalAmount: 1500, payments: [{ amount: 500, method: 'Bank Transfer', date: new Date() }], status: 'partial', createdAt: new Date(), updatedAt: new Date() },
      { order: orderIds[1], totalAmount: 750, payments: [], status: 'unpaid', createdAt: new Date(), updatedAt: new Date() },
      { order: orderIds[2], totalAmount: 5000, payments: [{ amount: 5000, method: 'Cheque', date: new Date() }], status: 'paid', createdAt: new Date(), updatedAt: new Date() },
    ];
    await Payment.insertMany(payments);
    console.log('Created Payments');

    // 9. Designs
    const Design = mongoose.connection.collection('designs');
    const designs = [
      { order: orderIds[1], versions: [{ version: 1, imageUrl: 'https://via.placeholder.com/150', uploadedBy: adminId, createdAt: new Date() }], currentVersion: 1, createdAt: new Date(), updatedAt: new Date() },
      { order: orderIds[3], versions: [{ version: 1, imageUrl: 'https://via.placeholder.com/150', uploadedBy: adminId, createdAt: new Date() }], currentVersion: 1, createdAt: new Date(), updatedAt: new Date() },
    ];
    await Design.insertMany(designs);
    console.log('Created Designs');

    console.log('Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
