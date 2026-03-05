import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllData, saveData } from '../api';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('questions'); // 'questions', 'rules', 'settings', 'uitext'
    const [uploading, setUploading] = useState(false);
    const [currentLesson, setCurrentLesson] = useState(1);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const result = await getAllData();

            // Default UI labels if missing
            const defaultLabels = {
                "en": {
                    "startBtn": "Start Quiz",
                    "nextBtn": "Next",
                    "submitBtn": "Submit",
                    "loginBtn": "Login / Register",
                    "backBtn": "Back",
                    "homeBtn": "Back to Home",
                    "selectLanguage": "Select Language",
                    "welcome": "Welcome",
                    "selectLesson": "Select a lesson to begin"
                },
                "hi": {
                    "startBtn": "क्विज़ शुरू करें",
                    "nextBtn": "अगला",
                    "submitBtn": "जमा करें",
                    "loginBtn": "लॉगिन / रजिस्टर",
                    "backBtn": "पीछे",
                    "homeBtn": "होम पर वापस जाएं",
                    "selectLanguage": "भाषा चुनें",
                    "welcome": "नमस्ते",
                    "selectLesson": "शुरू करने के लिए एक पाठ चुनें"
                }
            };

            const refined = { ...result };
            if (!refined.settings) refined.settings = {};
            if (!refined.settings.languages) {
                refined.settings.languages = [
                    { code: 'en', name: 'English', active: true },
                    { code: 'hi', name: 'Hindi', active: true }
                ];
            }
            if (!refined.settings.uiLabels) refined.settings.uiLabels = defaultLabels;
            if (!refined.questions) refined.questions = [];
            if (!refined.scoringRules) refined.scoringRules = [];

            setData(refined);
        } catch (error) {
            console.error(error);
            alert("Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await saveData(data);
            alert("Saved successfully!");
        } catch (error) {
            alert("Failed to save");
        }
    };

    const getActiveLanguages = () => {
        return data?.settings?.languages?.filter(l => l.active) || [];
    };

    const updateQuestion = (qId, langCode, value) => {
        const newQuestions = data.questions.map(q => {
            if (q.id === qId) {
                return { ...q, text: { ...q.text, [langCode]: value } };
            }
            return q;
        });
        setData({ ...data, questions: newQuestions });
    };

    const updateOption = (qId, oIndex, field, value, langCode = null) => {
        const newQuestions = data.questions.map(q => {
            if (q.id === qId) {
                const newOptions = [...q.options];
                if (field === 'text') {
                    newOptions[oIndex].text = { ...newOptions[oIndex].text, [langCode]: value };
                } else if (field === 'isCorrect') {
                    newOptions.forEach((opt, i) => opt.points = (i === oIndex ? 10 : 0));
                }
                return { ...q, options: newOptions };
            }
            return q;
        });
        setData({ ...data, questions: newQuestions });
    };

    const addQuestion = () => {
        const newQ = {
            id: Date.now(),
            lessonId: currentLesson,
            text: { en: "New Question", hi: "" },
            options: [
                { text: { en: "Option 1", hi: "" }, points: 10 },
                { text: { en: "Option 2", hi: "" }, points: 0 },
                { text: { en: "Option 3", hi: "" }, points: 0 },
                { text: { en: "Option 4", hi: "" }, points: 0 }
            ]
        };
        setData({ ...data, questions: [...data.questions, newQ] });
    };

    const removeQuestion = (qId) => {
        if (!window.confirm("Delete this question?")) return;
        setData({ ...data, questions: data.questions.filter(q => q.id !== qId) });
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Admin Panel...</div>;

    const activeLangs = getActiveLanguages();
    const filteredQuestions = data.questions.filter(q => q.lessonId === currentLesson);

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 700, color: '#1e293b' }}>Admin Dashboard</h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => navigate('/')} style={{ padding: '0.6rem 1.2rem', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>View Quiz</button>
                        <button onClick={handleSave} style={{ padding: '0.6rem 1.2rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save Changes</button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                    {['questions', 'rules', 'settings', 'uitext'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'transparent',
                                border: 'none',
                                color: activeTab === tab ? '#6366f1' : '#64748b',
                                borderBottom: activeTab === tab ? '2px solid #6366f1' : 'none',
                                fontWeight: activeTab === tab ? 600 : 400,
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'questions' && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setCurrentLesson(num)}
                                    style={{
                                        minWidth: '100px',
                                        padding: '0.6rem',
                                        borderRadius: '8px',
                                        border: '1px solid',
                                        borderColor: currentLesson === num ? '#6366f1' : '#e2e8f0',
                                        background: currentLesson === num ? '#6366f1' : 'white',
                                        color: currentLesson === num ? 'white' : '#1e293b',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Lesson {num}
                                </button>
                            ))}
                        </div>

                        {filteredQuestions.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                                <p style={{ color: '#64748b' }}>No questions in this lesson yet.</p>
                                <button onClick={addQuestion} style={{ color: '#6366f1', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>+ Add First Question</button>
                            </div>
                        )}

                        {filteredQuestions.map((q, idx) => (
                            <div key={q.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Question {idx + 1}</h3>
                                    <button onClick={() => removeQuestion(q.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    {activeLangs.map(lang => (
                                        <div key={lang.code}>
                                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#64748b', marginBottom: '0.5rem' }}>Question Text ({lang.name})</label>
                                            <textarea
                                                value={q.text[lang.code] || ''}
                                                onChange={(e) => updateQuestion(q.id, lang.code, e.target.value)}
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px' }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                            <input
                                                type="radio"
                                                name={`q-${q.id}-correct`}
                                                checked={opt.points > 0}
                                                onChange={() => updateOption(q.id, oIdx, 'isCorrect')}
                                            />
                                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                {activeLangs.map(lang => (
                                                    <input
                                                        key={lang.code}
                                                        placeholder={`Option ${oIdx + 1} (${lang.name})`}
                                                        value={opt.text[lang.code] || ''}
                                                        onChange={(e) => updateOption(q.id, oIdx, 'text', e.target.value, lang.code)}
                                                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <button onClick={addQuestion} style={{ width: '100%', padding: '1rem', border: '2px dashed #6366f1', background: '#f5f3ff', color: '#6366f1', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>
                            + Add New Question
                        </button>
                    </div>
                )}

                {activeTab === 'uitext' && (
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>UI Labels & Translations</h2>
                        {Object.keys(data.settings.uiLabels.en).map(key => (
                            <div key={key} style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {activeLangs.map(lang => (
                                        <div key={lang.code}>
                                            <small style={{ color: '#64748b' }}>{lang.name}</small>
                                            <input
                                                value={data.settings.uiLabels[lang.code]?.[key] || ''}
                                                onChange={(e) => {
                                                    const newData = { ...data };
                                                    if (!newData.settings.uiLabels[lang.code]) newData.settings.uiLabels[lang.code] = {};
                                                    newData.settings.uiLabels[lang.code][key] = e.target.value;
                                                    setData(newData);
                                                }}
                                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
