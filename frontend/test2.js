const mongoose = require('mongoose');

async function checkDb() {
  await mongoose.connect('mongodb+srv://ravishankar4068_db_user:lavSJpo3ZoGT8BGr@cluster0.ecxkbpe.mongodb.net/?appName=Cluster0');
  const db = mongoose.connection;
  
  const orders = await db.collection('orders').find({}).toArray();
  orders.forEach(o => console.log(o.orderId, o.customer, typeof o.customer, o.customer instanceof mongoose.Types.ObjectId));

  process.exit(0);
}
checkDb();
