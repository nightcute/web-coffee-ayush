const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // Mã giảm giá (VD: FREESHIP)
  discountPercent: { type: Number, required: true }, // Phần trăm giảm
  maxDiscount: { type: Number, required: true }, // Số tiền giảm tối đa
  minOrderValue: { type: Number, default: 0 }, // Đơn tối thiểu để áp dụng
  expirationDate: { type: Date, required: true }, // Ngày hết hạn
  isActive: { type: Boolean, default: true } // Trạng thái
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);
