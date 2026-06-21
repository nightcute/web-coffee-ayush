import React, { useState, useEffect } from 'react';
import { useCart } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import './Admin.css';

const Admin = () => {
  const { user } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chartFilter, setChartFilter] = useState('monthly'); // 'daily', 'weekly', 'monthly'
  
  // Data states
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // For Invoice Modal
  const [editingProduct, setEditingProduct] = useState(null); // For Editing Product
  const [isAddingProduct, setIsAddingProduct] = useState(false); // For Adding Product
  const [editingCategory, setEditingCategory] = useState(null); // For Editing Category
  const [searchProductQuery, setSearchProductQuery] = useState(''); // For searching products
  const [searchOrderQuery, setSearchOrderQuery] = useState(''); // For searching orders
  const [orderTab, setOrderTab] = useState('all'); // 'all', 'reservation', 'dine-in', 'delivery'
  
  // POS States
  const [posCart, setPosCart] = useState([]);
  const [posTotal, setPosTotal] = useState(0);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      navigate('/login');
      return;
    }
    // Nhân viên không được xem thống kê, chuyển hướng sang POS
    if (user.role === 'staff' && activeTab === 'dashboard') {
      setActiveTab('pos');
      return;
    }
    fetchData();
  }, [user, navigate, activeTab]);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${user.token}` };
      if (activeTab === 'dashboard') {
        const res = await fetch('http://localhost:5000/api/admin/revenue', { headers });
        setAnalytics(await res.json());
      } else if (activeTab === 'orders') {
        const res = await fetch('http://localhost:5000/api/admin/orders', { headers });
        setOrders(await res.json());
      } else if (activeTab === 'categories') {
        const res = await fetch('http://localhost:5000/api/categories');
        setCategories(await res.json());
      } else if (activeTab === 'products' || activeTab === 'pos') {
        const resP = await fetch('http://localhost:5000/api/products');
        setProducts(await resP.json());
        // Fetch categories to populate dropdowns in Products tab
        const resC = await fetch('http://localhost:5000/api/categories');
        setCategories(await resC.json());
      } else if (activeTab === 'promotions') {
        const resPromo = await fetch('http://localhost:5000/api/promotions');
        setPromotions(await resPromo.json());
      } else if (activeTab === 'users') {
        const resUsers = await fetch('http://localhost:5000/api/admin/users', { headers });
        setUsersList(await resUsers.json());
      }
    } catch (error) {
      console.error("Lỗi fetch data:", error);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
      toast.success('Cập nhật trạng thái thành công');
    } catch (err) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  const handleUpdateUserStatus = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        return toast.error(data.message || 'Lỗi cập nhật trạng thái người dùng');
      }
      fetchData();
      toast.success('Cập nhật người dùng thành công');
    } catch (err) {
      toast.error('Lỗi cập nhật trạng thái người dùng');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    try {
      await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ name })
      });
      e.target.reset();
      fetchData();
      toast.success('Thêm danh mục thành công!');
    } catch (err) { toast.error('Lỗi thêm danh mục'); }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    const newName = e.target.name.value;
    if (!newName) return;
    try {
      await fetch(`http://localhost:5000/api/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ name: newName })
      });
      setEditingCategory(null);
      fetchData();
      toast.success('Sửa danh mục thành công!');
    } catch (err) { toast.error('Lỗi sửa danh mục'); }
  };

  const handleDeleteCategory = (id) => {
    toast((t) => (
      <div>
        <p style={{ margin: '0 0 10px' }}>Chắc chắn xóa danh mục này?</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              await fetch(`http://localhost:5000/api/categories/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${user.token}` } });
              fetchData();
              toast.success('Đã xóa danh mục');
            } catch (err) { toast.error('Lỗi xóa danh mục'); }
          }} style={{ padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
          <button onClick={() => toast.dismiss(t.id)} style={{ padding: '6px 12px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hủy</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  // --- Product Functions ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    let imageUrl = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800';
    const fileInput = e.target.imageFile;
    if (fileInput.files && fileInput.files[0]) {
      const formData = new FormData();
      formData.append('image', fileInput.files[0]);
      try {
        const uploadRes = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user.token}` },
          body: formData
        });
        const data = await uploadRes.json();
        if (data.url) imageUrl = data.url;
      } catch (err) { toast.error('Lỗi tải ảnh lên'); return; }
    }

    const newProduct = {
      name: e.target.name.value,
      price: parseInt(e.target.price.value.replace(/\D/g, '')) || 0,
      category: e.target.category.value,
      image: imageUrl,
      description: e.target.description.value
    };
    try {
      await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(newProduct)
      });
      e.target.reset();
      setIsAddingProduct(false);
      fetchData();
      toast.success('Thêm sản phẩm thành công!');
    } catch (err) { toast.error('Lỗi tạo sản phẩm'); }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    let imageUrl = e.target.imageFallback.value;
    const fileInput = e.target.imageFile;
    if (fileInput.files && fileInput.files[0]) {
      const formData = new FormData();
      formData.append('image', fileInput.files[0]);
      try {
        const uploadRes = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user.token}` },
          body: formData
        });
        const data = await uploadRes.json();
        if (data.url) imageUrl = data.url;
      } catch (err) { toast.error('Lỗi tải ảnh lên'); return; }
    }

    const updatedProduct = {
      name: e.target.name.value,
      price: parseInt(e.target.price.value.replace(/\D/g, '')) || 0,
      category: e.target.category.value,
      image: imageUrl,
      description: e.target.description.value
    };
    try {
      await fetch(`http://localhost:5000/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(updatedProduct)
      });
      setEditingProduct(null);
      fetchData();
      toast.success('Cập nhật sản phẩm thành công!');
    } catch (err) { toast.error('Lỗi cập nhật sản phẩm'); }
  };

  const handleDeleteProduct = (id) => {
    toast((t) => (
      <div>
        <p style={{ margin: '0 0 10px' }}>Chắc chắn xóa sản phẩm này?</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${user.token}` } });
              fetchData();
              toast.success('Đã xóa sản phẩm');
            } catch (err) { toast.error('Lỗi xóa sản phẩm'); }
          }} style={{ padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
          <button onClick={() => toast.dismiss(t.id)} style={{ padding: '6px 12px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hủy</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  // --- POS Functions ---
  const addToPosCart = (product) => {
    setPosCart(prev => {
      const existing = prev.find(i => i.product === product._id);
      if (existing) {
        return prev.map(i => i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product: product._id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const removePosCart = (productId) => {
    setPosCart(prev => prev.filter(i => i.product !== productId));
  };

  useEffect(() => {
    const total = posCart.reduce((sum, item) => sum + (parseInt(String(item.price).replace(/\D/g, '')) * item.quantity), 0);
    setPosTotal(total);
  }, [posCart]);

  const handlePosCheckout = async () => {
    if (posCart.length === 0) return toast.error('Chưa chọn món!');
    try {
      await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({
          orderType: 'dine-in',
          cartItems: posCart,
          totalAmount: posTotal
        })
      });
      toast.success('Thanh toán thành công!');
      setPosCart([]);
      fetchData();
    } catch (err) { toast.error('Lỗi thanh toán'); }
  };

  // --- Render Functions ---
  const renderDashboard = () => (
    <div>
      <h3>Báo cáo doanh thu</h3>
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div className="admin-card" style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#A67C52' }}>Tổng Doanh Thu</h4>
            <p className="admin-text-primary" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0' }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(analytics.totalRevenue)}
            </p>
          </div>
          <div className="admin-card" style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#A67C52' }}>Doanh Thu Tại Quán</h4>
            <p className="admin-text-primary" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0' }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(analytics.dineInRevenue)}
            </p>
          </div>
          <div className="admin-card" style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#A67C52' }}>Doanh Thu Giao Hàng</h4>
            <p className="admin-text-primary" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0' }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(analytics.deliveryRevenue)}
            </p>
          </div>
          <div className="admin-card" style={{ textAlign: 'center' }}>
            <h4 style={{ color: '#A67C52' }}>Tổng Đơn Đã Xong</h4>
            <p className="admin-text-primary" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0' }}>
              {analytics.totalOrders}
            </p>
          </div>
        </div>
      )}
      {analytics && analytics.monthlyRevenue && analytics.monthlyRevenue.length > 0 && (
        <div className="admin-card" style={{ marginTop: '40px' }}>
          <h4 style={{ color: '#A67C52', marginBottom: '20px' }}>Biểu Đồ Doanh Thu Theo Tháng</h4>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={analytics.monthlyRevenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(value)} />
                <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} />
                <Legend />
                <Bar dataKey="revenue" name="Doanh Thu" fill="#A67C52" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrders = () => {
    const filteredOrders = orders.filter(order => {
      const matchTab = orderTab === 'all' || order.orderType === orderTab;
      const term = searchOrderQuery.toLowerCase();
      const matchSearch = order._id.toLowerCase().includes(term) || 
        (order.customerInfo?.name || '').toLowerCase().includes(term) ||
        (order.user?.name || '').toLowerCase().includes(term);
      return matchTab && matchSearch;
    });

    return (
      <div>
        <h3 className="admin-text-primary">Quản lý Đơn hàng</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setOrderTab('all')} className="btn" style={{ padding: '8px 15px', background: orderTab === 'all' ? '#A67C52' : '#f0f0f0', color: orderTab === 'all' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Tất cả</button>
            <button onClick={() => setOrderTab('reservation')} className="btn" style={{ padding: '8px 15px', background: orderTab === 'reservation' ? '#A67C52' : '#f0f0f0', color: orderTab === 'reservation' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Đặt bàn</button>
            <button onClick={() => setOrderTab('dine-in')} className="btn" style={{ padding: '8px 15px', background: orderTab === 'dine-in' ? '#A67C52' : '#f0f0f0', color: orderTab === 'dine-in' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Tại quán</button>
            <button onClick={() => setOrderTab('delivery')} className="btn" style={{ padding: '8px 15px', background: orderTab === 'delivery' ? '#A67C52' : '#f0f0f0', color: orderTab === 'delivery' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Giao hàng</button>
          </div>
          <input 
            type="text" 
            placeholder="Tìm theo tên khách hoặc mã đơn..." 
            value={searchOrderQuery} 
            onChange={(e) => setSearchOrderQuery(e.target.value)} 
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '300px' }} 
          />
        </div>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: '#fff' }}>
          <thead>
            <tr>
               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Mã Đơn</th>
               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Khách Hàng</th>
               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Loại Đơn</th>
               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tổng Tiền</th>
               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Trạng Thái</th>
               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Hành Động</th>
               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Chi Tiết</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order._id}>
                 <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>#{order._id.substring(order._id.length - 6)}</td>
                 <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.customerInfo?.name || (order.user ? order.user.name : 'Khách vãng lai')}</td>
                 <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{order.orderType === 'reservation' ? 'Đặt bàn' : (order.orderType === 'dine-in' ? 'Tại quán' : 'Giao hàng')}</td>
                 <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</td>
                 <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{order.status}</td>
                 <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <select value={order.status} onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)} style={{ padding: '5px' }}>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                 </td>
                 <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button onClick={() => setSelectedOrder(order)} className="btn admin-btn-primary" style={{ padding: '5px 10px' }}>Xem</button>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCategories = () => (
    <div>
      <h3 className="admin-text-primary">Quản lý Danh mục</h3>
      {user.role === 'admin' && (
        <form onSubmit={handleAddCategory} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input name="name" type="text" placeholder="Tên danh mục mới" required style={{ padding: '8px', flex: 1, border: '1px solid #ccc', borderRadius: '4px' }} />
          <button type="submit" className="btn admin-btn-primary" style={{ padding: '8px 20px' }}>Thêm</button>
        </form>
      )}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {categories.map(c => (
          <li key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: '#fff', marginBottom: '8px', borderRadius: '4px', border: '1px solid #eee' }}>
            <span style={{ fontWeight: '500' }}>{c.name}</span>
            {user.role === 'admin' && (
              <div>
                <button onClick={() => setEditingCategory(c)} className="btn admin-btn-primary" style={{ padding: '6px 12px', marginRight: '10px', fontSize: '0.9rem' }}>Sửa</button>
                <button onClick={() => handleDeleteCategory(c._id)} className="btn btn-danger" style={{ padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>Xóa</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  const renderProducts = () => {
    const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) || 
      (p.category?.name || 'Khác').toLowerCase().includes(searchProductQuery.toLowerCase())
    );

    return (
      <div>
        <h3 className="admin-text-primary">Quản lý Sản phẩm</h3>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm (tên, danh mục)..." 
            value={searchProductQuery}
            onChange={(e) => setSearchProductQuery(e.target.value)}
            style={{ padding: '10px', flex: 1, minWidth: '250px', maxWidth: '400px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          {user.role === 'admin' && (
            <button onClick={() => setIsAddingProduct(true)} className="btn admin-btn-primary" style={{ padding: '10px 20px' }}>
              + Thêm Món Mới
            </button>
          )}
        </div>
        
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', background: '#fff' }}>
        <thead>
          <tr>
             <th style={{ padding: '10px', border: '1px solid #ddd', width: '60px' }}>Hình</th>
             <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tên món</th>
             <th style={{ padding: '10px', border: '1px solid #ddd' }}>Danh mục</th>
             <th style={{ padding: '10px', border: '1px solid #ddd' }}>Giá</th>
             <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Đã bán</th>
             {user.role === 'admin' && <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Hành động</th>}
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map(p => (
            <tr key={p._id}>
               <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                 <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
               </td>
               <td style={{ padding: '10px', border: '1px solid #ddd' }}><strong>{p.name}</strong><br/><small style={{color:'#666'}}>{p.description}</small></td>
               <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.category?.name || 'Khác'}</td>
               <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', color: 'var(--coffee-dark)', fontWeight: 'bold' }}>
                 {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
               </td>
               <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{p.soldQuantity || 0}</td>
               {user.role === 'admin' && (
                 <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                   <button onClick={() => setEditingProduct(p)} className="btn admin-btn-primary" style={{ padding: '6px 12px', marginRight: '5px', fontSize: '0.85rem' }}>Sửa</button>
                   <button onClick={() => handleDeleteProduct(p._id)} className="btn btn-danger" style={{ padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Xóa</button>
                 </td>
               )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    );
  };

  const handleAddPromotion = async (e) => {
    e.preventDefault();
    const newPromo = {
      code: e.target.code.value.toUpperCase(),
      discountPercent: Number(e.target.discountPercent.value),
      maxDiscount: Number(e.target.maxDiscount.value),
      minOrderValue: Number(e.target.minOrderValue.value),
      expirationDate: e.target.expirationDate.value
    };
    try {
      await fetch('http://localhost:5000/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify(newPromo)
      });
      e.target.reset();
      fetchData();
      toast.success('Tạo mã giảm giá thành công!');
    } catch (err) { toast.error('Lỗi tạo mã giảm giá'); }
  };

  const handleDeletePromotion = (id) => {
    toast((t) => (
      <div>
        <p style={{ margin: '0 0 10px' }}>Chắc chắn xóa khuyến mãi này?</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              await fetch(`http://localhost:5000/api/promotions/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${user.token}` } });
              fetchData();
              toast.success('Đã xóa khuyến mãi');
            } catch (err) { toast.error('Lỗi xóa khuyến mãi'); }
          }} style={{ padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
          <button onClick={() => toast.dismiss(t.id)} style={{ padding: '6px 12px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hủy</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const renderPromotions = () => (
    <div>
      <h3 className="admin-text-primary">Quản lý Khuyến Mãi</h3>
      {user.role === 'admin' && (
        <form className="admin-card" onSubmit={handleAddPromotion} style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input name="code" type="text" placeholder="Mã (vd: SALE20)" required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input name="discountPercent" type="number" placeholder="% Giảm" required style={{ padding: '8px', width: '100px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input name="maxDiscount" type="number" placeholder="Giảm tối đa (đ)" required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input name="minOrderValue" type="number" placeholder="Đơn tối thiểu (đ)" required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input name="expirationDate" type="date" required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <button type="submit" className="btn admin-btn-primary" style={{ padding: '8px 20px' }}>Tạo mã</button>
        </form>
      )}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {promotions.map(p => (
          <li key={p._id} className="admin-card" style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#A67C52', fontSize: '1.1rem' }}>Mã: {p.code}</strong>
                <span style={{ color: p.isActive ? 'green' : 'red', marginLeft: '10px' }}>{p.isActive ? 'Đang hoạt động' : 'Đã khóa'}</span>
              </div>
              {user.role === 'admin' && (
                <button onClick={() => handleDeletePromotion(p._id)} className="btn btn-danger" style={{ padding: '4px 8px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Xóa</button>
              )}
            </div>
            <p style={{ margin: '5px 0' }}>Giảm {p.discountPercent}%, tối đa {p.maxDiscount}đ (Áp dụng đơn từ {p.minOrderValue}đ)</p>
            <p style={{ margin: '0', fontSize: '0.85rem', color: '#666' }}>Hạn sử dụng: {new Date(p.expirationDate).toLocaleDateString('vi-VN')}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderUsers = () => (
    <div>
      <h3 className="admin-text-primary">Quản lý Người Dùng & Khách Hàng</h3>
      <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: '#fff' }}>
        <thead>
          <tr>
             <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tên</th>
             <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
             <th style={{ padding: '10px', border: '1px solid #ddd' }}>Vai Trò</th>
             <th style={{ padding: '10px', border: '1px solid #ddd' }}>Trạng Thái</th>
             <th style={{ padding: '10px', border: '1px solid #ddd' }}>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {usersList.map(u => (
            <tr key={u._id}>
               <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.name}</td>
               <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.email}</td>
               <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                 {u.role === 'admin' ? 'Quản trị viên' : u.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}
               </td>
               <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                 <span style={{ color: u.isActive !== false ? 'green' : 'red', fontWeight: 'bold' }}>
                   {u.isActive !== false ? 'Hoạt động' : 'Bị Khóa'}
                 </span>
               </td>
               <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleUpdateUserStatus(u._id)} 
                    className="btn" 
                    style={{ padding: '5px 10px', background: u.isActive !== false ? '#ff4d4f' : '#52c41a', color: '#fff', opacity: u._id === user._id ? 0.5 : 1 }}
                    disabled={u._id === user._id}
                  >
                    {u.isActive !== false ? 'Khóa' : 'Mở Khóa'}
                  </button>
               </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPOS = () => (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div style={{ flex: 2 }}>
        <h3 className="admin-text-primary">Chọn Món (Tại quán)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginTop: '15px' }}>
          {products.map(p => (
            <div key={p._id} onClick={() => addToPosCart(p)} className="admin-card" style={{ cursor: 'pointer', textAlign: 'center', padding: '10px' }}>
              <img src={p.image} alt={p.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
              <h4 style={{ margin: '10px 0 5px', fontSize: '0.9rem', color: '#4B3621' }}>{p.name}</h4>
              <p style={{ color: '#A67C52', fontWeight: 'bold' }}>{p.price}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="admin-card" style={{ flex: 1, alignSelf: 'start', position: 'sticky', top: '100px' }}>
        <h3 className="admin-text-primary" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Hóa Đơn</h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto', margin: '15px 0' }}>
          {posCart.map(item => (
            <div key={item.product} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
              <span>{item.name} x {item.quantity}</span>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span>{parseInt(String(item.price).replace(/\D/g, '')) * item.quantity}đ</span>
                <span onClick={() => removePosCart(item.product)} style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold' }}>x</span>
              </div>
            </div>
          ))}
          {posCart.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>Chưa có món</p>}
        </div>
        <div style={{ borderTop: '2px dashed #ccc', paddingTop: '15px', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', color: '#A67C52' }}>
          <span>TỔNG:</span>
          <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(posTotal)}</span>
        </div>
        <button onClick={handlePosCheckout} className="btn admin-btn-primary" style={{ width: '100%', padding: '15px', marginTop: '20px' }}>
          THANH TOÁN & HOÀN THÀNH
        </button>
      </div>
    </div>
  );

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem' }}>Đang tải dữ liệu phân quyền...</div>;
  }

  return (
    <div className="admin-container" style={{ display: 'flex', minHeight: '80vh' }}>
      {/* Sidebar */}
      <div className="admin-sidebar" style={{ width: '250px', padding: '20px 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.5rem' }}>Admin Panel</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {['dashboard', 'pos', 'orders', 'categories', 'products', 'promotions', 'users'].map(tab => {
            if (user.role !== 'admin' && (tab === 'dashboard' || tab === 'users')) return null;
            return (
              <li 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`admin-nav-item ${activeTab === tab ? 'active' : ''}`}
              >
                {tab === 'dashboard' ? 'Thống Kê' : tab === 'pos' ? 'Bán Hàng (POS)' : tab === 'orders' ? 'Đơn Hàng' : tab === 'categories' ? 'Danh Mục' : tab === 'products' ? 'Sản Phẩm' : tab === 'promotions' ? 'Khuyến Mãi' : 'Khách Hàng'}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '30px' }}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'categories' && renderCategories()}
        {activeTab === 'pos' && renderPOS()}
        {activeTab === 'promotions' && renderPromotions()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'products' && (user.role === 'admin' ? renderProducts() : (
           <div>
             <h3>Quản lý Sản phẩm</h3>
             <p style={{ color: 'red', fontStyle: 'italic' }}>Chỉ chủ cửa hàng (Admin) mới có quyền truy cập sản phẩm.</p>
           </div>
        ))}
      </div>

      {/* Invoice Modal for Admin */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>&times;</button>
            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px dashed #ccc', paddingBottom: '20px' }}>
              <h2 className="admin-text-primary" style={{ margin: 0 }}>AYUSH COFFEE</h2>
              <p style={{ margin: '5px 0 0', color: '#666' }}>Chi Tiết Hóa Đơn</p>
            </div>
            <div style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
              <p><strong>Mã HĐ:</strong> #{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}</p>
              <p><strong>Thời gian:</strong> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
              <p><strong>Loại đơn:</strong> {selectedOrder.orderType === 'dine-in' ? 'Uống tại quán' : 'Giao hàng tận nơi'}</p>
              {selectedOrder.customerInfo?.name && <p><strong>Khách hàng:</strong> {selectedOrder.customerInfo.name}</p>}
              {selectedOrder.customerInfo?.phone && <p><strong>Điện thoại:</strong> {selectedOrder.customerInfo.phone}</p>}
              {selectedOrder.customerInfo?.address && <p><strong>Địa chỉ:</strong> {selectedOrder.customerInfo.address}</p>}
              {selectedOrder.customerInfo?.notes && <p><strong>Ghi chú:</strong> {selectedOrder.customerInfo.notes}</p>}
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
                  const itemPrice = parseInt(String(item.price).replace(/\D/g, '')) || 0;
                  const itemTotal = itemPrice * item.quantity;
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '8px 0' }}>{item.name}</td>
                      <td style={{ padding: '8px 0', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(itemTotal)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div style={{ borderTop: '2px dashed #ccc', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <span>TỔNG CỘNG:</span>
              <span className="admin-text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <h3 className="admin-text-primary" style={{ marginTop: 0 }}>Sửa Danh Mục</h3>
            <form onSubmit={handleUpdateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input name="name" type="text" defaultValue={editingCategory.name} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setEditingCategory(null)} style={{ padding: '8px 20px', background: '#ccc' }}>Hủy</button>
                <button type="submit" className="btn admin-btn-primary" style={{ padding: '8px 20px' }}>Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddingProduct && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
            <h3 className="admin-text-primary" style={{ marginTop: 0 }}>Thêm Món Mới</h3>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Tên món</label>
                <input name="name" type="text" placeholder="Tên món" required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Giá</label>
                  <input name="price" type="text" placeholder="Giá (vd: 35000)" required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Danh mục</label>
                  <select name="category" required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Hình ảnh (chọn từ máy)</label>
                <input name="imageFile" type="file" accept="image/*" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                <input name="imageFallback" type="hidden" defaultValue="" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Mô tả</label>
                <textarea name="description" placeholder="Mô tả món..." rows="3" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setIsAddingProduct(false)} style={{ padding: '8px 20px', background: '#ccc' }}>Hủy</button>
                <button type="submit" className="btn admin-btn-primary" style={{ padding: '8px 20px' }}>Thêm Món</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
            <h3 className="admin-text-primary" style={{ marginTop: 0 }}>Sửa Sản Phẩm</h3>
            <form onSubmit={handleUpdateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Tên món</label>
                <input name="name" type="text" defaultValue={editingProduct.name} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Giá</label>
                  <input name="price" type="text" defaultValue={editingProduct.price} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Danh mục</label>
                  <select name="category" defaultValue={editingProduct.category?._id || editingProduct.category || ''} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Hình ảnh (chọn từ máy)</label>
                <input name="imageFile" type="file" accept="image/*" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                <input name="imageFallback" type="hidden" defaultValue={editingProduct.image} />
                {editingProduct.image && (
                  <img src={editingProduct.image} alt="current" style={{ marginTop: '10px', width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Mô tả</label>
                <textarea name="description" defaultValue={editingProduct.description} rows="3" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn" onClick={() => setEditingProduct(null)} style={{ padding: '8px 20px', background: '#ccc' }}>Hủy</button>
                <button type="submit" className="btn admin-btn-primary" style={{ padding: '8px 20px' }}>Cập Nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
