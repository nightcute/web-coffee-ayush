const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');

dotenv.config();

const test = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const completedOrders = await Order.find({ status: 'completed' });
  console.log("Total completed orders:", completedOrders.length);
  
  const dailyData = {};
  completedOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const dayMonthYear = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      dailyData[dayMonthYear] = (dailyData[dayMonthYear] || 0) + order.totalAmount;
  });

  const dailyRevenue = Object.keys(dailyData).map(key => ({
      name: key,
      revenue: dailyData[key]
  })).sort((a, b) => {
      const [dA, mA, yA] = a.name.split('/');
      const [dB, mB, yB] = b.name.split('/');
      return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
  });

  console.log("Daily Revenue Data:", JSON.stringify(dailyRevenue, null, 2));
  process.exit();
};

test();
