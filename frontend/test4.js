const mongoose = require('mongoose');

async function checkDb() {
  await mongoose.connect('mongodb+srv://ravishankar4068_db_user:lavSJpo3ZoGT8BGr@cluster0.ecxkbpe.mongodb.net/?appName=Cluster0');
  
  // Need to import/require models carefully because of Next.js setup, we can define schema locally
  const OrderSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }
  });
  const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

  const items = await Order.find({ customer: "6a8c35b762ecdc34ef4d0e7f" }).lean();
  console.log('Found:', items.length);
  process.exit(0);
}
checkDb();
