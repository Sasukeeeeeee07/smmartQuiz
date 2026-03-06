import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const logoImg = '/images/logo.6712b347ef6bfbe8b880.png';

const API = '/api';

export default function Login() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot_password' | 'verify_otp' | 'reset_password'
    const [form, setForm] = useState({ name: '', email: '', password: '', otp: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    // Safe fetch helper — handles empty body & network errors
    const safeFetch = async (url, options) => {
        try {
            const res = await fetch(url, options);
            const text = await res.text();
            const data = text ? JSON.parse(text) : {};
            if (!res.ok) throw new Error(data.error || `Server error (${res.status})`);
            return data;
        } catch (err) {
            if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                throw new Error('Cannot reach server. Make sure the backend is running on port 5001.');
            }
            throw err;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (mode === 'register') {
                const data = await safeFetch(`${API}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
                });
                sessionStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }));
                navigate('/');
            } else if (mode === 'login') {
                const data = await safeFetch(`${API}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: form.email, password: form.password }),
                });
                sessionStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }));
                navigate('/');
            } else if (mode === 'forgot_password') {
                const data = await safeFetch(`${API}/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: form.email }),
                });
                setSuccessMsg(data.message);
                setMode('verify_otp');
            } else if (mode === 'verify_otp') {
                const data = await safeFetch(`${API}/verify-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: form.email, otp: form.otp }),
                });
                setSuccessMsg('OTP Verified! Enter your new password below.');
                setMode('reset_password');
            } else if (mode === 'reset_password') {
                const data = await safeFetch(`${API}/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: form.email, otp: form.otp, newPassword: form.password }),
                });
                setSuccessMsg(data.message);
                setMode('login');
                setForm(prev => ({ ...prev, password: '', otp: '' }));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            overflowY: 'auto', overflowX: 'hidden',
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                .auth-input { width: 100%; padding: 0.75rem 1rem; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; color: #f1f5f9; font-size: 0.9rem; outline: none; transition: border-color 0.2s; font-family: inherit; }
                .auth-input::placeholder { color: #475569; }
                .auth-input:focus { border-color: #6366f1; background: rgba(99,102,241,0.08); }
                .auth-btn { width: 100%; padding: 0.85rem; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 12px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s, transform 0.1s; font-family: inherit; }
                .auth-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
                .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .tab-btn { background: none; border: none; padding: 0.5rem 1.25rem; border-radius: 999px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; }
                .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
            `}</style>

            <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.25rem', position: 'relative' }}>
                {/* Decorative orbs */}
                <div className="orb" style={{ width: '400px', height: '400px', background: 'rgba(99,102,241,0.15)', top: '-100px', left: '-100px', position: 'absolute' }} />
                <div className="orb" style={{ width: '300px', height: '300px', background: 'rgba(139,92,246,0.12)', bottom: '-80px', right: '-80px', position: 'absolute' }} />

                <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <img src={logoImg} alt="smmart Logo" style={{ height: '56px', objectFit: 'contain', marginBottom: '0.75rem' }} />
                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>smmartQuiz</h1>
                        <p style={{ margin: '0.4rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Test your knowledge. Grow your potential.</p>
                    </div>

                    {/* Card */}
                    <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                        {/* Tabs */}
                        {(mode === 'login' || mode === 'register') && (
                            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '4px', marginBottom: '1.75rem' }}>
                                <button className="tab-btn" onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }} style={{ flex: 1, background: mode === 'login' ? 'rgba(99,102,241,0.5)' : 'transparent', color: mode === 'login' ? '#f1f5f9' : '#64748b' }}>Log In</button>
                                <button className="tab-btn" onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }} style={{ flex: 1, background: mode === 'register' ? 'rgba(99,102,241,0.5)' : 'transparent', color: mode === 'register' ? '#f1f5f9' : '#64748b' }}>Sign Up</button>
                            </div>
                        )}

                        {mode === 'forgot_password' && <h3 style={{ color: '#f1f5f9', textAlign: 'center', marginBottom: '1.5rem', marginTop: 0 }}>Reset Password</h3>}
                        {mode === 'verify_otp' && <h3 style={{ color: '#f1f5f9', textAlign: 'center', marginBottom: '1.5rem', marginTop: 0 }}>Verify Code</h3>}
                        {mode === 'reset_password' && <h3 style={{ color: '#f1f5f9', textAlign: 'center', marginBottom: '1.5rem', marginTop: 0 }}>New Password</h3>}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {mode === 'register' && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.4rem' }}>Full Name</label>
                                    <input className="auth-input" type="text" placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} required />
                                </div>
                            )}

                            {(mode === 'login' || mode === 'register' || mode === 'forgot_password') && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.4rem' }}>Email Address</label>
                                    <input className="auth-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                                </div>
                            )}

                            {mode === 'verify_otp' && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.4rem' }}>Verification Code (OTP)</label>
                                    <input className="auth-input" type="text" placeholder="Enter 6-digit code" value={form.otp} onChange={e => set('otp', e.target.value)} required />
                                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Sent to {form.email}</p>
                                </div>
                            )}

                            {(mode === 'login' || mode === 'register' || mode === 'reset_password') && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.4rem' }}>{mode === 'reset_password' ? 'New Password' : 'Password'}</label>
                                    <input className="auth-input" type="password" placeholder={mode === 'register' || mode === 'reset_password' ? 'Create a password' : 'Enter your password'} value={form.password} onChange={e => set('password', e.target.value)} required minLength={mode === 'register' || mode === 'reset_password' ? 6 : 1} />
                                    {(mode === 'register' || mode === 'reset_password') && <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: '#475569' }}>Minimum 6 characters</p>}
                                </div>
                            )}

                            {mode === 'login' && (
                                <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                                    <button type="button" onClick={() => { setMode('forgot_password'); setError(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>Forgot password?</button>
                                </div>
                            )}

                            {error && (
                                <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.65rem 1rem', color: '#f87171', fontSize: '0.85rem' }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            {successMsg && (
                                <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', padding: '0.65rem 1rem', color: '#4ade80', fontSize: '0.85rem' }}>
                                    ✅ {successMsg}
                                </div>
                            )}

                            <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
                                {loading ? '⏳ Please wait...' :
                                    mode === 'register' ? 'Create Account' :
                                        mode === 'forgot_password' ? 'Send Reset Link' :
                                            mode === 'verify_otp' ? 'Verify Code' :
                                                mode === 'reset_password' ? 'Change Password' : 'Log In'}
                            </button>
                        </form>

                        {(mode === 'login' || mode === 'register') ? (
                            <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#475569', fontSize: '0.85rem' }}>
                                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                                <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
                                    {mode === 'login' ? 'Sign up free' : 'Log in'}
                                </button>
                            </p>
                        ) : (
                            <p style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                                <button onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); setForm(prev => ({ ...prev, password: '', otp: '' })); }} style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
                                    Back to Login
                                </button>
                            </p>
                        )}
                    </div>

                </div>
            </div>
        </div>

    );
}
