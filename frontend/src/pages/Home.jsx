import React from 'react';
import Hero from '../components/Hero';
import Featured from '../components/Featured';
import Menu from '../components/Menu';
import OrderForm from '../components/OrderForm';
import Footer from '../components/Footer';
import { useCart } from '../context/AppContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useCart();
  return (
    <>
      <main>
        <Hero />
        <Featured />
        {user ? (
          <OrderForm />
        ) : (
          <section id="order-notice" className="form-section">
            <div className="container" style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--coffee-light)', borderRadius: '8px' }}>
              <h2 className="section-title">Đặt Bàn / Đặt Món</h2>
              <p style={{ marginBottom: '20px' }}>Vui lòng đăng nhập để có thể đặt món trực tuyến và nhận nhiều ưu đãi.</p>
              <Link to="/login" className="btn btn-primary">Đăng nhập ngay</Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Home;
