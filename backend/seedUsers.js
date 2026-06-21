// seedUsers.js
// Script to populate initial user accounts (admin, staff, customer)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Update the MongoDB connection string as needed
const MONGO_URI = 'mongodb://localhost:27017/ayush_coffee';

async function createUser({ name, email, password, role }) {
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed, role });
  await user.save();
  console.log(`${role} user created: ${email}`);
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    // Clear existing users (optional)
    await User.deleteMany({});

    await Promise.all([
      createUser({ name: 'Admin User', email: 'admin@example.com', password: 'AdminPass123', role: 'admin' }),
      createUser({ name: 'Staff User', email: 'staff@example.com', password: 'StaffPass123', role: 'staff' }),
      createUser({ name: 'Customer User', email: 'customer@example.com', password: 'CustomerPass123', role: 'user' })
    ]);
    console.log('Seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding users:', err);
    process.exit(1);
  }
}

seed();
