import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            content: '¡Hola! Soy El Moai, tu asistente virtual. ¿En qué puedo ayudarte hoy?'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        setSessionId(Math.random().toString(36).substring(7));
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = inputValue;
        setInputValue('');
        
        setMessages(prev => [...prev, {
            sender: 'user',
            content: userMessage
        }]);

        setIsTyping(true);

        try {
            const response = await fetch('https://primary-production-d2694.up.railway.app/webhook/f0f72c88-e03d-4905-98f6-ab7ecf467b29', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    sessionId: sessionId
                }),
            });

            const data = await response.json();
            console.log('Respuesta del webhook:', data); // Debug log
            setIsTyping(false);

            if (data && typeof data === 'object') {
                let botResponse = '';
                
                if (Array.isArray(data) && data.length > 0 && data[0].output) {
                    botResponse = data[0].output;
                } else if (data.output) {
                    botResponse = data.output;
                } else {
                    console.error('Formato de respuesta inesperado:', data);
                    botResponse = 'Lo siento, no pude procesar tu mensaje correctamente.';
                }

                setMessages(prev => [...prev, {
                    sender: 'bot',
                    content: botResponse
                }]);
            }
        } catch (error) {
            console.error('Error en la comunicación:', error);
            setIsTyping(false);
            setMessages(prev => [...prev, {
                sender: 'bot',
                content: 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.'
            }]);
        }
    };

    return (
        <div className="chatbot-container">
            <button 
                className="chatbot-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle chat"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
            </button>

            <div className={`chatbot-window ${!isOpen ? 'hidden' : ''}`}>
                <div className="chatbot-header">
                    <div className="logo-container">
                        <div className="moai-logo">
                            <img src="/elmoai_logo.svg" alt="Moai Logo" />
                        </div>
                        <div className="text-part">
                            <span className="el">El</span>
                            <span className="moai-text">Moai</span>
                        </div>
                    </div>
                    <button 
                        className="close-button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close chat"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="chat-messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.sender}`}>
                            <div className="message-sender">
                                {message.sender === 'bot' ? 'El Moai' : 'Tú'}
                            </div>
                            <div className="message-content">
                                {message.content}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="message typing">
                            <div className="message-sender">El Moai</div>
                            <div className="message-content">
                                <div className="typing-animation">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="chat-input">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        aria-label="Message input"
                    />
                    <button type="submit" aria-label="Send message">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
