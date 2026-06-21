require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("Connected to DB");
    
    // Create categories
    const categoriesToCreate = ['Cà phê', 'Trà', 'Sinh tố'];
    const categoryDocs = {};
    
    for (let name of categoriesToCreate) {
        let cat = await Category.findOne({ name });
        if (!cat) {
            cat = await Category.create({ name });
        }
        categoryDocs[name] = cat._id;
    }
    console.log("Categories ready");

    // Update existing products or create them if none
    const products = await Product.find();
    if (products.length === 0 || typeof products[0].category === 'string') {
        console.log("Need to seed or fix products");
        await Product.deleteMany({});
        
        const defaultProducts = [
            { name: 'Cà phê đen', price: '25000', image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=1964&auto=format&fit=crop', category: categoryDocs['Cà phê'], description: 'Cà phê đen truyền thống đậm vị, giúp bạn tỉnh táo và tràn đầy năng lượng cho ngày mới.' },
            { name: 'Cà phê sữa', price: '30000', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=2037&auto=format&fit=crop', category: categoryDocs['Cà phê'], description: 'Sự kết hợp hoàn hảo giữa cà phê đậm đà và sữa đặc ngọt ngào.' },
            { name: 'Bạc xỉu', price: '35000', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=2003&auto=format&fit=crop', category: categoryDocs['Cà phê'], description: 'Nhiều sữa ít cà phê, một lựa chọn nhẹ nhàng.' },
            { name: 'Trà đào cam sả', price: '45000', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=1964&auto=format&fit=crop', category: categoryDocs['Trà'], description: 'Thức uống giải nhiệt với vị chua ngọt hài hòa.' },
            { name: 'Trà chanh', price: '30000', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1965&auto=format&fit=crop', category: categoryDocs['Trà'], description: 'Trà đen truyền thống kết hợp cùng chanh tươi.' },
            { name: 'Sinh tố bơ', price: '50000', image: 'https://images.unsplash.com/photo-1605333556107-1bc94541ff9d?q=80&w=2072&auto=format&fit=crop', category: categoryDocs['Sinh tố'], description: 'Sinh tố bơ tươi xay nhuyễn mịn màng.' }
        ];
        
        await Product.insertMany(defaultProducts);
        console.log("Products seeded successfully.");
    } else {
        // Assign categories to existing products based on name if they don't have a valid ObjectId
        for (let p of products) {
            let catName = 'Cà phê';
            if (p.name.toLowerCase().includes('trà')) catName = 'Trà';
            if (p.name.toLowerCase().includes('sinh tố')) catName = 'Sinh tố';
            
            p.category = categoryDocs[catName];
            await p.save();
        }
        console.log("Products updated with proper category IDs.");
    }
    
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
