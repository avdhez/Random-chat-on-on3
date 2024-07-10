import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3001');

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(0);

    useEffect(() => {
        socket.on('message', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        socket.on('typing', () => {
            setIsTyping(true);
        });

        socket.on('stop-typing', () => {
            setIsTyping(false);
        });

        socket.on('partner-disconnected', () => {
            setMessages((prevMessages) => [...prevMessages, { text: 'Partner disconnected', system: true }]);
        });

        socket.on('partner-found', () => {
            setMessages((prevMessages) => [...prevMessages, { text: 'Partner connected', system: true }]);
        });

        fetch('/online-users')
            .then(response => response.json())
            .then(data => setOnlineUsers(data.count));
    }, []);

    const sendMessage = () => {
        if (input.trim()) {
            socket.emit('message', { text: input });
            setMessages((prevMessages) => [...prevMessages, { text: input, own: true }]);
            setInput('');
        }
    };

    const handleTyping = (e) => {
        setInput(e.target.value);
        if (!typing) {
            setTyping(true);
            socket.emit('typing');
            setTimeout(() => {
                setTyping(false);
                socket.emit('stop-typing');
            }, 1000);
        }
    };

    return (
        <div className="App">
            <div>Online users: {onlineUsers}</div>
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.own ? 'message own' : 'message'}>
                        {msg.system ? <i>{msg.text}</i> : msg.text}
                    </div>
                ))}
                {isTyping && <div><i>Partner is typing...</i></div>}
            </div>
            <input type="text" value={input} onChange={handleTyping} />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

export default App;