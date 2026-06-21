import React, { useState, useEffect } from 'react';
import { useCart } from '../context/AppContext';
import toast from 'react-hot-toast';

const Featured = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const { addToCart, user } = useCart();

  useEffect(() => {
    fetch('http://localhost:5000/api/products/featured')
      .then(res => res.json())
      .then(data => setFeaturedItems(data))
      .catch(err => console.error("Lỗi lấy sản phẩm nổi bật:", err));
  }, []);

  const handleAddToCart = (item, e) => {
    if (e) e.stopPropagation();
    addToCart(item);
    toast.success(`Đã thêm ${item.name} vào giỏ hàng!`);
  };

  if (featuredItems.length === 0) return null;

  return (
    <section style={{ padding: '60px 0', backgroundColor: 'var(--cream-light)' }}>
      <div className="container">
        <h2 className="section-title">Khách Hàng Yêu Thích Nhất</h2>
        <div className="menu-grid">
          {featuredItems.map((item) => (
            <div key={item._id} className="menu-item" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 10, left: 10, background: '#e74c3c', color: 'white', padding: '5px 10px', borderRadius: '5px', zIndex: 1, fontSize: '0.8rem', fontWeight: 'bold' }}>
                Bán chạy ({item.soldQuantity || 0} đã bán)
              </div>
              <img src={item.image} alt={item.name} className="menu-img" />
              <div className="menu-content">
                <h3 className="menu-title">{item.name}</h3>
                <p className="menu-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(String(item.price).replace(/\D/g, '')))}</p>
                {user && (
                  <button 
                    onClick={(e) => handleAddToCart(item, e)}
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '10px', padding: '8px' }}
                  >
                    Thêm vào giỏ
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Featured;
