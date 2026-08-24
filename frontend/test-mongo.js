const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const order = await db.collection('orders').findOne({});
  console.log('Order status:', order.status, 'Order ID:', order._id);

  try {
    const OrderSchema = new mongoose.Schema({}, { strict: false });
    const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);
    
    const res = await OrderModel.findByIdAndUpdate(
      order._id,
      { $set: { status: 'dispatched' } },
      { new: true, runValidators: true }
    );
    console.log('Update successful:', res.status);
  } catch (e) {
    console.error('Update failed:', e);
  }
  process.exit(0);
});
