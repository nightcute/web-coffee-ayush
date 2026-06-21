import React, { useState } from 'react';

const DRINK_PRICES = {
  "Cà phê đen": 25000,
  "Cà phê sữa": 30000,
  "Bạc xỉu": 35000,
  "Latte": 45000,
  "Cappuccino": 45000,
  "Cold Brew": 50000,
  "Trà đào cam sả": 40000,
  "Trà chanh": 25000,
  "Sinh tố bơ": 45000,
  "Matcha latte": 45000
};

const OrderForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    time: '',
    drinks: [''],
    notes: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [showInvoice, setShowInvoice] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDrinkChange = (index, value) => {
    const newDrinks = [...formData.drinks];
    newDrinks[index] = value;
    setFormData({ ...formData, drinks: newDrinks });
  };

  const addDrinkField = () => {
    setFormData({ ...formData, drinks: [...formData.drinks, ''] });
  };

  const removeDrinkField = (index) => {
    const newDrinks = formData.drinks.filter((_, i) => i !== index);
    if (newDrinks.length === 0) newDrinks.push('');
    setFormData({ ...formData, drinks: newDrinks });
  };

  const handlePreviewSubmit = (e) => {
    e.preventDefault();
    const validDrinks = formData.drinks.filter(d => d.trim() !== '');
    if (validDrinks.length === 0) {
      setStatus({ type: 'error', message: 'Vui lòng chọn ít nhất một đồ uống.' });
      return;
    }
    setStatus({ type: '', message: '' });
    setShowInvoice(true);
  };

  const submitFinalOrder = async () => {
    setStatus({ type: '', message: '' });
    const validDrinks = formData.drinks.filter(d => d.trim() !== '');

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, drinks: validDrinks, orderType: 'reservation' }),
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Đơn đã gửi! Cảm ơn bạn đã đặt món.' });
        setFormData({ name: '', phone: '', time: '', drinks: [''], notes: '' });
        setShowInvoice(false);
      } else {
        setStatus({ type: 'error', message: 'Có lỗi xảy ra. Vui lòng thử lại.' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus({ type: 'error', message: 'Không thể kết nối đến máy chủ.' });
    }
  };

  const calculateTotal = () => {
    return formData.drinks.reduce((total, drink) => {
      return total + (DRINK_PRICES[drink] || 0);
    }, 0);
  };

  const validDrinksList = formData.drinks.filter(d => d.trim() !== '');

  return (
    <section id="order" className="form-section">
      <div className="container">
        <h2 className="section-title">Đặt Bàn / Đặt Món</h2>
        <div className="order-form">
          {status.message && (
            <div className={`alert alert-${status.type}`}>
              {status.message}
            </div>
          )}
          
          {showInvoice ? (
            <div className="invoice-preview" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px', background: '#fff', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <h3 style={{ borderBottom: '2px dashed #ccc', paddingBottom: '10px', marginBottom: '15px', color: 'var(--coffee-dark)' }}>Hóa Đơn Tạm Tính</h3>
                  <p style={{marginBottom: '5px'}}><strong>Khách hàng:</strong> {formData.name}</p>
                  <p style={{marginBottom: '5px'}}><strong>Số điện thoại:</strong> {formData.phone}</p>
                  <p style={{marginBottom: '5px'}}><strong>Giờ đến:</strong> {formData.time || 'Không có'}</p>
                  <p style={{marginBottom: '15px'}}><strong>Ghi chú:</strong> {formData.notes || 'Không có'}</p>
                  
                  <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Danh sách món:</h4>
                  <ul style={{ listStyle: 'none', padding: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    {validDrinksList.map((drink, i) => (
                      <li key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>{drink}</span>
                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(DRINK_PRICES[drink] || 0)}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginTop: '15px', color: 'var(--coffee-accent)' }}>
                    <span>Tổng cộng:</span>
                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}</span>
                  </div>
                </div>
                
                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px dashed #ddd', paddingLeft: '20px' }}>
                  <h4 style={{ color: 'var(--coffee-dark)', marginBottom: '15px' }}>Quét mã thanh toán</h4>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Chuyen_Khoan_AyushCoffee_${calculateTotal()}`} 
                    alt="QR Thanh toán" 
                    style={{ width: '200px', height: '200px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', objectFit: 'contain' }} 
                  />
                  <p style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666', textAlign: 'center', lineHeight: '1.5' }}>
                    Vui lòng thanh toán <br />
                    <strong style={{ fontSize: '1.1rem', color: 'var(--coffee-accent)' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}</strong><br />
                    để hoàn tất đặt bàn.
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <button type="button" className="btn" onClick={() => setShowInvoice(false)} style={{ flex: 1, background: '#e0e0e0', color: '#333' }}>Quay lại chỉnh sửa</button>
                <button type="button" className="btn btn-primary" onClick={submitFinalOrder} style={{ flex: 1 }}>Xác nhận đã thanh toán</button>
              </div>
            </div>
          ) : (
          <form onSubmit={handlePreviewSubmit}>
            <div className="form-group">
              <label htmlFor="name">Họ và Tên</label>
              <input type="text" id="name" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input type="tel" id="phone" name="phone" className="form-control" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="time">Giờ đến (Dự kiến)</label>
              <input type="time" id="time" name="time" className="form-control" value={formData.time} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Đồ uống (Chọn món)</label>
              {formData.drinks.map((drink, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <select className="form-control" value={drink} onChange={(e) => handleDrinkChange(index, e.target.value)} required>
                    <option value="">-- Chọn đồ uống --</option>
                    <option value="Cà phê đen">Cà phê đen</option>
                    <option value="Cà phê sữa">Cà phê sữa</option>
                    <option value="Bạc xỉu">Bạc xỉu</option>
                    <option value="Latte">Latte</option>
                    <option value="Cappuccino">Cappuccino</option>
                    <option value="Cold Brew">Cold Brew</option>
                    <option value="Trà đào cam sả">Trà đào cam sả</option>
                    <option value="Trà chanh">Trà chanh</option>
                    <option value="Sinh tố bơ">Sinh tố bơ</option>
                    <option value="Matcha latte">Matcha latte</option>
                  </select>
                  {formData.drinks.length > 1 && (
                    <button type="button" onClick={() => removeDrinkField(index)} className="btn btn-danger" style={{ padding: '0 15px' }}>Xóa</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addDrinkField} className="btn" style={{ background: '#e0e0e0', color: '#333', marginTop: '5px', width: '100%' }}>+ Thêm đồ uống</button>
            </div>
            <div className="form-group">
              <label htmlFor="notes">Ghi chú thêm</label>
              <textarea id="notes" name="notes" className="form-control" rows="3" value={formData.notes} onChange={handleChange} placeholder="Ví dụ: Ít đường, nhiều đá..."></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Gửi Đơn</button>
          </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrderForm;
