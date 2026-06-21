import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-col">
            <h3>Ayush Coffee</h3>
            <p>Đậm đà từng giọt, chill giữa phố cổ.</p>
            <p>Nơi giao thoa giữa hương vị cà phê hiện đại và không gian truyền thống Hà Nội.</p>
          </div>
          <div className="footer-col">
            <h3>Liên Hệ</h3>
            <p>Địa chỉ: 56 Hàng Bông, Hoàn Kiếm, Hà Nội</p>
            <p>Hotline: 090xxxxxxx</p>
            <p>Giờ mở cửa: 07:00 - 23:00 hàng ngày</p>
          </div>
          <div className="footer-col">
            <h3>Kết Nối</h3>
            <div className="social-links">
              <a href="#" aria-label="Facebook">F</a>
              <a href="#" aria-label="Instagram">I</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Thiết kế bởi Vương Cường</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
