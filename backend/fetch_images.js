require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const getImages = async (query, count) => {
  try {
    const res = await fetch(`https://unsplash.com/napi/search/photos?query=${query}&per_page=${Math.max(10, count + 5)}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.results.map(r => r.urls.regular);
  } catch (err) {
    console.error(`Failed to fetch images for ${query}:`, err);
    return [];
  }
};

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dpmango_coffee')
  .then(async () => {
    console.log('Connected to MongoDB. Fetching distinct images...');
    
    const categories = await Category.find({});
    
    const queryMap = {
      'Cà phê': 'coffee drink',
      'Đồ uống': 'beverage',
      'Trà': 'tea cup',
      'Sinh tố': 'smoothie drink',
      'Bánh ngọt': 'cake dessert'
    };

    for (const cat of categories) {
      const products = await Product.find({ category: cat._id });
      if (products.length === 0) continue;
      
      const query = queryMap[cat.name] || 'drink';
      console.log(`Fetching images for ${cat.name} (query: ${query})...`);
      
      const images = await getImages(query, products.length);
      
      if (images.length === 0) {
        console.log(`No images found for ${cat.name}. Using default.`);
        continue;
      }

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const imageUrl = images[i % images.length]; // cycle if not enough
        product.image = imageUrl;
        await product.save();
        console.log(`Updated ${product.name} with new image.`);
      }
    }
    
    console.log('Finished updating product images.');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
    mongoose.connection.close();
  });
