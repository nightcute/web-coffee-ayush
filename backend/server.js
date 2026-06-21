require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Category = require('./models/Category');
const Role = require('./models/Role');
const DailyStatistic = require('./models/DailyStatistic');
const Promotion = require('./models/Promotion');
const Review = require('./models/Review');
const chatController = require('./chatController');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination(req, file, cb) { cb(null, 'uploads/'); },
  filename(req, file, cb) { cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`); }
});
const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.error('MongoDB Connection Error:', err));

// ==========================================
// Middleware
// ==========================================
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
    }
    if (!token) {
        // Optional auth mode for some routes
        if(req.optionalAuth) return next();
        res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }
};

const optionalProtect = (req, res, next) => {
    req.optionalAuth = true;
    protect(req, res, next);
}

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Không có quyền truy cập Admin' });
    }
};

const staffOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
        next();
    } else {
        res.status(401).json({ message: 'Chỉ nhân viên hoặc Quản lý mới được truy cập' });
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ==========================================
// Authentication Routes
// ==========================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (password.length > 16) {
            return res.status(400).json({ message: 'Mật khẩu không được dài quá 16 ký tự!' });
        }

        const userExists = await User.findOne({
            $or: [{ email }, { name }]
        });
        
        if (userExists) {
            if (userExists.email === email) {
                return res.status(400).json({ message: 'Email đã tồn tại!' });
            }
            if (userExists.name === name) {
                return res.status(400).json({ message: 'Tên tài khoản đã tồn tại!' });
            }
        }

        const user = await User.create({ name, email, password });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi đăng ký.', error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.isActive === false) {
                return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa! Vui lòng liên hệ quản trị viên.' });
            }
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Email hoặc mật khẩu không đúng!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
    }
});

// ==========================================
// Admin User Routes
// ==========================================
app.get('/api/admin/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách người dùng' });
    }
});

app.put('/api/admin/users/:id/status', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        
        // Không cho phép tự khóa tài khoản Admin chính đang đăng nhập
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Không thể tự khóa tài khoản của chính mình!' });
        }

        user.isActive = !user.isActive; // Toggle status
        await user.save();
        
        res.json({ message: 'Cập nhật trạng thái thành công', isActive: user.isActive });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật trạng thái' });
    }
});

// ==========================================
// Category Routes
// ==========================================
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh mục.' });
    }
});

app.post('/api/categories', protect, admin, async (req, res) => {
    try {
        const { name, description } = req.body;
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) return res.status(400).json({ message: 'Danh mục đã tồn tại' });
        
        const category = await Category.create({ name, description });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo danh mục' });
    }
});

app.put('/api/categories/:id', protect, admin, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật danh mục' });
    }
});

app.delete('/api/categories/:id', protect, admin, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa danh mục' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa danh mục' });
    }
});

// Create Category
app.post('/api/categories', protect, async (req, res) => {
    try {
        const newCategory = new Category({ name: req.body.name });
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo danh mục' });
    }
});

// Upload image endpoint
app.post('/api/upload', protect, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Không tìm thấy file tải lên' });
    res.json({ url: `http://localhost:5000/uploads/${req.file.filename}` });
});

// ==========================================
// Product Routes
// ==========================================
app.get('/api/products/featured', async (req, res) => {
    try {
        const products = await Product.find({}).sort({ soldQuantity: -1 }).limit(4).populate('category');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy sản phẩm nổi bật.' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        let products = await Product.find({}).populate('category');
        
        // Seed initial data if empty
        if (products.length === 0) {
            const catDrink = await Category.create({ name: 'Đồ uống' });
            const catTea = await Category.create({ name: 'Trà' });
            const catSmoothie = await Category.create({ name: 'Sinh tố' });

            const defaultProducts = [
                { name: 'Cà phê đen', price: '25000', image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=1964&auto=format&fit=crop', category: catDrink._id, description: 'Cà phê đen truyền thống' },
                { name: 'Cà phê sữa', price: '30000', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=2037&auto=format&fit=crop', category: catDrink._id, description: 'Cà phê sữa béo ngậy' },
                { name: 'Trà đào cam sả', price: '45000', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=1964&auto=format&fit=crop', category: catTea._id, description: 'Giải nhiệt tươi mát' },
                { name: 'Sinh tố bơ', price: '50000', image: 'https://images.unsplash.com/photo-1605333556107-1bc94541ff9d?q=80&w=2072&auto=format&fit=crop', category: catSmoothie._id, description: 'Sinh tố bơ tươi nhuyễn mịn' }
            ];
            await Product.insertMany(defaultProducts);
            products = await Product.find({}).populate('category');
        }
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm.', error: error.message });
    }
});

app.post('/api/products', protect, admin, async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo sản phẩm' });
    }
});

app.put('/api/products/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật sản phẩm' });
    }
});

