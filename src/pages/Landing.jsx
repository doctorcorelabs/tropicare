import React from 'react';
import { Link } from 'react-router-dom';
import {
    MessageCircle, Thermometer, Droplets, Map,
    FlaskConical, Building2, Shield, Activity,
    ArrowRight, Zap, Users, TrendingUp
} from 'lucide-react';
import './Landing.css';

import { useLanguage } from '../context/LanguageContext';

const getFeatures = (t) => [
    {
        icon: MessageCircle,
        title: t('landing.f1_title'),
        description: t('landing.f1_desc'),
        path: '/symptom-checker',
        color: 'var(--color-primary)',
        gradient: 'linear-gradient(135deg, #0d9488, #0f766e)',
    },
    {
        icon: Thermometer,
        title: t('landing.f2_title'),
        description: t('landing.f2_desc'),
        path: '/fever-tracker',
        color: 'var(--color-coral)',
        gradient: 'linear-gradient(135deg, #f97066, #dc2626)',
    },
    {
        icon: Droplets,
        title: t('landing.f3_title'),
        description: t('landing.f3_desc'),
        path: '/hydration',
        color: 'var(--color-sky)',
        gradient: 'linear-gradient(135deg, #38bdf8, #0284c7)',
    },
    {
        icon: Map,
        title: t('landing.f4_title'),
        description: t('landing.f4_desc'),
        path: '/dengue-map',
        color: 'var(--color-amber)',
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    },
    {
        icon: FlaskConical,
        title: t('landing.f5_title'),
        description: t('landing.f5_desc'),
        path: '/lab-interpreter',
        color: '#a78bfa',
        gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    },
    {
        icon: Building2,
        title: t('landing.f6_title'),
        description: t('landing.f6_desc'),
        path: '/directory',
        color: '#f472b6',
        gradient: 'linear-gradient(135deg, #f472b6, #db2777)',
    },
];

const getStats = (t) => [
    { value: '89.234+', label: t('landing.stats.cases'), icon: Activity },
    { value: '34', label: t('landing.stats.provinces'), icon: Map },
    { value: '0.58%', label: t('landing.stats.cfr'), icon: TrendingUp },
    { value: '24/7', label: t('landing.stats.monitoring'), icon: Shield },
];

export default function Landing() {
    const { t, language } = useLanguage();
    return (
        <div className="landing">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg-decoration">
                    <div className="hero-circle hero-circle-1" />
                    <div className="hero-circle hero-circle-2" />
                    <div className="hero-circle hero-circle-3" />
                </div>

                <div className="hero-content animate-fadeInUp">
                    <div className="hero-badge">
                        <Zap size={14} />
                        <span>{t('landing.subtitle')}</span>
                    </div>

                    <h1 className="hero-title">
                        {language === 'en' ? 'Early Detection.' : 'Deteksi Dini.'}<br />
                        <span className="gradient-text">{language === 'en' ? 'Saves Lives.' : 'Selamatkan Nyawa.'}</span>
                    </h1>

                    <p className="hero-description">
                        {t('landing.heroDesc')}
                    </p>

                    <div className="hero-actions">
                        <Link to="/symptom-checker" className="btn btn-primary btn-lg" id="hero-cta-primary">
                            <MessageCircle size={20} />
                            {t('landing.heroCta')}
                        </Link>
                        <Link to="/dengue-map" className="btn btn-secondary btn-lg" id="hero-cta-secondary">
                            <Map size={20} />
                            {t('landing.heroSecondary')}
                        </Link>
                    </div>
                </div>

                <div className="hero-visual animate-fadeInUp stagger-2">
                    <div className="hero-card-stack">
                        <div className="hero-floating-card card-1 animate-float">
                            <Thermometer size={24} style={{ color: 'var(--color-coral)' }} />
                            <div>
                                <div className="floating-label">{language === 'en' ? 'Body Temp' : 'Suhu Tubuh'}</div>
                                <div className="floating-value" style={{ color: 'var(--color-coral)' }}>39.2°C</div>
                            </div>
                        </div>
                        <div className="hero-floating-card card-2 animate-float" style={{ animationDelay: '0.5s' }}>
                            <Activity size={24} style={{ color: 'var(--color-warning)' }} />
                            <div>
                                <div className="floating-label">{language === 'en' ? 'Fever Phase' : 'Fase Demam'}</div>
                                <div className="floating-value" style={{ color: 'var(--color-warning)' }}>{language === 'en' ? 'Day 4' : 'Hari ke-4'}</div>
                            </div>
                        </div>
                        <div className="hero-floating-card card-3 animate-float" style={{ animationDelay: '1s' }}>
                            <Droplets size={24} style={{ color: 'var(--color-sky)' }} />
                            <div>
                                <div className="floating-label">{t('nav.hydration')}</div>
                                <div className="floating-value" style={{ color: 'var(--color-sky)' }}>72%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-grid">
                    {getStats(t).map((stat, i) => (
                        <div key={i} className={`stat-card glass animate-fadeInUp stagger-${i + 1}`}>
                            <stat.icon size={24} className="stat-icon" />
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header animate-fadeInUp">
                    <h2 className="section-title">
                        {language === 'en' ? '' : 'Fitur '}
                        <span className="gradient-text">{t('landing.featuresHighlight')}</span>
                        {language === 'en' ? ' Features' : ''}
                    </h2>
                    <p className="section-subtitle">
                        {t('landing.featuresDesc')}
                    </p>
                </div>

                <div className="features-grid">
                    {getFeatures(t).map((feature, i) => (
                        <Link
                            key={feature.path}
                            to={feature.path}
                            className={`feature-card animate-fadeInUp stagger-${i + 1}`}
                            id={`feature-${feature.path.replace('/', '')}`}
                        >
                            <div className="feature-icon-wrapper" style={{ background: feature.gradient }}>
                                <feature.icon size={24} color="white" />
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                            <div className="feature-cta">
                                <span>{t('landing.openFeature')}</span>
                                <ArrowRight size={16} />
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-card glass animate-fadeInUp">
                    <div className="cta-content">
                        <Shield size={48} className="cta-icon" />
                        <h2 className="cta-title">
                            {t('landing.heroTag')}
                        </h2>
                        <p className="cta-description">
                            {t('common.developedBy')}
                        </p>
                        <Link to="/symptom-checker" className="btn btn-primary btn-lg">
                            <MessageCircle size={20} />
                            {t('landing.heroCta')}
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="landing-footer">
                <p>© 2026 TropiCare — {language === 'en' ? 'Dengue Management Platform' : 'Platform Manajemen DBD'}</p>
                <p className="footer-disclaimer">
                    ⚠️ Disclaimer: {language === 'en' ? 'TropiCare is not a substitute for professional medical advice.' : 'TropiCare bukan pengganti diagnosis medis profesional.'}
                </p>
            </footer>
        </div>
    );
}
