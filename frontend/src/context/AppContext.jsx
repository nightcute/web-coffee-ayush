import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load auth from local storage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    // Load cart from local storage
    const cartInfo = localStorage.getItem('cartItems');
    if (cartInfo) {
      setCart(JSON.parse(cartInfo));
    }
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(item => item._id === product._id || item.name === product.name);
    let newCart;
    if (existing) {
      newCart = cart.map(item => 
        (item._id === product._id || item.name === product.name) ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    setCart(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
  };

  const removeFromCart = (productName) => {
    const newCart = cart.filter(item => item.name !== productName);
    setCart(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
  };

  const updateQuantity = (productName, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productName);
      return;
    }
    const newCart = cart.map(item => 
      item.name === productName ? { ...item, quantity } : item
    );
    setCart(newCart);
    localStorage.setItem('cartItems', JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cartItems');
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, updateQuantity, user, login, logout }}>
      {children}
    </CartContext.Provider>
  );
};
