require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const categories = await Category.find();
    console.log("Categories:", categories);
    
    const products = await Product.find();
    console.log("Products count:", products.length);
    if(products.length > 0) {
        console.log("Sample product category:", products[0].category);
    }
    process.exit(0);
});
