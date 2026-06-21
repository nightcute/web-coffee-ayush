require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const adminEmail = 'admin@ayush.com';
    const adminPassword = 'admin';
    
    // Delete existing admin
    await User.deleteMany({ email: adminEmail });
    
    // Create new admin with plain password so pre-save hook handles hashing
    await User.create({
        name: 'Quản trị viên',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
    });
    
    console.log('Admin account fixed successfully.');
    process.exit(0);
});
