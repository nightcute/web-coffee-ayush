import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/AppContext';
import { Home, ShoppingCart, User, ClipboardList, ShieldCheck, LogOut, Search, X, Coffee } from 'lucide-react';

const Navbar = () => {
  const { cart, user, logout } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xóa trắng input tìm kiếm trên Navbar nếu URL không chứa query 'search'
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (!searchParams.has('search')) {
      setSearchQuery('');
    }
  }, [location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    } else {
      navigate('/menu');
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className="navbar" style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'linear-gradient(to right, #FFFDF8, #F3E8E0)', borderBottom: '1px solid #E6D5C3', padding: '15px 0', boxShadow: '0 2px 15px rgba(75, 54, 33, 0.08)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo">
          <Link to="/" style={{ color: 'var(--coffee-dark)', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.6rem', fontFamily: 'var(--font-heading, sans-serif)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Coffee size={28} strokeWidth={2.5} color="#A67C52" />
            Ayush Coffee
          </Link>
        </div>
        
        {/* Nav Icons */}
        <ul className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '30px', listStyle: 'none', margin: 0, padding: 0 }}>
          
          <li>
            <Link to="/" title="Trang chủ" style={{ color: 'var(--coffee-dark)', display: 'flex' }}>
              <Home size={24} strokeWidth={2} />
            </Link>
          </li>
          
          <li>
            <Link to="/menu" title="Thực đơn" style={{ color: 'var(--coffee-dark)', display: 'flex', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
              Menu
            </Link>
          </li>
          
          {/* Search Feature */}
          <li ref={searchRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: '20px', padding: '2px 10px', width: '200px' }}>
                <input 
                  type="text" 
                  placeholder="Tìm đồ uống..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{ border: 'none', background: 'transparent', outline: 'none', padding: '5px', width: '100%', fontSize: '0.9rem' }}
                />
                <X size={18} color="#999" style={{ cursor: 'pointer' }} onClick={() => setIsSearchOpen(false)} />
              </form>
            ) : (
              <button 
                onClick={() => setIsSearchOpen(true)}
                title="Tìm kiếm" 
                style={{ color: 'var(--coffee-dark)', display: 'flex', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <Search size={24} strokeWidth={2} />
              </button>
            )}
          </li>

          <li>
            <Link to="/cart" title="Giỏ hàng" style={{ color: 'var(--coffee-dark)', display: 'flex', position: 'relative' }}>
              <ShoppingCart size={24} strokeWidth={2} />
              {totalItems > 0 && (
                <span style={{ 
                  position: 'absolute', top: '-8px', right: '-10px',
                  background: '#e74c3c', color: '#fff',
                  borderRadius: '50%', width: '20px', height: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 'bold'
                }}>
                  {totalItems}
                </span>
              )}
            </Link>
          </li>

          {/* User Dropdown */}
          <li ref={dropdownRef} style={{ position: 'relative', display: 'flex' }}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ 
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
                color: 'var(--coffee-dark)'
              }}
              title="Tài khoản"
            >
              <User size={24} strokeWidth={2} />
            </button>

            {isDropdownOpen && (
              <div style={{
                position: 'absolute', top: '45px', right: '-10px',
                background: '#fff', borderRadius: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                padding: '20px', width: '250px',
                zIndex: 1001,
                display: 'flex', flexDirection: 'column', gap: '10px',
                border: '1px solid #f0f0f0'
              }}>
                {/* MUI-like small arrow up */}
                <div style={{ position: 'absolute', top: '-6px', right: '16px', width: '12px', height: '12px', background: '#fff', transform: 'rotate(45deg)', borderLeft: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0' }}></div>
                
                {!user ? (
                  <>
                    <button 
                      onClick={() => { navigate('/login'); setIsDropdownOpen(false); }}
                      style={{ 
                        background: 'var(--coffee-dark)', color: '#fff', 
                        border: 'none', borderRadius: '8px', 
                        padding: '12px', fontWeight: 'bold', 
                        cursor: 'pointer', width: '100%',
                        fontSize: '0.95rem'
                      }}
                    >
                      ĐĂNG NHẬP
                    </button>
                    <button 
                      onClick={() => { navigate('/login'); setIsDropdownOpen(false); }}
                      style={{ 
                        background: 'none', color: 'var(--coffee-dark)', 
                        border: 'none', fontWeight: 'bold', 
                        cursor: 'pointer', width: '100%',
                        fontSize: '0.85rem', marginTop: '5px'
                      }}
                    >
                      TẠO TÀI KHOẢN
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '8px', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--coffee-dark)', fontSize: '1.05rem' }}>Xin chào, {user.name}</p>
                    </div>
                    
                    <Link to="/history" onClick={() => setIsDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#555', textDecoration: 'none', fontWeight: '500', padding: '8px 5px', borderRadius: '6px', transition: 'background 0.2s' }}>
                      <ClipboardList size={18} /> Lịch sử mua hàng
                    </Link>
                    
                    {(user.role === 'admin' || user.role === 'staff') && (
                      <Link to="/admin" onClick={() => setIsDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#555', textDecoration: 'none', fontWeight: '500', padding: '8px 5px', borderRadius: '6px', transition: 'background 0.2s' }}>
                        <ShieldCheck size={18} /> Quản lý nội bộ
                      </Link>
                    )}
                    
                    <button 
                      onClick={handleLogout}
                      style={{ 
                        background: 'none', border: 'none', color: '#e74c3c', 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', 
                        padding: '12px 5px 5px', fontWeight: '500', borderTop: '1px solid #eee', width: '100%', marginTop: '5px'
                      }}
                    >
                      <LogOut size={18} /> Đăng xuất
                    </button>
                  </>
                )}
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
