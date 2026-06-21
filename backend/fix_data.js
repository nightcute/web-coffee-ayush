require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dpmango_coffee')
  .then(async () => {
    console.log('Connected to MongoDB. Fixing data...');
    
    // 1. Fix product images based on category
    const categories = await Category.find({});
    
    const imageMap = {
      'Cà phê': 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500',
      'Đồ uống': 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500',
      'Trà': 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=500',
      'Sinh tố': 'https://images.unsplash.com/photo-1605333556107-1bc94541ff9d?w=500',
      'Bánh ngọt': 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500'
    };

    for (const cat of categories) {
      const fallbackImage = imageMap[cat.name] || 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500';
      // Thay thế tất cả sản phẩm của danh mục này bằng ảnh mẫu đáng tin cậy
      await Product.updateMany(
        { category: cat._id },
        { $set: { image: fallbackImage } }
      );
    }
    console.log('Fixed product images.');

    // 2. Generate fake orders for months 1, 2, 3, 4 of 2026
    const products = await Product.find({});
    if (products.length > 0) {
      const fakeOrders = [];
      const months = [0, 1, 2, 3]; // Jan, Feb, Mar, Apr (0-indexed)
      
      for (const month of months) {
        // Tạo 3-5 đơn hàng cho mỗi tháng
        const numOrders = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < numOrders; i++) {
          const randomProduct = products[Math.floor(Math.random() * products.length)];
          const qty = Math.floor(Math.random() * 3) + 1;
          const priceStr = randomProduct.price.toString();
          const itemPrice = parseInt(priceStr.replace(/\\D/g, '')) || 30000;
          
          const orderDate = new Date(2026, month, Math.floor(Math.random() * 28) + 1, 14, 30);
          
          fakeOrders.push({
            customerInfo: { name: `Khách Hàng ${month+1}-${i+1}`, phone: '0901234567', time: '', notes: '' },
            items: [{
              product: randomProduct._id,
              name: randomProduct.name,
              price: randomProduct.price,
              quantity: qty
            }],
            totalAmount: itemPrice * qty,
            orderType: Math.random() > 0.5 ? 'dine-in' : 'delivery',
            status: 'completed',
            createdAt: orderDate,
            updatedAt: orderDate
          });
        }
      }
      
      await Order.insertMany(fakeOrders);
      console.log(`Inserted ${fakeOrders.length} fake orders for Jan-Apr 2026.`);
    }

    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
    mongoose.connection.close();
  });
