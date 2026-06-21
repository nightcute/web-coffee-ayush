import React, { useState, useEffect } from 'react';
import { useCart } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
  const { user } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // For Invoice Modal

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders/myorders', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang chuẩn bị';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'var(--accent-color)'; // orange
      case 'processing': return '#3498db'; // blue
      case 'completed': return 'var(--coffee-dark)'; // green/dark brown
      case 'cancelled': return '#e74c3c'; // red
      default: return '#333';
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>Đang tải lịch sử đơn hàng...</div>;
  }

  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '80vh' }}>
      <h2 style={{ color: 'var(--coffee-dark)', marginBottom: '30px', textAlign: 'center' }}>Lịch sử Đơn hàng</h2>
      
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '20px' }}>Bạn chưa có đơn hàng nào.</p>
          <button className="btn" onClick={() => navigate('/')}>Khám phá Menu</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {orders.map(order => (
            <div key={order._id} style={{
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div>
                <p><strong>Mã đơn:</strong> #{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                <p><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                <p><strong>Loại đơn:</strong> {order.orderType === 'dine-in' ? 'Tại quán' : 'Giao hàng'}</p>
                <p><strong>Tổng tiền:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</p>
                <p style={{ marginTop: '10px' }}>
                  <span style={{ 
                    padding: '5px 10px', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    color: '#fff',
                    backgroundColor: getStatusColor(order.status)
                  }}>
                    {getStatusText(order.status)}
                  </span>
                </p>
              </div>
              <div>
                <button 
                  className="btn" 
                  style={{ background: 'var(--coffee-light)', color: 'var(--coffee-dark)' }}
                  onClick={() => setSelectedOrder(order)}
                >
                  Xem Hóa Đơn
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px',
            position: 'relative'
          }}>
            <button 
              onClick={() => setSelectedOrder(null)}
              style={{
                position: 'absolute',
                top: '15px', right: '15px',
                background: 'none', border: 'none',
                fontSize: '1.5rem', cursor: 'pointer',
                color: '#666'
              }}
            >&times;</button>
            
            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px dashed #ccc', paddingBottom: '20px' }}>
              <h2 style={{ color: 'var(--coffee-dark)', margin: 0 }}>AYUSH COFFEE</h2>
              <p style={{ margin: '5px 0 0', color: '#666' }}>Hóa Đơn Mua Hàng</p>
            </div>

            <div style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
              <p><strong>Mã HĐ:</strong> #{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}</p>
              <p><strong>Thời gian:</strong> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
              <p><strong>Loại đơn:</strong> {selectedOrder.orderType === 'dine-in' ? 'Uống tại quán' : 'Giao hàng tận nơi'}</p>
              {selectedOrder.customerInfo.name && <p><strong>Khách hàng:</strong> {selectedOrder.customerInfo.name}</p>}
              {selectedOrder.customerInfo.phone && <p><strong>Điện thoại:</strong> {selectedOrder.customerInfo.phone}</p>}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                  <th style={{ padding: '8px 0' }}>Tên món</th>
                  <th style={{ padding: '8px 0', textAlign: 'center' }}>SL</th>
                  <th style={{ padding: '8px 0', textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, idx) => {
                  const itemPrice = parseInt(item.price.replace(/\D/g, '')) || 0;
                  const itemTotal = itemPrice * item.quantity;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '8px 0' }}>{item.name}</td>
                      <td style={{ padding: '8px 0', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right' }}>
                         {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(itemTotal)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div style={{ borderTop: '2px dashed #ccc', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <span>TỔNG CỘNG:</span>
              <span style={{ color: 'var(--coffee-dark)' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalAmount)}
              </span>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px', color: '#666', fontSize: '0.9rem' }}>
              <p>Cảm ơn quý khách và hẹn gặp lại!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
