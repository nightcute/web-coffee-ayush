const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB for migration');
    const db = mongoose.connection.collection('products');
    const products = await db.find({}).toArray();
    let updatedCount = 0;
    
    for (let p of products) {
        if (typeof p.price === 'string') {
            const numericPrice = parseInt(p.price.replace(/\D/g, '')) || 0;
            await db.updateOne(
                { _id: p._id },
                { $set: { price: numericPrice } }
            );
            updatedCount++;
        }
    }
    console.log(`Migration done. Updated ${updatedCount} products.`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to DB:', err);
    process.exit(1);
  });
