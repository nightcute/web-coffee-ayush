const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }, // Changed from String to Number as requested
  image: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, default: '' },
  soldQuantity: { type: Number, default: 0 } // Giúp thống kê sản phẩm nổi bật
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
