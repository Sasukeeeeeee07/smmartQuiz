import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getQuizContent, saveQuizContent,
    getLessons, saveLessons,
    getAllScores,
    getSettings, saveSettings,
    getLanguages, saveLanguages,
} from '../api';

// ─── Constants ────────────────────────────────────────────────────────────────
const NUM_LESSONS = 9;
const LESSON_NUMS = Array.from({ length: NUM_LESSONS }, (_, i) => i + 1);

const LESSON_NAMES_EN = [
    "Giving Up Control", "Growing Your Ambition", "Multiplying Your Present",
    "Expanding Your Capability", "Multiplying and Expanding Your Teamwork",
    "Know the Ambitions of Your Team", "Ambition Requires Certainty",
    "Growing Your Ambition – 6 Year Architecture", "Growing Ambitions with Journey Partners"
];

const LESSON_NAMES_HI = [
    "नियंत्रण छोड़ना", "अपनी महत्वाकांक्षा को बढ़ाना", "अपने वर्तमान को गुणा करना",
    "अपनी क्षमता का विस्तार करना", "अपनी टीमवर्क को गुणा और विस्तारित करना",
    "अपनी टीम की महत्वाकांक्षाओं को जानें", "महत्वाकांक्षा के लिए निश्चितता आवश्यक है",
    "अपनी महत्वाकांक्षा को बढ़ाना – 6 वर्ष की संरचना", "यात्रा साथियों के साथ महत्वाकांक्षा बढ़ाना"
];

