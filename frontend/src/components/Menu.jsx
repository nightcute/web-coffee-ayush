import React, { useState, useEffect } from 'react';
import { useCart } from '../context/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Review States
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  
  // Local Search State
  const [localSearch, setLocalSearch] = useState('');

  const { addToCart, user } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch initial data
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/categories').then(res => res.json()),
      fetch('http://localhost:5000/api/products').then(res => res.json())
    ])
    .then(([categoriesData, productsData]) => {
      setCategories(categoriesData);
      setMenuItems(productsData);
    })
    .catch(err => console.error("Lỗi lấy dữ liệu menu:", err));
  }, []);

  // Sync search query from Navbar to localSearch
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('search');
    if (query !== null) {
      setLocalSearch(query);
    }
  }, [location.search]);

  const handleAddToCart = (item, e) => {
    if (e) e.stopPropagation();
    addToCart(item);
    toast.success(`Đã thêm ${item.name} vào giỏ hàng!`);
  };

  useEffect(() => {
    if (selectedProduct) {
      fetch(`http://localhost:5000/api/products/${selectedProduct._id}/reviews`)
        .then(res => res.json())
        .then(data => setReviews(data))
        .catch(err => console.error("Lỗi lấy đánh giá:", err));
    } else {
      setReviews([]);
    }
  }, [selectedProduct]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Vui lòng đăng nhập!');
    try {
      const res = await fetch(`http://localhost:5000/api/products/${selectedProduct._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(reviewForm)
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews([...reviews, { ...newReview, user: { name: user.name } }]);
        setReviewForm({ rating: 5, comment: '' });
        toast.success('Gửi đánh giá thành công!');
      } else {
        toast.error('Lỗi gửi đánh giá');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLocalSearchChange = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    
    // Xóa query param 'search' trên URL để Navbar search tự động xóa trắng
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has('search')) {
      navigate('/menu', { replace: true });
    }
  };

  // Lọc sản phẩm theo danh mục VÀ theo từ khóa local (live search)
  const filteredItems = menuItems.filter(item => {
    const matchCategory = activeCategory === 'all' || (item.category && item.category._id === activeCategory);
    const matchSearch = localSearch.trim() === '' || 
                        item.name.toLowerCase().includes(localSearch.toLowerCase()) || 
                        (item.description && item.description.toLowerCase().includes(localSearch.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <section id="menu" className="menu-section">
      <div className="container">
        <h2 className="section-title">Menu Của Quán</h2>
        
        {/* Category Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => {
              setActiveCategory('all');
              setLocalSearch('');
              const params = new URLSearchParams(location.search);
              if (params.has('search')) {
                navigate('/menu', { replace: true });
              }
            }}
            className="btn"
            style={{ 
              background: activeCategory === 'all' ? 'var(--coffee-dark)' : 'transparent',
              color: activeCategory === 'all' ? '#fff' : 'var(--coffee-dark)',
              border: '1px solid var(--coffee-dark)',
              borderRadius: '20px', padding: '8px 20px', transition: 'all 0.3s'
            }}
          >
            Tất cả
          </button>
          {categories.map(cat => (
            <button 
              key={cat._id}
              onClick={() => {
                setActiveCategory(cat._id);
                setLocalSearch('');
                const params = new URLSearchParams(location.search);
                if (params.has('search')) {
                  navigate('/menu', { replace: true });
                }
              }}
              className="btn"
              style={{ 
                background: activeCategory === cat._id ? 'var(--coffee-dark)' : 'transparent',
                color: activeCategory === cat._id ? '#fff' : 'var(--coffee-dark)',
                border: '1px solid var(--coffee-dark)',
                borderRadius: '20px', padding: '8px 20px', transition: 'all 0.3s'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Live Search Bar within Menu Page */}
        <div style={{ maxWidth: '600px', margin: '0 auto 30px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Tìm nhanh đồ uống bạn thích tại đây..." 
            value={localSearch}
            onChange={handleLocalSearchChange}
            style={{ 
              width: '100%', padding: '12px 20px', 
              borderRadius: '25px', border: '1px solid #ddd', 
              fontSize: '1rem', outline: 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}
          />
        </div>

        {/* Banner Section */}
        <div style={{ marginBottom: '40px', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
          <img 
            src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop" 
            alt="Coffee Banner" 
            style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} 
          />
        </div>

        <div className="menu-grid">
          {filteredItems.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666', fontSize: '1.1rem' }}>
              Không tìm thấy sản phẩm nào phù hợp.
            </p>
          ) : (
            filteredItems.map((item) => (
              <div key={item._id || item.name} className="menu-item" style={{ transition: 'transform 0.2s', backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <img src={item.image} alt={item.name} className="menu-img" style={{cursor: 'pointer', width: '100%', height: '200px', objectFit: 'cover'}} onClick={() => setSelectedProduct(item)} />
                <div className="menu-content" style={{ padding: '15px' }}>
                  <h3 className="menu-title" style={{cursor: 'pointer', margin: '0 0 10px 0', fontSize: '1.1rem'}} onClick={() => setSelectedProduct(item)}>{item.name}</h3>
                  <p className="menu-price" style={{ fontWeight: 'bold', color: 'var(--coffee-dark)' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(String(item.price).replace(/\D/g, '')))}</p>
                  {user && (
                    <button 
                      onClick={(e) => handleAddToCart(item, e)}
                      className="btn btn-primary" 
                      style={{ width: '100%', marginTop: '15px', padding: '10px', borderRadius: '8px' }}
                    >
                      Thêm vào giỏ
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedProduct && (
          <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
              <span className="modal-close" onClick={() => setSelectedProduct(null)}>&times;</span>
              <img src={selectedProduct.image} alt={selectedProduct.name} className="modal-img" />
              <div className="modal-info">
                <h3>{selectedProduct.name}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>Danh mục: {selectedProduct.category?.name}</p>
                <p className="modal-price" style={{ color: 'var(--coffee-accent)', fontWeight: 'bold', fontSize: '1.2rem', margin: '10px 0' }}>
                   {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(String(selectedProduct.price).replace(/\D/g, '')))}
                </p>
                <p className="modal-description">{selectedProduct.description || 'Chưa có mô tả cho sản phẩm này.'}</p>
                {user ? (
                  <button onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }} className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }}>
                    Thêm vào giỏ
                  </button>
                ) : (
                  <p style={{ marginTop: '15px', color: 'var(--coffee-accent)', fontStyle: 'italic', textAlign: 'center' }}>Vui lòng đăng nhập để đặt món.</p>
                )}

                <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                  <h4 style={{ marginBottom: '15px', color: 'var(--coffee-dark)' }}>Đánh giá sản phẩm</h4>
                  
                  {reviews.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto', marginBottom: '15px' }}>
                      {reviews.map((rv, i) => (
                        <li key={i} style={{ marginBottom: '10px', padding: '12px', background: '#f9f9f9', borderRadius: '8px', borderLeft: '3px solid #f39c12' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <strong style={{ fontSize: '0.95rem' }}>{rv.user?.name || 'Khách'}</strong>
                            <span style={{ color: '#f39c12', letterSpacing: '2px' }}>{'★'.repeat(rv.rating)}{'☆'.repeat(5 - rv.rating)}</span>
                          </div>
                          <p style={{ margin: '0', fontSize: '0.9rem', color: '#555', lineHeight: '1.4' }}>{rv.comment}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '15px', fontStyle: 'italic' }}>Chưa có đánh giá nào. Trở thành người đầu tiên đánh giá!</p>
                  )}

                  {user && (
                    <form onSubmit={handleReviewSubmit} style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>Xếp hạng của bạn:</label>
                        <select value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: Number(e.target.value)})} style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ddd' }}>
                          <option value={5}>⭐⭐⭐⭐⭐ (5/5) - Rất ngon</option>
                          <option value={4}>⭐⭐⭐⭐ (4/5) - Ngon</option>
                          <option value={3}>⭐⭐⭐ (3/5) - Tạm được</option>
                          <option value={2}>⭐⭐ (2/5) - Không ngon</option>
                          <option value={1}>⭐ (1/5) - Quá tệ</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <textarea placeholder="Chia sẻ cảm nhận của bạn về đồ uống này..." required value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} rows="3" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', resize: 'none', fontSize: '0.9rem' }}></textarea>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ padding: '8px 15px', fontSize: '0.9rem', width: '100%' }}>Gửi đánh giá</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Menu;
