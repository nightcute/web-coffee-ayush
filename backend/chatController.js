const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('./models/Product');
const Order = require('./models/Order');

// Initialize Gemini (sẽ báo lỗi hợp lệ nếu chưa có key, nhưng xử lý bắt lỗi ở route)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'DUMMY_KEY');

router.post('/', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'DUMMY_KEY' || process.env.GEMINI_API_KEY.trim() === '') {
            return res.json({ 
                text: "Xin lỗi, hệ thống chưa được cấu hình API Key. Vui lòng liên hệ Admin để cập nhật GEMINI_API_KEY trong file .env." 
            });
        }

        // ==========================================
        // PHƯƠNG PHÁP 1 + 2: RAG (Retrieval) + Context Injection
        // ==========================================
        
        // 1. Kéo dữ liệu thực tế từ Database (Retrieval)
        const products = await Product.find({}).sort({ soldQuantity: -1 }).select('name price description soldQuantity');
        
        let menuContext = "THÔNG TIN MENU HIỆN TẠI TỪ CƠ SỞ DỮ LIỆU:\n";
        if (products.length > 0) {
            products.forEach(p => {
                menuContext += `- Món: ${p.name} | Giá: ${p.price}đ | Đã bán: ${p.soldQuantity || 0} | Mô tả: ${p.description || 'Không có'}\n`;
            });
        } else {
            menuContext += "Hiện tại quán chưa có món nào trên hệ thống.\n";
        }

        const QA_DATASET = `
Dưới đây là kiến thức chuẩn của quán Ayush Coffee để bạn trả lời khách hàng:
- Quán chủ yếu bán đồ uống (Cà phê, Trà, Sinh tố).
- Bánh ngọt: Hiện tại quán KHÔNG BÁN bánh ngọt, chỉ tập trung phục vụ đồ uống.
- Cách đặt hàng: Chọn món vào Giỏ hàng -> Điền thông tin giao hàng -> Xác nhận Đặt hàng. Có giao hàng tận nơi (Freeship) và đến lấy trực tiếp. Giao hàng nhanh 15-30 phút.
- Hình thức thanh toán: Hỗ trợ thanh toán Tiền mặt (COD) khi nhận hàng, Ví MoMo, và Chuyển khoản Ngân hàng (quét mã QR tự động).
- Cách dùng mã khuyến mãi: Khách hàng có thể nhập mã giảm giá trực tiếp ở bước Thanh toán trong Giỏ hàng.
- Xem lịch sử đơn hàng: Khách hàng đăng nhập, sau đó vào mục "Tài khoản" -> "Lịch sử đơn hàng" để xem chi tiết trạng thái đơn.
- Hủy đơn hàng / Hỗ trợ: Nếu muốn hủy đơn hoặc tài khoản bị khóa, khách hàng vui lòng gọi Hotline 0123456789 hoặc liên hệ qua Fanpage của quán.

${menuContext}
`;

        // 2. Nhồi dữ liệu vào System Instruction (Context Injection)
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            systemInstruction: "Bạn là nhân viên tư vấn của quán Ayush Coffee mang phong cách phố cổ Hà Nội. Hãy trả lời lịch sự, ngắn gọn, tự nhiên. Dựa vào thông tin Menu phía dưới để tư vấn giá, món bán chạy (soldQuantity cao nhất), v.v. Nếu khách hỏi món không có trong Menu, hãy báo không có.\n" + QA_DATASET
        });

        const chatHistory = history ? history.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        })) : [];

        // Xóa tin nhắn rác của model ở đầu
        while (chatHistory.length > 0 && chatHistory[0].role === 'model') {
            chatHistory.shift();
        }

        // Gộp tin nhắn trùng role
        const normalizedHistory = [];
        for (const msg of chatHistory) {
            if (normalizedHistory.length > 0 && normalizedHistory[normalizedHistory.length - 1].role === msg.role) {
                normalizedHistory[normalizedHistory.length - 1].parts[0].text += '\n' + msg.parts[0].text;
            } else {
                normalizedHistory.push({ role: msg.role, parts: [{ text: msg.parts[0].text }] });
            }
        }

        const chat = model.startChat({ history: normalizedHistory });
        let result = await chat.sendMessage(message);
        
        let final_text = "";
        try {
            final_text = result.response.text();
            if (!final_text || final_text.trim() === '') {
                final_text = "Dạ, hiện tại hệ thống đang tổng hợp dữ liệu, bạn vui lòng hỏi lại giúp mình nhé.";
            }
        } catch (e) {
            console.error('Failed to get text from response:', e);
            final_text = "Xin lỗi, tôi đã tìm được dữ liệu nhưng không thể tạo câu trả lời lúc này.";
        }
        
        res.json({ text: final_text });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi kết nối với AI.' });
    }
});

module.exports = router;
