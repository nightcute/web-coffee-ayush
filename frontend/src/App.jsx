import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Chatbot from './components/Chatbot';
import './index.css';

import OrderHistory from './pages/OrderHistory';

import Menu from './components/Menu';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/history" element={<OrderHistory />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Chatbot />
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
