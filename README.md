# Ayush Coffee - Landing Page & Order System

Dự án website dành cho quán "Ayush Coffee" mang âm hưởng không gian phố cổ Hà Nội.

## Công nghệ sử dụng
- **Frontend**: React.js (Vite), CSS thuần.
- **Backend**: Node.js, Express.js.
- **Lưu trữ**: JSON file (cho giai đoạn demo).

## Cấu trúc thư mục
- `frontend/`: Chứa mã nguồn React ứng dụng web.
- `backend/`: Chứa mã nguồn Node.js API server.

## Hướng dẫn cài đặt và chạy ứng dụng

Vui lòng mở 2 cửa sổ terminal (cmd hoặc PowerShell) để chạy đồng thời Backend và Frontend.

### 1. Chạy Backend (API Server)
Mở terminal và trỏ vào thư mục `backend`:
```bash
cd backend
npm install
npm start
```
*Server Backend sẽ chạy ở địa chỉ `http://localhost:5000`*

### 2. Chạy Frontend (Web Interface)
Mở một terminal khác và trỏ vào thư mục `frontend`:
```bash
cd frontend
npm install
npm run dev
```
*Giao diện Frontend sẽ chạy ở địa chỉ `http://localhost:5173` (hoặc cổng khác được Vite báo trong terminal).*

Sau đó, hãy mở trình duyệt và truy cập vào địa chỉ hiển thị trong terminal của Frontend để xem trang web và sử dụng chức năng đặt hàng. Dữ liệu đặt hàng sẽ được gửi và lưu tại `backend/data/orders.json`.
