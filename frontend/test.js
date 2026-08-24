const mongoose = require('mongoose');

async function checkDb() {
  await mongoose.connect('mongodb+srv://ravishankar4068_db_user:lavSJpo3ZoGT8BGr@cluster0.ecxkbpe.mongodb.net/?appName=Cluster0');
  const db = mongoose.connection;
  
  const users = await db.collection('users').find({}).toArray();
  console.log('Users:', users.map(u => ({ email: u.email, role: u.role, customerId: u.customerId })));

  const orders = await db.collection('orders').find({}).toArray();
  console.log('Orders:', orders.length);
  if (orders.length > 0) {
    console.log('First order customer:', orders[0].customer);
  }

  process.exit(0);
}

checkDb();
