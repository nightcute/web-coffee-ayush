require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
        console.log(`Admin found:
Email: ${adminUser.email}
Name: ${adminUser.name}`);
    } else {
        console.log("No admin account found in database.");
    }
    process.exit(0);
});
