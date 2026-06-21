require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dpmango_coffee')
  .then(async () => {
    console.log('Connected to MongoDB. Seeding 20 products...');
    
    // Đảm bảo có các danh mục cơ bản
    let catCoffee = await Category.findOne({ name: 'Cà phê' });
    if (!catCoffee) catCoffee = await Category.create({ name: 'Cà phê' });
    
    let catTea = await Category.findOne({ name: 'Trà' });
    if (!catTea) catTea = await Category.create({ name: 'Trà' });
    
    let catSmoothie = await Category.findOne({ name: 'Sinh tố' });
    if (!catSmoothie) catSmoothie = await Category.create({ name: 'Sinh tố' });
    
    let catCake = await Category.findOne({ name: 'Bánh ngọt' });
    if (!catCake) catCake = await Category.create({ name: 'Bánh ngọt' });

    const newProducts = [
      { name: 'Cà Phê Muối', price: '35000', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500', category: catCoffee._id, description: 'Sự kết hợp hoàn hảo giữa vị đắng cà phê và vị mằn mặn của kem muối.' },
      { name: 'Bạc Xỉu', price: '30000', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500', category: catCoffee._id, description: 'Ngọt ngào, thơm béo, thích hợp cho người thích nhiều sữa.' },
      { name: 'Latte Art', price: '45000', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500', category: catCoffee._id, description: 'Cà phê Ý nhẹ nhàng, nghệ thuật tạo hình bọt sữa đẹp mắt.' },
      { name: 'Cappuccino', price: '45000', image: 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=500', category: catCoffee._id, description: 'Lớp bọt sữa dày dặn, béo ngậy cùng hương vị cà phê Espresso đậm đà.' },
      { name: 'Americano', price: '35000', image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500', category: catCoffee._id, description: 'Espresso pha loãng, giữ nguyên hương vị thanh tao.' },
      
      { name: 'Trà Vải Nhiệt Đới', price: '45000', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500', category: catTea._id, description: 'Trà đen hảo hạng kết hợp vị ngọt thanh của vải thiều.' },
      { name: 'Trà Chanh Sả', price: '35000', image: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=500', category: catTea._id, description: 'Giúp thư giãn, giải nhiệt cực tốt vào những ngày nắng nóng.' },
      { name: 'Hồng Trà Sữa Trân Châu', price: '40000', image: 'https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=500', category: catTea._id, description: 'Trà sữa truyền thống kèm trân châu dai giòn sần sật.' },
      { name: 'Trà Oolong Mộc', price: '45000', image: 'https://images.unsplash.com/photo-1576092762791-dd9e2220bac1?w=500', category: catTea._id, description: 'Vị chát nhẹ, thơm nồng hậu ngọt rất đặc trưng.' },
      { name: 'Trà Dâu Tây Đá Xay', price: '50000', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', category: catTea._id, description: 'Mát lạnh, chua ngọt hài hòa.' },

      { name: 'Sinh Tố Xoài', price: '45000', image: 'https://images.unsplash.com/photo-1543363363-d15764bbab29?w=500', category: catSmoothie._id, description: 'Từ những quả xoài cát chín mọng, ngọt ngào.' },
      { name: 'Sinh Tố Dâu Đen', price: '50000', image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=500', category: catSmoothie._id, description: 'Giàu vitamin C, giúp da dẻ hồng hào.' },
      { name: 'Sinh Tố Bơ Đậu Phộng', price: '55000', image: 'https://images.unsplash.com/photo-1605333556107-1bc94541ff9d?w=500', category: catSmoothie._id, description: 'Bơ sáp béo ngậy kết hợp đậu phộng rang thơm lừng.' },
      { name: 'Sinh Tố Kiwi', price: '50000', image: 'https://images.unsplash.com/photo-1595981267035-7b04d84b4e1e?w=500', category: catSmoothie._id, description: 'Chua chua ngọt ngọt, cực kì bắt miệng.' },
      { name: 'Nước Ép Dưa Hấu', price: '40000', image: 'https://images.unsplash.com/photo-1587883012610-e3df17d41270?w=500', category: catSmoothie._id, description: 'Giải khát tức thì.' },

      { name: 'Bánh Tiramisu', price: '45000', image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500', category: catCake._id, description: 'Vị đắng của ca cao hòa quyện với kem phô mai mascarpone.' },
      { name: 'Bánh Mousse Chanh Dây', price: '40000', image: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=500', category: catCake._id, description: 'Cốt bánh mềm mịn, vị chua nhẹ không hề bị ngấy.' },
      { name: 'Bánh Sừng Bò (Croissant)', price: '30000', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500', category: catCake._id, description: 'Thơm lừng bơ Pháp, vỏ bánh giòn xốp.' },
      { name: 'Cookie Socola Chip', price: '20000', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500', category: catCake._id, description: 'Bánh quy giòn tan với nhiều hạt socola nguyên chất.' },
      { name: 'Red Velvet', price: '45000', image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=500', category: catCake._id, description: 'Bánh nhung đỏ mềm mại với lớp kem phô mai béo ngậy.' }
    ];

    await Product.insertMany(newProducts);
    console.log('Inserted 20 products successfully!');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
    mongoose.connection.close();
  });
