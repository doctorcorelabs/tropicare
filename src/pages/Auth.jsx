import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Auth.css';

export default function Auth() {
    const { signIn, signUp } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleAuth(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn({ email, password });
                if (error) throw error;
                navigate('/');
            } else {
                const { error } = await signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (error) throw error;

                // Usually email confirmation is needed, but we can just alert them for simple dev
                alert(language === 'en' ? 'Registration successful! You can now log in.' : 'Registrasi berhasil! Silakan masuk.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card card-static animate-fadeInUp">
                <div className="auth-header">
                    <div className="auth-icon-wrap" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}>
                        <ShieldCheck size={32} color="white" />
                    </div>
                    <h2>{isLogin ? (language === 'en' ? 'Welcome Back' : 'Selamat Datang Kembali') : (language === 'en' ? 'Create Account' : 'Buat Akun')}</h2>
                    <p>{isLogin ? (language === 'en' ? 'Sign in to sync your health records' : 'Masuk untuk sinkronisasi riwayat kesehatan Anda') : (language === 'en' ? 'Register to safely backup your data' : 'Daftar untuk membackup data Anda dengan aman')}</p>
                </div>

                {error && (
                    <div className="auth-error animate-fadeIn">
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleAuth}>
                    {!isLogin && (
                        <div className="form-field">
                            <label className="input-label">{language === 'en' ? 'Full Name' : 'Nama Lengkap'}</label>
                            <div className="input-with-icon">
                                <UserIcon size={18} className="input-icon" />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-field">
                        <label className="input-label">Email</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                className="input"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label className="input-label">Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={loading}>
                        {loading
                            ? (language === 'en' ? 'Loading...' : 'Memuat...')
                            : (isLogin ? (language === 'en' ? 'Sign In' : 'Masuk') : (language === 'en' ? 'Create Account' : 'Daftar'))}
                    </button>
                </form>

                <div className="auth-footer">
                    <button className="btn btn-ghost" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin
                            ? (language === 'en' ? "Don't have an account? Sign Up" : "Belum punya akun? Daftar")
                            : (language === 'en' ? "Already have an account? Sign In" : "Sudah punya akun? Masuk")}
                    </button>
                </div>
            </div>
        </div>
    );
}
