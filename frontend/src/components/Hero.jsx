import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <h1>Ayush Coffee – Hương vị giữa lòng Hà Nội</h1>
        <p>Đậm đà từng giọt, chill giữa phố cổ.</p>
        <Link to="/menu" className="btn btn-primary">Xem Thực Đơn</Link>
      </div>
    </section>
  );
};

export default Hero;
