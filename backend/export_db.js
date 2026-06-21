const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const exportDir = path.join(__dirname, 'database_export');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir);
}

// Minimal schemas to fetch data
const schemas = {
  Category: new mongoose.Schema({}, { strict: false, collection: 'categories' }),
  Product: new mongoose.Schema({}, { strict: false, collection: 'products' }),
  User: new mongoose.Schema({}, { strict: false, collection: 'users' }),
  Order: new mongoose.Schema({}, { strict: false, collection: 'orders' }),
};

async function exportDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    for (const [modelName, schema] of Object.entries(schemas)) {
      const Model = mongoose.models[modelName] || mongoose.model(modelName, schema);
      const data = await Model.find({});
      const filePath = path.join(exportDir, `${modelName.toLowerCase()}s.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Exported ${data.length} records from ${modelName} to ${filePath}`);
    }

    console.log('Database export completed successfully!');
  } catch (error) {
    console.error('Error exporting database:', error);
  } finally {
    mongoose.connection.close();
  }
}

exportDatabase();
