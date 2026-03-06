import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, ShieldAlert, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './TropicareAI.css';
import { useLanguage } from '../context/LanguageContext';
import { sendMessageToAI } from '../services/aiService';

export default function TropicareAI() {
    const { t, language } = useLanguage();

    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, role: 'assistant', text: t('tropicareAi.welcome') }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const addBotMessage = useCallback((text) => {
        setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', text }]);
    }, []);

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || isTyping) return;

        const userText = chatInput.trim();
        setChatInput('');
        setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userText }]);
        setIsTyping(true);

        try {
            // Prepare messages for AI (omitting ids for the payload)
            // Send the entire conversation history context
            const apiMessages = [...messages, { role: 'user', text: userText }].map(msg => ({
                role: msg.role,
                content: msg.text
            }));

            // We pass 'general' for chatType
            const aiReply = await sendMessageToAI(apiMessages, language, 0, 'general');
            addBotMessage(aiReply);
        } catch (error) {
            console.error(error);
            addBotMessage("Maaf, terjadi kesalahan saat menghubungi layanan AI kami. Silakan coba lagi.");
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="tropicare-ai-page">
            <div className="page-header">
                <div className="page-header-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                    <Bot size={28} color="white" />
                </div>
                <div>
                    <h1 className="page-title">{t('tropicareAi.title')}</h1>
                    <p className="page-subtitle">{t('tropicareAi.subtitle')}</p>
                </div>
            </div>

            <div className="ai-chat-container card-static">
                <div className="ai-disclaimer">
                    <ShieldAlert size={16} />
                    <span>{t('tropicareAi.subtitle')}</span>
                </div>

                <div className="chat-messages-area">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`chat-bubble-wrapper ${msg.role}`}>
                            {msg.role === 'assistant' && (
                                <div className="bot-avatar">
                                    <Sparkles size={16} color="white" />
                                </div>
                            )}
                            <div className="chat-bubble">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="chat-bubble-wrapper assistant typing-bubble">
                            <div className="bot-avatar"><Sparkles size={16} color="white" /></div>
                            <div className="chat-bubble typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-area" onSubmit={handleSendChat}>
                    <input
                        type="text"
                        placeholder={t('tropicareAi.inputPlaceholder')}
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        disabled={isTyping}
                    />
                    <button type="submit" className="btn-send" disabled={isTyping || !chatInput.trim()}>
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
