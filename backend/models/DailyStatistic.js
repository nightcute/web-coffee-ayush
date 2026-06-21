const mongoose = require('mongoose');

const dailyStatisticSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
  totalRevenue: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  dineInRevenue: { type: Number, default: 0 },
  deliveryRevenue: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('DailyStatistic', dailyStatisticSchema);
