import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, AlertTriangle, CheckCircle, Bot, User, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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
        addBotMessage('symptom.welcome', 500, true);
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
        addBotMessage('symptom.symptomsAsk', 500, true);
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
            { sender: 'user', text: selectedLabels.join(', ') || t('symptom.noSymptom'), time: new Date(), isKey: false },
        ]);

        const { score, hasWarningSign, hasDangerSign } = calculateTriageScore(selectedSymptoms, feverDuration);
        const triageResult = getTriageResult(score, hasWarningSign, hasDangerSign, language);
        setResult(triageResult);

        // Summary message to the chat — brief so the pinned result card is the main focus
        addBotMessage(
            language === 'en'
                ? `Analysis complete. Your risk score is **${score}**.\n\n${triageResult.title}\n\nYou can ask follow-up questions below.`
                : `Analisis selesai. Skor risiko Anda: **${score}**.\n\n${triageResult.title}\n\nAnda bisa bertanya lebih lanjut di bawah.`,
            500
        );

        setAiContext([
            { role: "user", content: `Fever duration: ${feverDuration} days. Symptoms: ${selectedLabels.join(', ')}` }
        ]);

        setTimeout(() => {
            setStep('result');
        }, 800);
    }

    async function handleSendChat() {
        if (!chatInput.trim() || isTyping) return;

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
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: language === 'en'
                    ? "Sorry, I am having trouble connecting to the backend. Please try again."
                    : "Maaf, saya tidak dapat terhubung ke server saat ini. Silakan coba lagi.",
                time: new Date(), isKey: false
            }]);
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
            addBotMessage('symptom.welcome', 300, true);
            setTimeout(() => setStep('fever'), 800);
        }, 200);
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

            {/* Main layout: result card on left (when available), chat on right */}
            <div className={`sc-layout ${step === 'result' ? 'sc-layout--result' : ''}`}>

                {/* Result Summary Card — sticky left panel shown after analysis */}
                {step === 'result' && result && (
                    <div className="sc-result-panel animate-fadeInUp">
                        <div
                            className="result-card"
                            style={{ borderColor: result.color, boxShadow: `0 0 20px ${result.color}33` }}
                        >
                            <div className="result-header" style={{ color: result.color }}>
                                <AlertTriangle size={22} />
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

                        <button className="btn btn-secondary btn-lg reset-btn" onClick={handleReset} id="reset-checker">
                            <RotateCcw size={16} />
                            {t('symptom.reset')}
                        </button>
                    </div>
                )}

                {/* Chat Panel */}
                <div className="chat-container card-static">
                    {/* Scrollable Messages */}
                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`chat-bubble ${msg.sender === 'bot' ? 'bot-bubble' : 'user-bubble'} animate-fadeInUp`}
                            >
                                <div className="bubble-avatar">
                                    {msg.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className="bubble-content">
                                    {msg.isKey ? (
                                        <div className="bubble-text">{t(msg.text)}</div>
                                    ) : (
                                        <div className="bubble-text">
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                    )}
                                    <div className="bubble-time">
                                        {msg.time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="chat-bubble bot-bubble animate-fadeInUp">
                                <div className="bubble-avatar"><Bot size={16} /></div>
                                <div className="bubble-content">
                                    <div className="typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Interactive Input Area — rendered BELOW the scroll, not inside it */}
                    {step === 'fever' && (
                        <div className="chat-interactive-area animate-fadeInUp">
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
                        <div className="chat-interactive-area animate-fadeInUp">
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
                                            {selectedSymptoms.includes(symptom.id) && <CheckCircle size={14} />}
                                        </div>
                                        <span>{t(symptom.labelKey)}</span>
                                        {symptom.category === 'warning' && <AlertTriangle size={13} className="symptom-warn-icon" />}
                                        {symptom.category === 'danger' && <AlertTriangle size={13} className="symptom-danger-icon" />}
                                    </button>
                                ))}
                            </div>
                            <button
                                className="btn btn-primary btn-lg analyze-btn"
                                onClick={handleAnalyze}
                                disabled={selectedSymptoms.length === 0}
                                id="analyze-symptoms"
                            >
                                <Send size={16} />
                                {t('symptom.checkRisk')} ({selectedSymptoms.length})
                            </button>
                        </div>
                    )}

                    {/* Follow-up Chat Input — sticky at bottom after result */}
                    {step === 'result' && (
                        <div className="chat-followup-input">
                            <input
                                type="text"
                                placeholder={language === 'en' ? 'Ask a follow-up question...' : 'Tanya lebih lanjut...'}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                disabled={isTyping}
                                autoComplete="off"
                            />
                            <button
                                className="send-btn"
                                onClick={handleSendChat}
                                disabled={!chatInput.trim() || isTyping}
                            >
                                <Send size={17} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
