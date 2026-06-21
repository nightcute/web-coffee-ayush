const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true, unique: true }, // admin, staff, user
  permissions: [{ type: String }] // Mảng quyền hạn (VD: ['manage_products', 'view_orders'])
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
