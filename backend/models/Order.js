const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Không bắt buộc để khách vãng lai có thể đặt bàn/đặt món
  },
  customerInfo: {
    name: { type: String, required: false }, // Cho phép null/empty nếu khách tại quán không cần nhập tên
    phone: { type: String, required: false },
    address: { type: String, required: false },
    time: { type: String },
    notes: { type: String }
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Liên kết tới Product để thống kê
    name: { type: String, required: true },
    price: { type: String }, 
    quantity: { type: Number, default: 1 }
  }],
  totalAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending' },
  orderType: { type: String, enum: ['dine-in', 'delivery', 'reservation'], default: 'delivery' }, // Loại đơn hàng
  paymentMethod: { type: String, default: 'COD' },
  isPaid: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
