import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    Activity, MessageCircle, Thermometer, Droplets,
    Map, FlaskConical, Building2, Menu, X, Heart,
    Home, Shield, LogIn, LogOut, User
} from 'lucide-react';
import './Layout.css';

import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { path: '/', labelKey: 'nav.home', icon: Home },
    { path: '/symptom-checker', labelKey: 'nav.symptom', icon: MessageCircle },
    { path: '/fever-tracker', labelKey: 'nav.fever', icon: Thermometer },
    { path: '/hydration', labelKey: 'nav.hydration', icon: Droplets },
    { path: '/dengue-map', labelKey: 'nav.map', icon: Map },
    { path: '/lab-interpreter', labelKey: 'nav.lab', icon: FlaskConical },
    { path: '/directory', labelKey: 'nav.directory', icon: Building2 },
];

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { language, changeLanguage, t } = useLanguage();
    const { user, signOut } = useAuth();

    return (
        <div className="layout">
            {/* Mobile Header */}
            <header className="mobile-header glass">
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle menu"
                    id="menu-toggle"
                >
                    {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
                <div className="mobile-logo">
                    <Shield size={22} className="logo-icon" />
                    <span className="logo-text gradient-text">TropiCare</span>
                </div>
                <button
                    className="lang-toggle-btn mobile-lang"
                    onClick={() => changeLanguage(language === 'id' ? 'en' : 'id')}
                >
                    {language.toUpperCase()}
                </button>
            </header>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar glass ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-container">
                        <div className="logo-badge animate-glow">
                            <Shield size={28} />
                        </div>
                        <div>
                            <h1 className="logo-title gradient-text">TropiCare</h1>
                            <p className="logo-subtitle">Dengue Management</p>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'nav-item-active' : ''}`
                            }
                            onClick={() => setSidebarOpen(false)}
                            id={`nav-${item.path.replace('/', '') || 'home'}`}
                        >
                            <item.icon size={20} />
                            <span>{t(item.labelKey)}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        className="lang-toggle-btn bottom-lang"
                        onClick={() => changeLanguage(language === 'id' ? 'en' : 'id')}
                    >
                        <span className={`lang-opt ${language === 'id' ? 'active' : ''}`}>ID</span>
                        <span className="lang-sep">|</span>
                        <span className={`lang-opt ${language === 'en' ? 'active' : ''}`}>EN</span>
                    </button>

                    <div className="auth-footer-controls" style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4) 0', borderTop: '1px solid var(--color-border)' }}>
                        {user ? (
                            <div className="user-profile-widget">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                    <div style={{ background: 'var(--color-primary-light)', padding: '4px', borderRadius: '50%', color: 'white' }}>
                                        <User size={16} />
                                    </div>
                                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }} title={user.email}>
                                        {user.user_metadata?.full_name?.split(' ')[0] || user.email.split('@')[0]}
                                    </span>
                                </div>
                                <button
                                    onClick={() => { signOut(); setSidebarOpen(false); }}
                                    className="btn btn-ghost"
                                    style={{ width: '100%', justifyContent: 'flex-start', padding: 'var(--space-2) var(--space-3)' }}
                                >
                                    <LogOut size={16} />
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>{t('common.logout')}</span>
                                </button>
                            </div>
                        ) : (
                            <NavLink
                                to="/auth"
                                className="btn btn-primary"
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <LogIn size={16} />
                                {t('common.login')}
                            </NavLink>
                        )}
                    </div>

                    <div className="sidebar-footer-card">
                        <Heart size={16} className="footer-heart" />
                        <p className="footer-text">
                            {t('common.developedBy')}
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="page-enter" key={location.pathname}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
