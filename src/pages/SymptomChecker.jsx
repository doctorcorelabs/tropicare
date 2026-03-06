import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, AlertTriangle, CheckCircle, Bot, User, RotateCcw } from 'lucide-react';
import { SYMPTOMS, FEVER_DURATION_OPTIONS, calculateTriageScore, getTriageResult } from '../utils/dengueTriage';
import { useLanguage } from '../context/LanguageContext';
import { sendMessageToAI } from '../services/aiService';
import './SymptomChecker.css';

export default function SymptomChecker() {
    const { t, language } = useLanguage();
    const [step, setStep] = useState('welcome'); // welcome, fever, symptoms, result
    const [messages, setMessages] = useState([]);
    const [feverDuration, setFeverDuration] = useState('');
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [result, setResult] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [aiContext, setAiContext] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, step]);

    const addBotMessage = useCallback((text, delay = 300, isKey = false) => {
        setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'bot', text, time: new Date(), isKey }]);
        }, delay);
    }, []);

    useEffect(() => {
        // Initial greeting
        addBotMessage(
            'symptom.welcome',
            500,
            true
        );
        setTimeout(() => {
            setStep('fever');
        }, 1200);
    }, [addBotMessage]);

    function handleFeverSelect(duration) {
        setFeverDuration(duration.value);
        setMessages(prev => [
            ...prev,
            { sender: 'user', text: duration.labelKey, time: new Date(), isKey: true },
        ]);

        addBotMessage(
            'symptom.symptomsAsk',
            500,
            true
        );

        setTimeout(() => {
            setStep('symptoms');
        }, 800);
    }

    function toggleSymptom(id) {
        setSelectedSymptoms(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    }

    function handleAnalyze() {
        const selectedLabels = selectedSymptoms
            .map(id => SYMPTOMS.find(s => s.id === id)?.labelKey)
            .filter(Boolean)
            .map(key => t(key));

        setMessages(prev => [
            ...prev,
            { sender: 'user', text: selectedLabels.join(', '), time: new Date(), isKey: false },
        ]);

        const { score, hasWarningSign, hasDangerSign } = calculateTriageScore(selectedSymptoms, feverDuration);
        const triageResult = getTriageResult(score, hasWarningSign, hasDangerSign, language);
        setResult(triageResult);

        addBotMessage(
            `📊 **${language === 'en' ? 'Analysis Result' : 'Hasil Analisis'}**\n\n${language === 'en' ? 'Risk Score' : 'Skor Risiko'}: **${score}**\n\n${triageResult.title}\n\n${triageResult.description}`,
            500
        );

        setAiContext([
            { role: "user", content: `Fever duration: ${feverDuration} days. Symptoms: ${selectedLabels.join(', ')}` }
        ]);

        setTimeout(() => {
            setStep('result');
            addBotMessage(
                language === 'en'
                    ? "Do you have any other questions about Dengue or your symptoms? You can ask me here."
                    : "Apakah ada hal lain yang ingin Anda tanyakan terkait DBD atau gejala Anda? Silakan tanya di sini.",
                1500,
                false
            );
        }, 800);
    }

    async function handleSendChat() {
        if (!chatInput.trim()) return;

        const userText = chatInput;
        setChatInput('');
        setMessages(prev => [...prev, { sender: 'user', text: userText, time: new Date(), isKey: false }]);

        const updatedContext = [...aiContext, { role: "user", content: userText }];
        setAiContext(updatedContext);
        setIsTyping(true);

        try {
            const riskScoreStr = result?.level || 'Unknown';
            const aiReply = await sendMessageToAI(updatedContext, language, riskScoreStr);

            setMessages(prev => [...prev, { sender: 'bot', text: aiReply, time: new Date(), isKey: false }]);
            setAiContext(prev => [...prev, { role: "assistant", content: aiReply }]);
        } catch (error) {
            console.error("Chat Integration Error:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: language === 'en' ? "Sorry, I am having trouble connecting to the backend. Please try again." : "Maaf, saya tidak dapat terhubung ke server saat ini. Silakan coba lagi.", time: new Date(), isKey: false }]);
        } finally {
            setIsTyping(false);
        }
    }

    function handleReset() {
        setStep('welcome');
        setMessages([]);
        setFeverDuration('');
        setSelectedSymptoms([]);
        setResult(null);
        setAiContext([]);
        setChatInput('');

        setTimeout(() => {
            addBotMessage(
                'symptom.welcome',
                300,
                true
            );
            setTimeout(() => setStep('fever'), 800);
        }, 200);
    }

    function renderMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>');
    }

    return (
        <div className="symptom-checker">
            {/* Header */}
            <div className="page-header">
                <div className="page-header-icon" style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
                    <MessageCircle size={28} color="white" />
                </div>
                <div>
                    <h1 className="page-title">{t('nav.symptom')}</h1>
                    <p className="page-subtitle">{t('symptom.title')}</p>
                </div>
            </div>

            {/* Chat Container */}
            <div className="chat-container card-static">
                {/* Messages */}
                <div className="chat-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`chat-bubble ${msg.sender === 'bot' ? 'bot-bubble' : 'user-bubble'} animate-fadeInUp`}>
                            <div className="bubble-avatar">
                                {msg.sender === 'bot' ? <Bot size={18} /> : <User size={18} />}
                            </div>
                            <div className="bubble-content">
                                <div
                                    className="bubble-text"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.isKey ? t(msg.text) : msg.text) }}
                                />
                                <div className="bubble-time">
                                    {msg.time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="chat-bubble bot-bubble animate-fadeInUp">
                            <div className="bubble-avatar">
                                <Bot size={18} />
                            </div>
                            <div className="bubble-content">
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Interactive Input Areas */}
                    {step === 'fever' && (
                        <div className="chat-input-area animate-fadeInUp">
                            <p className="input-area-label">{t('symptom.duration')}</p>
                            <div className="fever-options">
                                {FEVER_DURATION_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        className={`fever-option-btn ${opt.value === '4-5' ? 'fever-critical' : ''}`}
                                        onClick={() => handleFeverSelect(opt)}
                                        id={`fever-${opt.value}`}
                                    >
                                        {t(opt.labelKey)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'symptoms' && (
                        <div className="chat-input-area animate-fadeInUp">
                            <p className="input-area-label">{t('symptom.symptomsAsk')}</p>
                            <div className="symptoms-grid">
                                {SYMPTOMS.map((symptom) => (
                                    <button
                                        key={symptom.id}
                                        className={`symptom-btn ${selectedSymptoms.includes(symptom.id) ? 'symptom-selected' : ''} ${symptom.category === 'warning' ? 'symptom-warning' : ''} ${symptom.category === 'danger' ? 'symptom-danger' : ''}`}
                                        onClick={() => toggleSymptom(symptom.id)}
                                        id={`symptom-${symptom.id}`}
                                    >
                                        <div className="symptom-check">
                                            {selectedSymptoms.includes(symptom.id) && <CheckCircle size={16} />}
                                        </div>
                                        <span>{t(symptom.labelKey)}</span>
                                        {symptom.category === 'warning' && <AlertTriangle size={14} className="symptom-warn-icon" />}
                                        {symptom.category === 'danger' && <AlertTriangle size={14} className="symptom-danger-icon" />}
                                    </button>
                                ))}
                            </div>
                            <button
                                className="btn btn-primary btn-lg analyze-btn"
                                onClick={handleAnalyze}
                                disabled={selectedSymptoms.length === 0}
                                id="analyze-symptoms"
                            >
                                <Send size={18} />
                                {t('symptom.checkRisk')} ({selectedSymptoms.length})
                            </button>
                        </div>
                    )}

                    {step === 'result' && result && (
                        <div className="result-area animate-fadeInUp">
                            <div
                                className="result-card"
                                style={{ borderColor: result.color, boxShadow: `0 0 20px ${result.color}33` }}
                            >
                                <div className="result-header" style={{ color: result.color }}>
                                    <AlertTriangle size={24} />
                                    <span className="result-level">{result.level}</span>
                                </div>
                                <h3 className="result-title">{result.title}</h3>
                                <p className="result-desc">{result.description}</p>

                                <div className="result-actions">
                                    <h4>{language === 'en' ? 'Suggested Actions:' : 'Langkah yang Disarankan:'}</h4>
                                    <ul>
                                        {result.actions.map((action, i) => (
                                            <li key={i}>{action}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="ai-chat-input-area">
                                <input
                                    type="text"
                                    className="input ai-chat-input"
                                    placeholder={language === 'en' ? 'Type your message...' : 'Ketik pertanyaan Anda...'}
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                    disabled={isTyping}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSendChat}
                                    disabled={!chatInput.trim() || isTyping}
                                >
                                    <Send size={18} />
                                </button>
                            </div>

                            <button className="btn btn-secondary btn-lg reset-btn" onClick={handleReset} id="reset-checker" style={{ marginTop: '1rem' }}>
                                <RotateCcw size={18} />
                                {t('symptom.reset')}
                            </button>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    );
}