// Common language suggestions for quick-add
const LANG_SUGGESTIONS = [
    { code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' },
    { code: 'mr', name: 'Marathi' }, { code: 'gu', name: 'Gujarati' },
    { code: 'ta', name: 'Tamil' }, { code: 'te', name: 'Telugu' },
    { code: 'bn', name: 'Bengali' }, { code: 'pa', name: 'Punjabi' },
    { code: 'kn', name: 'Kannada' }, { code: 'ml', name: 'Malayalam' },
    { code: 'ur', name: 'Urdu' }, { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' }, { code: 'es', name: 'Spanish' },
    { code: 'ar', name: 'Arabic' },
];

// ─── Styles ──────────────────────────────────────────────────────────────────
const S = {
    page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#e2e8f0' },
    sidebar: { width: '260px', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10, overflowY: 'auto' },
    main: { marginLeft: '260px', minHeight: '100vh', padding: '2rem', overflowX: 'hidden' },
    card: { background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '1.5rem' },
    h1: { fontSize: '1.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    label: { fontSize: '0.813rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.4rem', display: 'block' },
    input: { width: '100%', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#f1f5f9', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#f1f5f9', fontSize: '0.875rem', outline: 'none', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box' },
    btnPrimary: { padding: '0.65rem 1.4rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
    btnSecondary: { padding: '0.65rem 1.4rem', background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem' },
    btnDanger: { padding: '0.4rem 0.8rem', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' },
    btnSuccess: { padding: '0.65rem 1.4rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
    btnGhost: { padding: '0.4rem 0.8rem', background: 'transparent', color: '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' },
    badge: (color) => ({ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: color === 'green' ? 'rgba(16,185,129,0.2)' : color === 'red' ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)', color: color === 'green' ? '#34d399' : color === 'red' ? '#f87171' : '#a5b4fc' }),
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, padding: '1rem 1.5rem', borderRadius: '12px', background: type === 'success' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', fontWeight: 600, boxShadow: '0 10px 40px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>{type === 'success' ? '✅' : '❌'}</span>
            <span>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.1rem', marginLeft: '0.5rem' }}>×</button>
        </div>
    );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        const trimmed = password.trim();
        setLoading(true); setError('');
        try {
            await getAllScores(trimmed);
            onLogin(trimmed);
        } catch (err) {
            setError(err.message?.includes('fetch') ? 'Cannot reach server. Make sure backend is running on port 5001.' : 'Invalid admin password.');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '420px', padding: '0 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
                    <h1 style={{ ...S.h1, fontSize: '2rem', textAlign: 'center', display: 'block', WebkitTextFillColor: 'transparent' }}>Admin Panel</h1>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>SmmartQuiz Management Dashboard</p>
                </div>
                <form onSubmit={handleLogin} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={S.label}>Admin Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter admin password" style={S.input} required />
                    </div>
                    {error && <p style={{ color: '#f87171', margin: 0, fontSize: '0.875rem' }}>⚠️ {error}</p>}
                    <button type="submit" style={{ ...S.btnPrimary, width: '100%', padding: '0.8rem' }} disabled={loading}>
                        {loading ? 'Verifying...' : '🔐 Login to Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, onLogout, onViewQuiz }) {
    const navItems = [
        { id: 'questions', icon: '📝', label: 'Questions' },
        { id: 'languages', icon: '🌐', label: 'Languages' },
        { id: 'scores', icon: '📊', label: 'Score Reports' },
        { id: 'settings', icon: '⚙️', label: 'Settings' },
    ];
    return (
        <div className="admin-sidebar" style={S.sidebar}>
            <div className="admin-header" style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ fontSize: '1.5rem' }}>🧠</div>
                        <div style={S.h1}>SmmartQuiz</div>
                    </div>
                    <div className="admin-sub" style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Admin Dashboard</div>
                </div>
                {/* Mobile logout visible only via CSS toggle or just rendered here for all */}
                <button onClick={onLogout} className="mobile-logout-btn" style={{ ...S.btnGhost, color: '#f87171', padding: '0.5rem', display: 'none' }}>Logout</button>
            </div>
            <nav className="admin-nav" style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {navItems.map(item => (
                    <button key={item.id} className={`tab-btn ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: activeTab === item.id ? 600 : 400, background: activeTab === item.id ? 'rgba(99,102,241,0.2)' : 'transparent', color: activeTab === item.id ? '#a5b4fc' : '#94a3b8', textAlign: 'left', width: '100%', borderLeft: activeTab === item.id ? '3px solid #6366f1' : '3px solid transparent' }}>
                        <span style={{ fontSize: '1.1rem' }}>{item.icon}</span><span className="tab-label">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="admin-actions" style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button onClick={onViewQuiz} className="admin-action-btn" style={{ ...S.btnGhost, width: '100%', textAlign: 'left', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>🎯 <span className="action-label">View Quiz</span></button>
                <button onClick={onLogout} className="admin-action-btn" style={{ ...S.btnGhost, width: '100%', textAlign: 'left', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#f87171' }}>🚪 <span className="action-label">Logout</span></button>
            </div>
        </div>
    );
}

// ─── Import Modal ─────────────────────────────────────────────────────────────
function ImportModal({ onImport, onClose }) {
    const [text, setText] = useState('');
    const [parsed, setParsed] = useState(null);
    const [error, setError] = useState('');

    const parseQuestions = (raw) => {
        const questions = [];
        const blocks = raw.split(/\n(?=\s*(?:Q?\d+[\.\):]|Question\s+\d+))/i).filter(b => b.trim());
        for (const block of blocks) {
            const lines = block.trim().split('\n').filter(l => l.trim());
            if (lines.length < 2) continue;
            const qText = lines[0].replace(/^\s*(?:Q?\d+[\.\):]\s*|Question\s+\d+[\.\):]\s*)/i, '').trim();
            if (!qText) continue;
            const options = []; let correctIndex = 0;
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                const optMatch = line.match(/^([a-dA-D][\.\):])\s*(.*)/);
                if (optMatch) {
                    const isCorrect = line.includes('*') || line.toLowerCase().includes('(correct)');
                    options.push({ text: optMatch[2].replace(/\s*\*|\(correct\)/gi, '').trim(), isCorrect });
                    if (isCorrect) correctIndex = options.length - 1;
                } else if (line.toLowerCase().startsWith('answer:') || line.toLowerCase().startsWith('ans:')) {
                    const ans = line.split(':')[1]?.trim().toLowerCase();
                    correctIndex = ['a', 'b', 'c', 'd'].indexOf(ans);
                }
            }
            if (options.length >= 2) questions.push({ qText, options: options.slice(0, 4), correctIndex });
        }
        return questions;
    };

    const handleParse = () => {
        setError('');
        const q = parseQuestions(text);
        if (q.length === 0) { setError('No questions found. Check the format.'); return; }
        setParsed(q);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflow: 'auto', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 700 }}>📥 Import Questions</h2>
                    <button onClick={onClose} style={{ ...S.btnGhost, fontSize: '1.5rem' }}>×</button>
                </div>
                {!parsed ? (
                    <>
                        <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#a5b4fc' }}>
                            <strong>Format:</strong><br />
                            <code style={{ display: 'block', marginTop: '0.5rem', whiteSpace: 'pre', fontSize: '0.75rem', color: '#cbd5e1' }}>{`1. Question text here
a) Wrong option
b) Correct option *
c) Wrong option
d) Wrong option`}</code>
                            Mark correct with <code>*</code> after the option.
                        </div>
                        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste your questions here..." style={{ ...S.textarea, minHeight: '250px', marginBottom: '1rem' }} />
                        {error && <p style={{ color: '#f87171', margin: '0 0 1rem', fontSize: '0.875rem' }}>⚠️ {error}</p>}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={handleParse} style={S.btnPrimary}>Parse Questions</button>
                            <button onClick={onClose} style={S.btnSecondary}>Cancel</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ ...S.badge('green'), marginBottom: '1.25rem', fontSize: '0.875rem', padding: '0.4rem 0.8rem' }}>✅ Found {parsed.length} question{parsed.length !== 1 ? 's' : ''}</div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                            {parsed.map((q, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1rem' }}>
                                    <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: '#f1f5f9' }}>Q{i + 1}. {q.qText}</p>
                                    {q.options.map((opt, oi) => (
                                        <div key={oi} style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', background: oi === q.correctIndex ? 'rgba(16,185,129,0.15)' : 'transparent', color: oi === q.correctIndex ? '#34d399' : '#94a3b8', fontSize: '0.875rem' }}>
                                            {['A', 'B', 'C', 'D'][oi]}) {opt.text} {oi === q.correctIndex ? '✓' : ''}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => { onImport(parsed); onClose(); }} style={S.btnSuccess}>✅ Import {parsed.length} Questions</button>
                            <button onClick={() => setParsed(null)} style={S.btnSecondary}>← Re-paste</button>
                            <button onClick={onClose} style={S.btnGhost}>Cancel</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Languages Tab ───────────────────────────────────────────────────────────
function LanguagesTab({ password, showToast }) {
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newCode, setNewCode] = useState('');
    const [newName, setNewName] = useState('');

    useEffect(() => {
        getLanguages()
            .then(langs => setLanguages(langs))
            .catch(() => setLanguages([{ code: 'en', name: 'English', active: true }, { code: 'hi', name: 'Hindi', active: true }]))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        if (languages.length === 0) { showToast('Must have at least one language.', 'error'); return; }
        setSaving(true);
        try {
            await saveLanguages(password, languages);
            showToast('Languages saved!', 'success');
        } catch (err) { showToast(err.message, 'error'); }
        finally { setSaving(false); }
    };

    const addLanguage = () => {
        if (!newCode.trim() || !newName.trim()) { showToast('Enter both a language code and name.', 'error'); return; }
        const code = newCode.trim().toLowerCase();
        if (languages.find(l => l.code === code)) { showToast(`Language code "${code}" already exists.`, 'error'); return; }
        setLanguages(prev => [...prev, { code, name: newName.trim(), active: true }]);
        setNewCode(''); setNewName('');
    };

    const addFromSuggestion = (suggestion) => {
        if (languages.find(l => l.code === suggestion.code)) { showToast(`${suggestion.name} is already added.`, 'error'); return; }
        setLanguages(prev => [...prev, { ...suggestion, active: true }]);
    };

    const removeLanguage = (code) => {
        if (languages.length <= 1) { showToast('Must keep at least one language.', 'error'); return; }
        setLanguages(prev => prev.filter(l => l.code !== code));
    };

    const activeCodes = new Set(languages.map(l => l.code));

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ margin: '0 0 0.25rem', color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700 }}>🌐 Languages</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Manage which languages are available in the quiz</p>
                </div>
                <button onClick={handleSave} disabled={saving} style={S.btnPrimary}>{saving ? 'Saving...' : '💾 Save Languages'}</button>
            </div>

            {/* Current Languages */}
            <div style={{ ...S.card, marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1.25rem', color: '#f1f5f9', fontSize: '1rem', fontWeight: 600 }}>Active Languages</h3>
                {loading ? (
                    <p style={{ color: '#64748b' }}>Loading...</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {languages.map(lang => (
                            <div key={lang.code} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.25rem', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
                                    {lang.code.toUpperCase().slice(0, 2)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{lang.name}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Code: <code style={{ color: '#a5b4fc' }}>{lang.code}</code></div>
                                </div>
                                <span style={S.badge('green')}>Active</span>
                                <button onClick={() => removeLanguage(lang.code)} style={S.btnDanger}>🗑️ Remove</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Custom Language */}
            <div style={{ ...S.card, marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1.25rem', color: '#f1f5f9', fontSize: '1rem', fontWeight: 600 }}>➕ Add Custom Language</h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '140px' }}>
                        <label style={S.label}>Language Code (e.g. gu)</label>
                        <input value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="gu" style={S.input} maxLength={5} />
                    </div>
                    <div style={{ flex: '2', minWidth: '200px' }}>
                        <label style={S.label}>Language Name (e.g. Gujarati)</label>
                        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Gujarati" style={S.input} onKeyDown={e => e.key === 'Enter' && addLanguage()} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button onClick={addLanguage} style={S.btnSuccess}>+ Add</button>
                    </div>
                </div>
            </div>

            {/* Quick-Add Suggestions */}
            <div style={S.card}>
                <h3 style={{ margin: '0 0 1rem', color: '#f1f5f9', fontSize: '1rem', fontWeight: 600 }}>⚡ Quick Add</h3>
                <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 1rem' }}>Click to instantly add a language</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {LANG_SUGGESTIONS.filter(s => !activeCodes.has(s.code)).map(s => (
                        <button key={s.code} onClick={() => addFromSuggestion(s)} style={{ padding: '0.4rem 0.9rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '999px', color: '#a5b4fc', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}>
                            + {s.name}
                        </button>
                    ))}
                    {LANG_SUGGESTIONS.every(s => activeCodes.has(s.code)) && (
                        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>All suggested languages are already added.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Questions Tab ────────────────────────────────────────────────────────────
function QuestionsTab({ password, languages, showToast }) {
    const [currentLesson, setCurrentLesson] = useState(1);
    const [currentLang, setCurrentLang] = useState(languages[0]?.code || 'en');
    const [lessonNames, setLessonNames] = useState(LESSON_NUMS.map(n => `Lesson ${n}`));
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showImport, setShowImport] = useState(false);

    useEffect(() => {
        const names = currentLang === 'hi' ? LESSON_NAMES_HI : LESSON_NAMES_EN;
        setLessonNames(names);
    }, [currentLang]);

    // Sync currentLang if languages changes
    useEffect(() => {
        if (languages.length > 0 && !languages.find(l => l.code === currentLang)) {
            setCurrentLang(languages[0].code);
        }
    }, [languages, currentLang]);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const content = await getQuizContent(currentLang);
            const lessonData = content.find(c => c.lessonId === currentLesson);
            setQuestions(lessonData ? [...lessonData.questions] : []);
        } catch { setQuestions([]); }
        finally { setLoading(false); }
    }, [currentLesson, currentLang]);

    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

    const addQuestion = () => setQuestions(prev => [...prev, { text: '', options: ['', '', '', ''], correctIndex: 0 }]);
    const removeQuestion = (idx) => { if (!window.confirm('Delete this question?')) return; setQuestions(prev => prev.filter((_, i) => i !== idx)); };
    const updateQuestion = (idx, field, value) => setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
    const updateOption = (qIdx, optIdx, value) => setQuestions(prev => prev.map((q, i) => { if (i !== qIdx) return q; const opts = [...q.options]; opts[optIdx] = value; return { ...q, options: opts }; }));
    const setCorrect = (qIdx, optIdx) => setQuestions(prev => prev.map((q, i) => i === qIdx ? { ...q, correctIndex: optIdx } : q));

    const handleSave = async () => {
        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].text.trim()) { showToast(`Question ${i + 1} text is empty`, 'error'); return; }
            if (questions[i].options.some(o => !o.trim())) { showToast(`Question ${i + 1} has empty options`, 'error'); return; }
        }
        if (questions.length !== 10 && !window.confirm(`You have ${questions.length} questions (recommended: 10). Save anyway?`)) return;
        setSaving(true);
        try {
            await saveQuizContent(password, currentLang, currentLesson, questions.map(q => ({ text: q.text, options: q.options, correctIndex: q.correctIndex })));
            showToast('Questions saved!', 'success');
        } catch (err) { showToast(err.message, 'error'); }
        finally { setSaving(false); }
    };

    const handleImport = (parsed) => {
        const mapped = parsed.map(p => ({ text: p.qText, options: p.options.map(o => o.text), correctIndex: p.correctIndex }));
        setQuestions(prev => [...prev, ...mapped]);
        showToast(`Imported ${parsed.length} questions!`, 'success');
    };

    return (
        <div>
            {showImport && <ImportModal onImport={handleImport} onClose={() => setShowImport(false)} />}

            <div className="questions-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <h2 style={{ margin: '0 0 0.25rem', color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700 }}>📝 Questions</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>{questions.length} question{questions.length !== 1 ? 's' : ''} in {lessonNames[currentLesson - 1] || `Lesson ${currentLesson}`} · {languages.find(l => l.code === currentLang)?.name}</p>
                </div>
                <div className="questions-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setShowImport(true)} style={S.btnSecondary}>📥 Import</button>
                    <button onClick={addQuestion} style={S.btnSecondary}>+ Add</button>
                    <button onClick={handleSave} disabled={saving} style={S.btnPrimary}>{saving ? 'Saving...' : '💾 Save'}</button>
                </div>
            </div>

            {/* Lesson Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {LESSON_NUMS.map(num => (
                    <button key={num} onClick={() => setCurrentLesson(num)} style={{ minWidth: '110px', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '1px solid', borderColor: currentLesson === num ? '#6366f1' : 'rgba(255,255,255,0.1)', background: currentLesson === num ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)', color: currentLesson === num ? '#a5b4fc' : '#64748b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: currentLesson === num ? 600 : 400, whiteSpace: 'nowrap', flex: 'none' }}>
                        {lessonNames[num - 1] || `Lesson ${num}`}
                    </button>
                ))}
            </div>

            {/* Language Tabs (dynamic from DB) */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {languages.map(lang => (
                    <button key={lang.code} onClick={() => setCurrentLang(lang.code)} style={{ padding: '0.45rem 1rem', borderRadius: '999px', border: '1px solid', borderColor: currentLang === lang.code ? '#a5b4fc' : 'rgba(255,255,255,0.1)', background: currentLang === lang.code ? 'rgba(99,102,241,0.2)' : 'transparent', color: currentLang === lang.code ? '#a5b4fc' : '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}>
                        {lang.name}
                    </button>
                ))}
            </div>

            {/* Questions List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>⏳ Loading questions...</div>
            ) : questions.length === 0 ? (
                <div style={{ ...S.card, textAlign: 'center', padding: '4rem', border: '2px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>No questions yet for this lesson & language.</p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                        <button onClick={addQuestion} style={S.btnPrimary}>+ Add Question</button>
                        <button onClick={() => setShowImport(true)} style={S.btnSecondary}>📥 Import</button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {questions.map((q, qIdx) => (
                        <div key={qIdx} style={S.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>{qIdx + 1}</div>
                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Question {qIdx + 1} of {questions.length}</span>
                                </div>
                                <button onClick={() => removeQuestion(qIdx)} style={S.btnDanger}>🗑️ Delete</button>
                            </div>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={S.label}>Question Text</label>
                                <textarea value={q.text} onChange={e => updateQuestion(qIdx, 'text', e.target.value)} placeholder="Enter question..." style={S.textarea} />
                            </div>

                            <label style={{ ...S.label, marginBottom: '0.75rem' }}>Options <span style={{ color: '#64748b' }}>(click a row to mark it correct)</span></label>
                            <div className="options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {(q.options || ['', '', '', '']).slice(0, 4).map((opt, oIdx) => (
                                    <div key={oIdx} onClick={() => setCorrect(qIdx, oIdx)} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '10px', cursor: 'pointer', border: '2px solid', borderColor: q.correctIndex === oIdx ? '#10b981' : 'rgba(255,255,255,0.1)', background: q.correctIndex === oIdx ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid', borderColor: q.correctIndex === oIdx ? '#10b981' : 'rgba(255,255,255,0.2)', background: q.correctIndex === oIdx ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.7rem', color: 'white', fontWeight: 700 }}>
                                            {q.correctIndex === oIdx ? '✓' : ['A', 'B', 'C', 'D'][oIdx]}
                                        </div>
                                        <input value={opt} onClick={e => e.stopPropagation()} onChange={e => updateOption(qIdx, oIdx, e.target.value)} placeholder={`Option ${['A', 'B', 'C', 'D'][oIdx]}`} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: q.correctIndex === oIdx ? '#34d399' : '#e2e8f0', fontSize: '0.875rem' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button onClick={addQuestion} style={{ width: '100%', padding: '1rem', border: '2px dashed rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.05)', color: '#6366f1', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                        + Add Another Question
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Scores Tab ───────────────────────────────────────────────────────────────
function ScoresTab({ password, showToast }) {
    const [scores, setScores] = useState([]);
    const [lessonNames, setLessonNames] = useState(LESSON_NAMES_EN);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ lesson: '', email: '' });

    const fetchScores = useCallback(async () => {
        setLoading(true);
        try {
            const sData = await getAllScores(password);
            setScores(sData);
            setLessonNames(LESSON_NAMES_EN); // Default for reports
        }
        catch (err) { showToast(err.message, 'error'); }
        finally { setLoading(false); }
    }, [password, showToast]);

    useEffect(() => { fetchScores(); }, [fetchScores]);

    const filtered = scores.filter(s => {
        if (filter.lesson && s.lessonId !== Number(filter.lesson)) return false;
        if (filter.email && !s.email.toLowerCase().includes(filter.email.toLowerCase())) return false;
        return true;
    });

    const totalUnique = new Set(scores.map(s => s.email)).size;
    const avgScore = scores.length > 0 ? (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1) : 0;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ margin: '0 0 0.25rem', color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700 }}>📊 Score Reports</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>{scores.length} total attempts</p>
                </div>
                <button onClick={fetchScores} style={S.btnSecondary}>🔄 Refresh</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[{ label: 'Total Attempts', value: scores.length, icon: '🎯' }, { label: 'Unique Users', value: totalUnique, icon: '👥' }, { label: 'Average Score', value: avgScore, icon: '📈' }].map((stat, i) => (
                    <div key={i} style={{ ...S.card, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a5b4fc' }}>{stat.value}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>{stat.label}</div>
                    </div>
                ))}
            </div>
            <div style={{ ...S.card, display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={S.label}>Filter by Lesson</label>
                    <select value={filter.lesson} onChange={e => setFilter(f => ({ ...f, lesson: e.target.value }))} style={{ ...S.input }}>
                        <option value="">All Lessons</option>
                        {LESSON_NUMS.map(n => <option key={n} value={n}>{lessonNames[n - 1] || `Lesson ${n}`}</option>)}
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={S.label}>Filter by Email</label>
                    <input value={filter.email} onChange={e => setFilter(f => ({ ...f, email: e.target.value }))} placeholder="Search email..." style={S.input} />
                </div>
                {(filter.lesson || filter.email) && <div style={{ display: 'flex', alignItems: 'flex-end' }}><button onClick={() => setFilter({ lesson: '', email: '' })} style={S.btnGhost}>Clear</button></div>}
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading scores...</div> : (
                <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    {['Name', 'Email', 'Lesson', 'Language', 'Score', 'Date'].map(h => (
                                        <th key={h} style={{ padding: '0.9rem 1.25rem', textAlign: 'left', fontWeight: 600, color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No results</td></tr> : filtered.map((s, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '0.8rem 1.25rem', color: '#f1f5f9', fontWeight: 500 }}>{s.name}</td>
                                        <td style={{ padding: '0.8rem 1.25rem', color: '#94a3b8' }}>{s.email}</td>
                                        <td style={{ padding: '0.8rem 1.25rem', color: '#a5b4fc' }}>{lessonNames[s.lessonId - 1] || `Lesson ${s.lessonId}`}</td>
                                        <td style={{ padding: '0.8rem 1.25rem' }}><span style={S.badge('purple')}>{s.language?.toUpperCase()}</span></td>
                                        <td style={{ padding: '0.8rem 1.25rem' }}><span style={S.badge(s.score >= 7 ? 'green' : 'red')}>{s.score}/{s.totalQuestions || 10}</span></td>
                                        <td style={{ padding: '0.8rem 1.25rem', color: '#64748b', fontSize: '0.8rem' }}>{new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length > 0 && <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '0.8rem' }}>Showing {filtered.length} of {scores.length} records</div>}
                </div>
            )}
        </div>
    );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ password, showToast }) {
    const [form, setForm] = useState({ eventName: '', pointsPerQuestion: 10, passingScore: 8, newAdminPassword: '' });
    const [saving, setSaving] = useState(false);
    useEffect(() => { getSettings().then(s => setForm(prev => ({ ...prev, eventName: s.eventName || '', pointsPerQuestion: s.pointsPerQuestion || 10, passingScore: s.passingScore || 8 }))).catch(() => { }); }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = { eventName: form.eventName, pointsPerQuestion: Number(form.pointsPerQuestion), passingScore: Number(form.passingScore) };
            const isPasswordChanging = !!form.newAdminPassword && form.newAdminPassword.trim().length > 0;
            if (isPasswordChanging) payload.newAdminPassword = form.newAdminPassword.trim();

            await saveSettings(password, payload);

            if (isPasswordChanging) {
                showToast('Password changed! Please login again.', 'success');
                setTimeout(() => {
                    sessionStorage.removeItem('adminPass');
                    window.location.reload();
                }, 2000);
            } else {
                showToast('Settings saved!', 'success');
            }
            setForm(prev => ({ ...prev, newAdminPassword: '' }));
        } catch (err) { showToast(err.message, 'error'); }
        finally { setSaving(false); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: '0 0 0.25rem', color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700 }}>⚙️ Settings</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Global quiz configuration</p>
                </div>
                <button onClick={handleSave} disabled={saving} style={S.btnPrimary}>{saving ? 'Saving...' : '💾 Save Settings'}</button>
            </div>
            <div style={{ ...S.card, maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[{ key: 'eventName', label: 'Event Name', type: 'text', placeholder: 'Smmart - Incharge vs Incontrol' }, { key: 'pointsPerQuestion', label: 'Points Per Question', type: 'number', placeholder: '10' }, { key: 'passingScore', label: 'Passing Score (out of 10)', type: 'number', placeholder: '8' }, { key: 'newAdminPassword', label: 'Change Admin Password', type: 'password', placeholder: 'Leave blank to keep current' }].map(f => (
                    <div key={f.key}>
                        <label style={S.label}>{f.label}</label>
                        <input type={f.type} value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} style={S.input} />
                    </div>
                ))}
                <div style={{ padding: '1rem', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', fontSize: '0.8rem', color: '#fbbf24' }}>
                    ⚠️ Changing the admin password will require you to re-login.
                </div>
            </div>
        </div>
    );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
const AdminPanel = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState(() => sessionStorage.getItem('adminPass') || '');
    const [activeTab, setActiveTab] = useState('questions');
    const [languages, setLanguages] = useState([]);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'success') => setToast({ message, type, id: Date.now() }), []);

    useEffect(() => {
        if (password) {
            // Verify password actually works by attempting a protected fetch
            getAllScores(password).catch(() => {
                sessionStorage.removeItem('adminPass');
                setPassword('');
            });
            getLanguages().then(langs => setLanguages(langs)).catch(() => {
                setLanguages([{ code: 'en', name: 'English', active: true }, { code: 'hi', name: 'Hindi', active: true }]);
            });
        }
    }, [password]);

    const handleLogin = (pass) => { sessionStorage.setItem('adminPass', pass); setPassword(pass); };
    const handleLogout = () => { sessionStorage.removeItem('adminPass'); setPassword(''); };

    if (!password) return <LoginScreen onLogin={handleLogin} />;

    const tabProps = { password, languages, showToast };

    return (
        <div style={S.page}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                input::placeholder, textarea::placeholder { color: #475569; }
                select option { background: #1e1b4b; color: #f1f5f9; }
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 999px; }

                /* Mobile overrides */
                @media (max-width: 768px) {
                    .admin-sidebar {
                        position: sticky !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        bottom: auto !important;
                        border-right: none !important;
                        border-bottom: 1px solid rgba(255,255,255,0.12) !important;
                        backdrop-filter: blur(30px) !important;
                        background: rgba(15, 23, 42, 0.8) !important;
                        z-index: 1000 !important;
                    }
                    .admin-header {
                        padding: 0.8rem 1rem !important;
                        border-bottom: none !important;
                    }
                    .admin-sub { display: none !important; }
                    .admin-nav {
                        flex-direction: row !important;
                        overflow-x: auto !important;
                        padding: 0.25rem 0.75rem 0.75rem !important;
                        gap: 0.4rem !important;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                        -webkit-overflow-scrolling: touch;
                    }
                    .admin-nav::-webkit-scrollbar { display: none; }
                    .tab-btn {
                        width: auto !important;
                        white-space: nowrap !important;
                        border-left: none !important;
                        border-bottom: none !important;
                        border-radius: 12px !important;
                        padding: 0.6rem 0.9rem !important;
                        flex-shrink: 0 !important;
                        font-size: 0.75rem !important;
                        background: rgba(255,255,255,0.05) !important;
                        color: #94a3b8 !important;
                        transition: all 0.2s ease !important;
                    }
                    .tab-btn.active {
                        background: rgba(99,102,241,0.25) !important;
                        color: #e0e7ff !important;
                        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
                        border: 1px solid rgba(99, 102, 241, 0.3) !important;
                    }
                    .admin-actions {
                        display: none !important;
                    }
                    .admin-main {
                        margin-left: 0 !important;
                        padding: 1rem !important;
                        padding-top: 1.5rem !important;
                    }
                    .tab-label {
                        display: inline-block !important; /* Keep text labels */
                    }
                    .mobile-logout-btn {
                        display: block !important;
                        background: rgba(239, 68, 68, 0.1) !important;
                        border: 1px solid rgba(239, 68, 68, 0.2) !important;
                        border-radius: 8px !important;
                        padding: 0.4rem 0.75rem !important;
                        font-size: 0.75rem !important;
                        font-weight: 600 !important;
                    }

                    /* Content adjustments for mobile */
                    .admin-card-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .questions-header {
                        flex-direction: column !important;
                        align-items: stretch !important;
                    }
                    .questions-actions {
                        width: 100%;
                        display: grid !important;
                        grid-template-columns: 1fr 1fr;
                        gap: 0.5rem;
                    }
                    .questions-actions button:last-child {
                        grid-column: span 2;
                    }
                    .options-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>

            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} onViewQuiz={() => navigate('/')} />

            <main className="admin-main" style={S.main}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    {activeTab === 'questions' && <QuestionsTab {...tabProps} />}
                    {activeTab === 'languages' && <LanguagesTab {...tabProps} />}
                    {activeTab === 'scores' && <ScoresTab {...tabProps} />}
                    {activeTab === 'settings' && <SettingsTab {...tabProps} />}
                </div>
            </main>

            {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default AdminPanel;
