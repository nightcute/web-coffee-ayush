import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/AppContext';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'model', text: 'Chào bạn! Mình là AI tư vấn viên của Ayush Coffee. Bạn muốn tìm hiểu thực đơn, giá cả đồ uống hay xem món nào đang được yêu thích nhất không?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useCart();

    // Reset lịch sử chat khi user đăng xuất
    useEffect(() => {
        if (!user) {
            setMessages([
                { sender: 'model', text: 'Chào bạn! Mình là AI tư vấn viên của Ayush Coffee. Bạn muốn tìm hiểu thực đơn, giá cả đồ uống hay xem món nào đang được yêu thích nhất không?' }
            ]);
        }
    }, [user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if(isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const sendQuestion = async (textToSend) => {
        if (!textToSend.trim()) return;

        const userMsg = { sender: 'user', text: textToSend };
        const currentHistory = messages.map(m => ({ sender: m.sender, text: m.text }));
        
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMsg.text,
                    history: currentHistory
                }),
            });

            const data = await response.json();
            
            setMessages(prev => [...prev, { 
                sender: 'model', 
                text: data.text || data.error || 'Xin lỗi, tôi không thể trả lời lúc này.'
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'model', text: 'Mất kết nối với máy chủ AI. Vui lòng kiểm tra lại mạng.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        sendQuestion(input);
        setInput('');
    };

    const suggestedQuestions = [
        "Cho tôi xem menu",
        "Món nào bán chạy nhất?",
        "Tư vấn đồ uống dưới 40.000đ",
        "Có những loại bánh ngọt nào?",
        "Làm sao để đặt hàng?"
    ];

    return (
        <div className="chatbot-container">
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>☕ Trợ lý Ayush Coffee</h3>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    
                    <div className="chatbot-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-msg ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-msg model loading">
                                Đang nhập...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {messages.length === 1 && !isLoading && (
                        <div className="chatbot-suggestions">
                            {suggestedQuestions.map((q, i) => (
                                <button key={i} className="suggestion-chip" onClick={() => sendQuestion(q)} disabled={isLoading}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <form className="chatbot-input" onSubmit={handleSend}>
                        <input 
                            type="text" 
                            placeholder="Nhập tin nhắn..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !input.trim()}>
                            ➤
                        </button>
                    </form>
                </div>
            )}
            
            {!isOpen && (
                <button className="chatbot-toggle-btn" onClick={() => setIsOpen(true)}>
                    💬
                </button>
            )}
        </div>
    );
};

export default Chatbot;
