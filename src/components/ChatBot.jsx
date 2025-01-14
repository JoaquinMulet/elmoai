import { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            sender: 'El Moai',
            content: '¡Hola! Soy El Moai, tu asistente virtual. ¿En qué puedo ayudarte hoy? (Explorar servicios, solicitar cotización, agendar reunión)'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Generar un nuevo sessionId cuando se monta el componente
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 10);
        const newSessionId = `session_${timestamp}_${randomString}`;
        setSessionId(newSessionId);
    }, []);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        // Agregar mensaje del usuario
        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            sender: 'Tú',
            content: inputMessage.trim()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            console.log('Enviando mensaje:', {
                message: userMessage.content,
                sessionId: sessionId
            });

            const response = await fetch('https://primary-production-d2694.up.railway.app/webhook/f0f72c88-e03d-4905-98f6-ab7ecf467b29', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    sessionId: sessionId
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Respuesta del servidor (raw):', data);
            console.log('Tipo de data:', typeof data);
            console.log('Es array?:', Array.isArray(data));
            
            let botResponse;
            if (Array.isArray(data) && data.length > 0) {
                console.log('Primer elemento del array:', data[0]);
                botResponse = data[0].output;
            } else if (typeof data === 'object' && data.output) {
                botResponse = data.output;
            } else {
                console.error('Formato de respuesta inesperado:', data);
                botResponse = 'Lo siento, hubo un error al procesar la respuesta.';
            }

            console.log('Respuesta procesada:', botResponse);
            
            // Agregar respuesta del bot
            const botMessage = {
                id: messages.length + 2,
                type: 'bot',
                sender: 'El Moai',
                content: botResponse || 'Lo siento, no pude procesar tu mensaje.'
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error en la comunicación:', error);
            // Mensaje de error
            const errorMessage = {
                id: messages.length + 2,
                type: 'bot',
                sender: 'El Moai',
                content: 'Lo siento, ha ocurrido un error en la comunicación. Por favor, intenta de nuevo.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="chatbot-container">
            <button 
                className="chatbot-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Abrir chat"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
            </button>

            <div className={`chatbot-window ${!isOpen ? 'hidden' : ''}`}>
                <div className="chatbot-header">
                    <div className="header-text">
                        <span className="el">Chatea con</span>
                        <span className="moai-text">El Moai</span>
                    </div>
                    <button 
                        className="close-button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Cerrar chat"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="chat-messages" id="chat-messages">
                    {messages.map((message) => (
                        <div key={message.id} className={`message ${message.type}`}>
                            <div className="message-sender">{message.sender}</div>
                            <div className="message-content">{message.content}</div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="message bot typing">
                            <div className="message-sender">El Moai</div>
                            <div className="message-content">Escribiendo...</div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Escribe tu mensaje..."
                        aria-label="Mensaje"
                    />
                    <button 
                        onClick={handleSendMessage}
                        aria-label="Enviar mensaje"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;
