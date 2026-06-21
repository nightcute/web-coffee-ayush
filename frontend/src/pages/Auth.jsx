import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/AppContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useCart();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        return setError('Mật khẩu và Nhập lại mật khẩu không khớp!');
      }
      if (formData.password.length > 16) {
        return setError('Mật khẩu không được dài quá 16 ký tự!');
      }
    }
    
    const url = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (isLogin) {
          login(data);
          navigate(data.role === 'admin' ? '/admin' : '/');
        } else {
          setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
          setIsLogin(true);
          setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ');
    }
  };

  return (
    <div className="form-section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="order-form" style={{ maxWidth: '400px' }}>
          <h2 className="section-title" style={{ fontSize: '2rem' }}>
            {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
          </h2>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success" style={{ background: '#d4edda', color: '#155724', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>{success}</div>}
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Họ Tên</label>
                <input type="text" className="form-control" required value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" required value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input type="password" className="form-control" required value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
            {!isLogin && (
              <div className="form-group">
                <label>Nhập lại mật khẩu</label>
                <input type="password" className="form-control" required value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
              </div>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              {isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '1rem', cursor: 'pointer', color: 'var(--coffee-medium)' }} 
             onClick={() => {
               setIsLogin(!isLogin);
               setError('');
               setSuccess('');
               setFormData({ name: '', email: '', password: '', confirmPassword: '' });
             }}>
            {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
