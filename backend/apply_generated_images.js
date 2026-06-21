require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');
const Category = require('./models/Category');

const imagesDir = path.join(__dirname, '../frontend/public/images');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dpmango_coffee')
  .then(async () => {
    console.log('Connected to MongoDB. Applying generated images...');

    const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png') && !f.startsWith('media'));
    
    // Group images by prefix
    const imageMap = {
      coffee: files.filter(f => f.startsWith('coffee')).map(f => `/images/${f}`),
      tea: files.filter(f => f.startsWith('tea')).map(f => `/images/${f}`),
      smoothie: files.filter(f => f.startsWith('smoothie')).map(f => `/images/${f}`),
      cake: files.filter(f => f.startsWith('cake')).map(f => `/images/${f}`)
    };

    console.log('Available images:', imageMap);

    const categories = await Category.find({});
    
    const catToPrefix = {
      'Cà phê': 'coffee',
      'Đồ uống': 'coffee',
      'Trà': 'tea',
      'Sinh tố': 'smoothie',
      'Bánh ngọt': 'cake'
    };

    for (const cat of categories) {
      const prefix = catToPrefix[cat.name];
      const images = imageMap[prefix] || imageMap['coffee']; // fallback
      
      if (!images || images.length === 0) continue;

      const products = await Product.find({ category: cat._id });
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        product.image = images[i % images.length];
        await product.save();
        console.log(`Updated ${product.name} with ${product.image}`);
      }
    }

    console.log('Finished applying generated images.');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
    mongoose.connection.close();
  });
