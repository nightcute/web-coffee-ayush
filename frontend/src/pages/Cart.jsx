import React, { useState } from 'react';
import { useCart } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, clearCart, updateQuantity, user } = useCart();
  const [formData, setFormData] = useState({ name: user?.name || '', phone: '', address: '', time: '', notes: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Promo states
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoStatus, setPromoStatus] = useState({ message: '', type: '' });
  
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => {
    const priceNum = parseInt(String(item.price).replace(/\D/g, '')) || 0;
    return sum + (priceNum * item.quantity);
  }, 0);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/promotions');
      const promos = await res.json();
      const validPromo = promos.find(p => p.code === promoCode.toUpperCase() && p.isActive);
      
      if (!validPromo) {
        setPromoStatus({ message: 'Mã không hợp lệ hoặc đã bị khóa', type: 'error' });
        setDiscountAmount(0);
        return;
      }
      
      if (new Date(validPromo.expirationDate) < new Date()) {
        setPromoStatus({ message: 'Mã đã hết hạn sử dụng', type: 'error' });
        setDiscountAmount(0);
        return;
      }

      if (total < validPromo.minOrderValue) {
        setPromoStatus({ message: `Đơn hàng tối thiểu ${validPromo.minOrderValue.toLocaleString()}đ`, type: 'error' });
        setDiscountAmount(0);
        return;
      }

      const calculatedDiscount = (total * validPromo.discountPercent) / 100;
      const finalDiscount = Math.min(calculatedDiscount, validPromo.maxDiscount);
      
      setDiscountAmount(finalDiscount);
      setPromoStatus({ message: `Áp dụng mã thành công! Giảm ${finalDiscount.toLocaleString()}đ`, type: 'success' });
    } catch (err) {
      setPromoStatus({ message: 'Lỗi kiểm tra mã', type: 'error' });
    }
  };

  const processOrder = async (paid = false, payMethod = 'COD') => {
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(user ? { 'Authorization': `Bearer ${user.token}` } : {})
        },
        body: JSON.stringify({ 
          ...formData, 
          cartItems: cart, 
          orderType: 'delivery', 
          totalAmount: total - discountAmount,
          paymentMethod: payMethod,
          isPaid: paid
        }),
      });

      if (response.ok) {
        setShowSuccessModal(true);
        clearCart();
      } else {
        setStatus({ type: 'error', message: 'Lỗi đặt hàng' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Lỗi máy chủ' });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (cart.length === 0) return setStatus({ type: 'error', message: 'Giỏ hàng trống!' });

    if (!user) {
      setStatus({ type: 'error', message: 'Vui lòng đăng nhập để đặt hàng!' });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    
    if (paymentMethod === 'COD') {
      processOrder(false, 'COD');
    }
  };

  return (
    <div className="container" style={{ padding: '5rem 20px', minHeight: '80vh' }}>
      <h2 className="section-title">Giỏ Hàng Của Bạn</h2>
      
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', backgroundColor: '#fff', padding: '3rem', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '4rem', color: '#ddd', marginBottom: '1rem' }}>🛒</div>
          <h3 style={{ marginBottom: '1rem', color: '#777' }}>Chưa có món nào trong giỏ hàng.</h3>
          <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '1rem', padding: '12px 30px', fontSize: '1.1rem' }}>
            Tiếp tục chọn món
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* Cột trái: Danh sách sản phẩm */}
          <div style={{ flex: '2', minWidth: '320px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #f0f0f0', paddingBottom: '1rem', color: 'var(--coffee-dark)' }}>
                Sản phẩm đã chọn ({cart.length})
              </h3>
              
              {cart.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 0', borderBottom: index < cart.length - 1 ? '1px solid #f0f0f0' : 'none', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <img src={item.image || 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=150'} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} />
                    <div>
                      <h4 style={{ marginBottom: '5px', fontSize: '1.2rem', color: 'var(--coffee-dark)' }}>{item.name}</h4>
                      <p style={{ color: 'var(--coffee-medium)', fontWeight: '600', fontSize: '1.1rem' }}>{item.price}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--cream-light)', borderRadius: '25px', border: '1px solid #ebebeb', overflow: 'hidden' }}>
                      <button onClick={() => updateQuantity(item.name, item.quantity - 1)} style={{ padding: '8px 15px', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--coffee-dark)' }}>-</button>
                      <span style={{ padding: '0 10px', fontWeight: 'bold', color: 'var(--coffee-dark)', minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.name, item.quantity + 1)} style={{ padding: '8px 15px', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--coffee-dark)' }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.name)} className="btn" style={{ backgroundColor: '#ffebeb', color: '#e53935', padding: '8px 15px', border: '1px solid #ffcdd2', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Cột phải: Form đặt hàng & Tổng tiền */}
          <div style={{ flex: '1', minWidth: '320px' }}>
            <div className="order-form" style={{ margin: 0, width: '100%', position: 'sticky', top: '100px' }}>
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #f0f0f0', paddingBottom: '1rem', color: 'var(--coffee-dark)' }}>Tóm tắt đơn hàng</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#555', fontSize: '1.05rem' }}>
                <span>Tạm tính:</span>
                <span>{total.toLocaleString('vi-VN')}đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: '#555', fontSize: '1.05rem' }}>
                <span>Phí giao hàng:</span>
                <span>Miễn phí</span>
              </div>
              
              {/* Thêm phần nhập mã giảm giá */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="Nhập mã giảm giá (vd: SALE20)" value={promoCode} onChange={e => setPromoCode(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc', textTransform: 'uppercase', outline: 'none' }} />
                  <button type="button" onClick={handleApplyPromo} className="btn btn-primary" style={{ padding: '0 20px', borderRadius: '6px' }}>Áp dụng</button>
                </div>
                {promoStatus.message && (
                  <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: promoStatus.type === 'error' ? '#e74c3c' : '#27ae60', fontWeight: '500' }}>{promoStatus.message}</p>
                )}
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#27ae60', fontSize: '1.05rem', fontWeight: 'bold' }}>
                  <span>Khuyến mãi:</span>
                  <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1.5rem 0', padding: '1.5rem 0', borderTop: '2px dashed #e0e0e0', borderBottom: '2px dashed #e0e0e0', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--coffee-dark)' }}>
                <span>Tổng cộng:</span>
                <span style={{ color: 'var(--coffee-medium)' }}>{(total - discountAmount).toLocaleString('vi-VN')}đ</span>
              </div>

              <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--coffee-dark)' }}>Thông tin giao hàng</h4>
              {status.message && <div className={`alert alert-${status.type}`}>{status.message}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input type="text" className="form-control" placeholder="Họ Tên người nhận" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={{ backgroundColor: 'var(--cream-light)' }} />
                </div>
                <div className="form-group">
                  <input type="tel" className="form-control" placeholder="Số điện thoại liên hệ" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={{ backgroundColor: 'var(--cream-light)' }} />
                </div>
                <div className="form-group">
                  <input type="text" className="form-control" placeholder="Địa chỉ giao hàng" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} style={{ backgroundColor: 'var(--cream-light)' }} />
                </div>
                <div className="form-group">
                  <textarea className="form-control" placeholder="Ghi chú thêm (Tùy chọn)" rows="3" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} style={{ backgroundColor: 'var(--cream-light)' }}></textarea>
                </div>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Phương thức thanh toán:</label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                      <input type="radio" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                      Tiền mặt khi nhận hàng
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                      <input type="radio" value="QR_MOMO" checked={paymentMethod === 'QR_MOMO'} onChange={() => setPaymentMethod('QR_MOMO')} />
                      Ví MoMo
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                      <input type="radio" value="QR_BANK" checked={paymentMethod === 'QR_BANK'} onChange={() => setPaymentMethod('QR_BANK')} />
                      Chuyển khoản Ngân hàng
                    </label>
                  </div>
                </div>
                {paymentMethod === 'COD' && (
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1.1rem', borderRadius: '8px', marginTop: '10px' }}>
                    Xác nhận đặt hàng
                  </button>
                )}
                {paymentMethod === 'QR_MOMO' && (
                  <div style={{ marginTop: '20px', textAlign: 'center', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <h4 style={{ color: '#d82d8b', marginBottom: '15px' }}>Thanh toán qua Ví MoMo</h4>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=0373877728`} alt="Momo QR" style={{ width: '200px', height: '200px', margin: '0 auto', display: 'block', border: '2px solid #d82d8b', borderRadius: '10px', padding: '10px' }} />
                    <p style={{ marginTop: '15px', fontSize: '1.1rem' }}>SĐT: <strong>0373877728</strong></p>
                    <p style={{ color: '#666', marginBottom: '20px' }}>Chủ tài khoản: Vương Đức Cường</p>
                    <button type="button" onClick={() => {
                        if (!formData.name || !formData.phone || !formData.address) {
                            return setStatus({ type: 'error', message: 'Vui lòng nhập đủ thông tin giao hàng ở trên!' });
                        }
                        processOrder(true, 'MOMO');
                    }} className="btn" style={{ width: '100%', padding: '15px', fontSize: '1.1rem', borderRadius: '8px', background: '#d82d8b', color: '#fff', fontWeight: 'bold' }}>
                      Tôi đã chuyển MoMo xong
                    </button>
                  </div>
                )}

                {paymentMethod === 'QR_BANK' && (
                  <div style={{ marginTop: '20px', textAlign: 'center', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <h4 style={{ color: '#2980b9', marginBottom: '15px' }}>Chuyển khoản Ngân Hàng</h4>
                    <img src={`https://img.vietqr.io/image/vietinbank-106876278045-compact2.png?amount=${total - discountAmount}&addInfo=Thanh toan don hang&accountName=VUONG DUC CUONG`} alt="Bank QR" style={{ width: '250px', height: 'auto', margin: '0 auto', display: 'block', border: '2px solid #2980b9', borderRadius: '10px', padding: '10px' }} />
                    <p style={{ marginTop: '15px', fontSize: '1.1rem' }}>Ngân hàng: <strong>Vietinbank</strong></p>
                    <p style={{ fontSize: '1.1rem' }}>STK: <strong>106876278045</strong></p>
                    <p style={{ color: '#666', marginBottom: '20px' }}>Chủ tài khoản: VUONG DUC CUONG</p>
                    <button type="button" onClick={() => {
                        if (!formData.name || !formData.phone || !formData.address) {
                            return setStatus({ type: 'error', message: 'Vui lòng nhập đủ thông tin giao hàng ở trên!' });
                        }
                        processOrder(true, 'BANK_TRANSFER');
                    }} className="btn" style={{ width: '100%', padding: '15px', fontSize: '1.1rem', borderRadius: '8px', background: '#2980b9', color: '#fff', fontWeight: 'bold' }}>
                      Tôi đã chuyển khoản xong
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
          
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#fff', padding: '40px', borderRadius: '15px', textAlign: 'center', maxWidth: '400px', width: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '4rem', color: '#4caf50', marginBottom: '15px' }}>✅</div>
            <h2 style={{ color: 'var(--coffee-dark)', marginBottom: '10px' }}>Đặt hàng thành công!</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Cảm ơn bạn đã đặt hàng. Đơn hàng sẽ sớm được giao đến bạn.</p>
            <button onClick={() => {
              setShowSuccessModal(false);
              navigate('/menu');
            }} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1.1rem', borderRadius: '8px' }}>
              Tiếp tục chọn món
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

