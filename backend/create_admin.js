require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const adminEmail = 'admin@ayush.com';
    const adminPassword = 'admin';
    
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        
        admin = await User.create({
            name: 'Quản trị viên',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin'
        });
        console.log('Admin account created successfully.');
    } else {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(adminPassword, salt);
        admin.role = 'admin';
        await admin.save();
        console.log('Admin account reset successfully.');
    }
    
    console.log(`
--- TÀI KHOẢN ADMIN ---
Email: ${adminEmail}
Mật khẩu: ${adminPassword}
-----------------------`);
    
    process.exit(0);
});