app.delete('/api/products/:id', protect, admin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa sản phẩm' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa sản phẩm' });
    }
});

// ==========================================
// Order Routes
// ==========================================
// Create Order (Logged in User or Guest)
app.post('/api/orders', optionalProtect, async (req, res) => {
    try {
        const { name, phone, address, time, drink, notes, cartItems, orderType, totalAmount, paymentMethod, isPaid } = req.body;
        
        let calculatedTotal = totalAmount || 0;
        let items = cartItems || [];
        
        // Fallback for reservation with drinks array
        let drinksArray = req.body.drinks || [];
        if (!Array.isArray(drinksArray) && req.body.drink) drinksArray = [req.body.drink];
        drinksArray = drinksArray.filter(d => d && d.trim() !== '');

        if (!cartItems && drinksArray.length > 0) {
            const counts = {};
            drinksArray.forEach(d => counts[d] = (counts[d] || 0) + 1);

            for (let d in counts) {
                const product = await Product.findOne({ name: d });
                if (product) {
                    const parsedPrice = parseInt(String(product.price).replace(/\D/g, '')) || 0;
                    items.push({ product: product._id, name: d, price: product.price, quantity: counts[d] });
                    calculatedTotal += parsedPrice * counts[d];
                } else {
                    items.push({ name: d, quantity: counts[d] });
                }
            }
        }

        const newOrder = new Order({
            user: req.user ? req.user._id : undefined,
            customerInfo: { name, phone, address, time, notes },
            items: items.map(item => ({
                product: item.product || item._id, // Support different formats
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            totalAmount: calculatedTotal,
            orderType: orderType || 'delivery',
            paymentMethod: paymentMethod || 'COD',
            isPaid: isPaid || false,
            status: orderType === 'dine-in' ? 'completed' : 'pending' // Auto complete dine-in (optional logic)
        });

        const createdOrder = await newOrder.save();

        // Update sold quantity for products if completed immediately
        if (createdOrder.status === 'completed') {
             for (let item of createdOrder.items) {
                 if (item.product) {
                     await Product.findByIdAndUpdate(item.product, { $inc: { soldQuantity: item.quantity } });
                 }
             }
        }

        res.status(201).json({ message: 'Đơn đã gửi thành công!', order: createdOrder });
    } catch (error) {
        console.error("Order error:", error);
        res.status(500).json({ message: 'Lỗi server khi tạo đơn hàng.' });
    }
});

// Get user orders
app.get('/api/orders/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy đơn hàng' });
    }
});

// Admin & Staff: Get all orders
app.get('/api/admin/orders', protect, staffOrAdmin, async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 }).populate('user', 'name email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy danh sách đơn hàng' });
    }
});

// Admin & Staff: Update order status
app.put('/api/admin/orders/:id/status', protect, staffOrAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

        const previousStatus = order.status;
        order.status = req.body.status;
        await order.save();

        // If status changed to completed, update product sold quantities
        if (previousStatus !== 'completed' && order.status === 'completed') {
            for (let item of order.items) {
                 if (item.product) {
                     await Product.findByIdAndUpdate(item.product, { $inc: { soldQuantity: item.quantity } });
                 }
             }
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật trạng thái đơn hàng' });
    }
});

// ==========================================
// Analytics Routes
// ==========================================
// Admin: View Revenue Analytics
app.get('/api/admin/revenue', protect, admin, async (req, res) => {
    try {
        const completedOrders = await Order.find({ status: 'completed' });
        
        let totalRevenue = 0;
        let dineInRevenue = 0;
        let deliveryRevenue = 0;
        
        const monthlyData = {};
        const weeklyData = {};
        const dailyData = {};

        // Helper function for ISO week
        const getWeek = (d) => {
            const date = new Date(d.getTime());
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
            const week1 = new Date(date.getFullYear(), 0, 4);
            return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
        };

        completedOrders.forEach(order => {
            totalRevenue += order.totalAmount;
            if (order.orderType === 'dine-in') dineInRevenue += order.totalAmount;
            if (order.orderType === 'delivery') deliveryRevenue += order.totalAmount;
            
            const date = new Date(order.createdAt);
            
            // Monthly
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
            monthlyData[monthYear] = (monthlyData[monthYear] || 0) + order.totalAmount;

            // Weekly
            const weekYear = `Tuần ${getWeek(date)}/${date.getFullYear()}`;
            weeklyData[weekYear] = (weeklyData[weekYear] || 0) + order.totalAmount;

            // Daily
            const dayMonthYear = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            dailyData[dayMonthYear] = (dailyData[dayMonthYear] || 0) + order.totalAmount;
        });
        
        const monthlyRevenue = Object.keys(monthlyData).map(key => ({
            name: key,
            revenue: monthlyData[key]
        })).sort((a, b) => {
            const [mA, yA] = a.name.split('/');
            const [mB, yB] = b.name.split('/');
            return new Date(yA, mA - 1) - new Date(yB, mB - 1);
        });

        const weeklyRevenue = Object.keys(weeklyData).map(key => ({
            name: key,
            revenue: weeklyData[key]
        })).sort((a, b) => {
            // "Tuần X/YYYY" -> parse YYYY and X
            const parseW = str => {
                const parts = str.replace('Tuần ', '').split('/');
                return { w: parseInt(parts[0]), y: parseInt(parts[1]) };
            };
            const pA = parseW(a.name);
            const pB = parseW(b.name);
            if (pA.y !== pB.y) return pA.y - pB.y;
            return pA.w - pB.w;
        });

        const dailyRevenue = Object.keys(dailyData).map(key => ({
            name: key,
            revenue: dailyData[key]
        })).sort((a, b) => {
            const [dA, mA, yA] = a.name.split('/');
            const [dB, mB, yB] = b.name.split('/');
            return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
        });

        res.json({
            totalOrders: completedOrders.length,
            totalRevenue,
            dineInRevenue,
            deliveryRevenue,
            monthlyRevenue,
            weeklyRevenue,
            dailyRevenue
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tính toán doanh thu' });
    }
});


// ==========================================
// Promotion Routes
// ==========================================
app.get('/api/promotions', async (req, res) => {
    try {
        const promotions = await Promotion.find({ isActive: true });
        res.json(promotions);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy khuyến mãi' });
    }
});

app.post('/api/promotions', protect, admin, async (req, res) => {
    try {
        const promotion = await Promotion.create(req.body);
        res.status(201).json(promotion);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo khuyến mãi' });
    }
});

app.delete('/api/promotions/:id', protect, admin, async (req, res) => {
    try {
        await Promotion.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa khuyến mãi' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa khuyến mãi' });
    }
});

// ==========================================
// Review Routes
// ==========================================
app.get('/api/products/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.id }).populate('user', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy đánh giá' });
    }
});

app.post('/api/products/:id/reviews', protect, async (req, res) => {
    try {
        const review = await Review.create({
            user: req.user._id,
            product: req.params.id,
            rating: req.body.rating,
            comment: req.body.comment
        });
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi gửi đánh giá' });
    }
});

// ==========================================
// Chatbot Route
// ==========================================
app.use('/api/chat', chatController);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
