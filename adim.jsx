import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllData, saveData } from './api';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('questions'); // 'questions', 'rules', 'settings', 'uitext'
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const result = await getAllData();

            // Ensure data integrity for new structure
            if (!result.settings.languages) {
                result.settings.languages = [
                    { code: 'en', name: 'English', active: true },
                    { code: 'hi', name: 'Hindi', active: true }
                ];
            }
            // Ensure UI Labels structure
            if (!result.settings.uiLabels) {
                result.settings.uiLabels = {};
            }

            // Default UI labels if missing
            const defaultLabels = {
                "en": {
                    "startBtn": "Start Quiz",
                    "nextBtn": "Next",
                    "submitBtn": "Submit",
                    "downloadBtn": "Download Report",
                    "homeBtn": "Back to Home",
                    "selectLanguage": "Select Language"
                },
                "hi": {
                    "startBtn": "क्विज़ शुरू करें",
                    "nextBtn": "अगला",
                    "submitBtn": "जमा करें",
                    "downloadBtn": "रिपोर्ट डाउनलोड करें",
                    "homeBtn": "होम पर वापस जाएं",
                    "selectLanguage": "भाषा चुनें"
                }
            };

            // Merge defaults
            result.settings.languages.forEach(lang => {
                if (!result.settings.uiLabels[lang.code]) {
                    result.settings.uiLabels[lang.code] = defaultLabels[lang.code] || defaultLabels['en'];
                }
            });

            // Ensure Colors structure
            if (!result.settings.colors) {
                result.settings.colors = {
                    primary: '#6366f1',
                    secondary: '#ec4899',
                    text: '#1e293b',
                    buttonText: '#ffffff',
                    cardBg: '#ffffff',
                    background: '#f8fafc'
                };
            }

            setData(result);
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

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const response = await fetch('http://localhost:5001/api/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.success) {
                updateSetting(null, 'logoUrl', result.fileUrl);
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        } finally {
            setUploading(false);
        }
    };

    // --- Helper to get active languages ---
    const getActiveLanguages = () => {
        return data?.settings?.languages?.filter(l => l.active) || [];
    };

    // --- Question Handlers ---
    const updateQuestion = (index, langCode, value) => {
        const newQuestions = [...data.questions];
        if (!newQuestions[index].text) newQuestions[index].text = {};
        newQuestions[index].text[langCode] = value;
        setData({ ...data, questions: newQuestions });
    };

    const updateOption = (qIndex, oIndex, field, value, langCode = null) => {
        const newQuestions = [...data.questions];
        if (field === 'text' && langCode) {
            if (!newQuestions[qIndex].options[oIndex].text) newQuestions[qIndex].options[oIndex].text = {};
            newQuestions[qIndex].options[oIndex].text[langCode] = value;
        } else if (field === 'points') {
            newQuestions[qIndex].options[oIndex].points = parseInt(value) || 0;
        }
        setData({ ...data, questions: newQuestions });
    };

    const addOption = (qIndex) => {
        const newQuestions = [...data.questions];
        newQuestions[qIndex].options.push({ text: { en: "New Option" }, points: 0 });
        setData({ ...data, questions: newQuestions });
    };

    const removeOption = (qIndex, oIndex) => {
        const newQuestions = [...data.questions];
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        setData({ ...data, questions: newQuestions });
    };

    const addQuestion = () => {
        const newQ = {
            id: Date.now(),
            text: { en: "New Question" },
            options: [
                { text: { en: "Option 1" }, points: 0 },
                { text: { en: "Option 2" }, points: 0 },
                { text: { en: "Option 3" }, points: 0 },
                { text: { en: "Option 4" }, points: 0 }
            ]
        };
        setData({ ...data, questions: [...data.questions, newQ] });
    };

    const removeQuestion = (index) => {
        if (!window.confirm("Delete this question?")) return;
        const newQuestions = data.questions.filter((_, i) => i !== index);
        setData({ ...data, questions: newQuestions });
    };

    // --- Rule Handlers ---
    const updateRule = (index, field, value, langCode = null) => {
        const newRules = [...data.scoringRules];
        if (field === 'min' || field === 'max') {
            newRules[index][field] = parseInt(value) || 0;
        } else if ((field === 'title' || field === 'description') && langCode) {
            if (!newRules[index][field]) newRules[index][field] = {};
            newRules[index][field][langCode] = value;
        }
        setData({ ...data, scoringRules: newRules });
    };

    const addRule = () => {
        setData({ ...data, scoringRules: [...data.scoringRules, { min: 0, max: 0, title: { en: "New Result" }, description: { en: "" } }] });
    };

    const removeRule = (index) => {
        if (!window.confirm("Delete this rule?")) return;
        const newRules = data.scoringRules.filter((_, i) => i !== index);
        setData({ ...data, scoringRules: newRules });
    };

    // --- Settings Handlers ---
    const updateSetting = (section, field, value) => {
        if (section) {
            setData({ ...data, settings: { ...data.settings, [section]: { ...data.settings[section], [field]: value } } });
        } else {
            setData({ ...data, settings: { ...data.settings, [field]: value } });
        }
    };

    const updateLanguage = (index, field, value) => {
        const newLangs = [...data.settings.languages];
        newLangs[index][field] = value;
        setData({ ...data, settings: { ...data.settings, languages: newLangs } });
    };

    const addLanguage = () => {
        const newLangs = [...data.settings.languages, { code: '', name: '', active: true }];
        setData({ ...data, settings: { ...data.settings, languages: newLangs } });
    };

    const removeLanguage = (index) => {
        if (!window.confirm("Remove this language?")) return;
        const newLangs = data.settings.languages.filter((_, i) => i !== index);
        setData({ ...data, settings: { ...data.settings, languages: newLangs } });
    };

    // --- UI Labels Handler ---
    const updateUILabel = (langCode, key, value) => {
        const newLabels = { ...data.settings.uiLabels };
        if (!newLabels[langCode]) newLabels[langCode] = {};
        newLabels[langCode][key] = value;
        setData({ ...data, settings: { ...data.settings, uiLabels: newLabels } });
    };


    if (loading) return <div className="container">Loading Admin...</div>;

    const activeLangs = getActiveLanguages();
    const uiKeys = [
        { key: 'selectLanguage', label: 'Select Language Title' },
        { key: 'startBtn', label: 'Start Button' },
        { key: 'nextBtn', label: 'Next Button' },
        { key: 'submitBtn', label: 'Submit Button' },
        { key: 'downloadBtn', label: 'Download Report Button' },
        { key: 'homeBtn', label: 'Home Button' }
    ];

    return (
        <div className="container" style={{ maxWidth: '1200px', textAlign: 'left' }}>
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <div>
                    <button className="secondary" onClick={() => navigate('/')}>Exit</button>
                    <button onClick={handleSave}>Save Changes</button>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <button className={activeTab === 'questions' ? '' : 'secondary'} onClick={() => setActiveTab('questions')}>Manage Questions</button>
                <button className={activeTab === 'rules' ? '' : 'secondary'} onClick={() => setActiveTab('rules')}>Result Rules</button>
                <button className={activeTab === 'settings' ? '' : 'secondary'} onClick={() => setActiveTab('settings')}>Site Settings</button>
                <button className={activeTab === 'uitext' ? '' : 'secondary'} onClick={() => setActiveTab('uitext')}>UI Text & Labels</button>
            </div>

            {activeTab === 'questions' && (
                <div className="admin-section">
                    {data.questions.map((q, qIndex) => (
                        <div key={q.id} className="admin-card">
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="label">Question Text</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                                        {activeLangs.map(lang => (
                                            <div key={lang.code}>
                                                <small style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem' }}>{lang.name}</small>
                                                <textarea
                                                    rows="3"
                                                    value={q.text?.[lang.code] || ''}
                                                    onChange={(e) => updateQuestion(qIndex, lang.code, e.target.value)}
                                                    className="admin-input"
                                                    style={{ whiteSpace: 'pre-wrap' }}
                                                    placeholder={`Question in ${lang.name}`}
                                                ></textarea>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button className="danger" style={{ marginTop: '1.8rem' }} onClick={() => removeQuestion(qIndex)}>Delete</button>
                            </div>

                            <label className="label">Options</label>
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                                        {activeLangs.map(lang => (
                                            <div key={lang.code}>
                                                <small style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.6rem' }}>{lang.name}</small>
                                                <input
                                                    className="admin-input"
                                                    style={{ marginBottom: 0 }}
                                                    placeholder={`${lang.name} Option`}
                                                    value={opt.text?.[lang.code] || ''}
                                                    onChange={(e) => updateOption(qIndex, oIndex, 'text', e.target.value, lang.code)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ width: '80px' }}>
                                        <label className="label">Points</label>
                                        <input
                                            className="admin-input"
                                            style={{ marginBottom: 0 }}
                                            type="number"
                                            placeholder="Pts"
                                            value={opt.points}
                                            onChange={(e) => updateOption(qIndex, oIndex, 'points', e.target.value)}
                                        />
                                    </div>
                                    <div style={{ padding: '1rem 0' }}>
                                        <button className="danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', margin: 0 }} onClick={() => removeOption(qIndex, oIndex)}>Remove Option</button>
                                    </div>
                                </div>
                            ))}
                            <button className="secondary" style={{ marginTop: '0.5rem', width: 'auto' }} onClick={() => addOption(qIndex)}>+ Add Option</button>
                        </div>
                    ))}
                    <button onClick={addQuestion} style={{ width: '100%', margin: 0 }}>+ Add New Question</button>
                </div>
            )}

            {activeTab === 'rules' && (
                <div className="admin-section">
                    <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>Define score ranges based on Max Points (default 100).</p>
                    {data.scoringRules.map((rule, rIndex) => (
                        <div key={rIndex} className="admin-card">
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ width: '100px' }}>
                                    <label className="label">Min</label>
                                    <input className="admin-input" type="number" value={rule.min} onChange={(e) => updateRule(rIndex, 'min', e.target.value)} />
                                </div>
                                <div style={{ width: '100px' }}>
                                    <label className="label">Max</label>
                                    <input className="admin-input" type="number" value={rule.max} onChange={(e) => updateRule(rIndex, 'max', e.target.value)} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="label">Result Title</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                                        {activeLangs.map(lang => (
                                            <input
                                                key={lang.code}
                                                className="admin-input"
                                                placeholder={lang.name}
                                                value={rule.title?.[lang.code] || ''}
                                                onChange={(e) => updateRule(rIndex, 'title', e.target.value, lang.code)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <button className="danger" style={{ height: 'fit-content', marginTop: '1.8rem' }} onClick={() => removeRule(rIndex)}>Del</button>
                            </div>

                            <label className="label">Description (Optional)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.5rem' }}>
                                {activeLangs.map(lang => (
                                    <textarea
                                        key={lang.code}
                                        rows="2"
                                        className="admin-input"
                                        placeholder={`${lang.name} Description`}
                                        value={rule.description?.[lang.code] || ''}
                                        onChange={(e) => updateRule(rIndex, 'description', e.target.value, lang.code)}
                                    ></textarea>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button onClick={addRule}>+ Add New Rule</button>
                </div>
            )}

            {activeTab === 'settings' && data.settings && (
                <div className="admin-section">

                    {/* Branding Section */}
                    <div className="admin-card">
                        <h3>Branding & UI</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label className="label">Event Name</label>
                                <input className="admin-input" value={data.settings.eventName || ''} onChange={(e) => updateSetting(null, 'eventName', e.target.value)} />
                            </div>
                            <div>
                                <label className="label">Session Name</label>
                                <input className="admin-input" value={data.settings.sessionName || ''} onChange={(e) => updateSetting(null, 'sessionName', e.target.value)} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label className="label">Logo URL / Upload</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input className="admin-input" value={data.settings.logoUrl} onChange={(e) => updateSetting(null, 'logoUrl', e.target.value)} placeholder="https://..." />
                                    <label className="secondary" style={{ padding: '0.8rem', border: '1px solid #ccc', borderRadius: '8px', cursor: 'pointer', background: '#f8fafc' }}>
                                        {uploading ? '...' : 'Upload'}
                                        <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} accept="image/*" />
                                    </label>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                                <label style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={data.settings.showLogo} onChange={(e) => updateSetting(null, 'showLogo', e.target.checked)} />
                                    Show Logo
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                            <div>
                                <label className="label">Primary Color</label>
                                <input className="admin-input" type="color" style={{ height: '50px' }} value={data.settings.colors?.primary || '#6366f1'} onChange={(e) => updateSetting('colors', 'primary', e.target.value)} />
                            </div>
                            <div>
                                <label className="label">Secondary Color</label>
                                <input className="admin-input" type="color" style={{ height: '50px' }} value={data.settings.colors?.secondary || '#ec4899'} onChange={(e) => updateSetting('colors', 'secondary', e.target.value)} />
                            </div>
                            <div>
                                <label className="label">Text Color</label>
                                <input className="admin-input" type="color" style={{ height: '50px' }} value={data.settings.colors?.text || '#1e293b'} onChange={(e) => updateSetting('colors', 'text', e.target.value)} />
                            </div>
                            <div>
                                <label className="label">Button Text</label>
                                <input className="admin-input" type="color" style={{ height: '50px' }} value={data.settings.colors?.buttonText || '#ffffff'} onChange={(e) => updateSetting('colors', 'buttonText', e.target.value)} />
                            </div>
                            <div>
                                <label className="label">Card Background</label>
                                <input className="admin-input" type="color" style={{ height: '50px' }} value={data.settings.colors?.cardBg || '#ffffff'} onChange={(e) => updateSetting('colors', 'cardBg', e.target.value)} />
                            </div>
                            <div>
                                <label className="label">Page Background</label>
                                <input className="admin-input" type="color" style={{ height: '50px' }} value={data.settings.colors?.background || '#f8fafc'} onChange={(e) => updateSetting('colors', 'background', e.target.value)} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <label style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={data.settings.showSplashScreen} onChange={(e) => updateSetting(null, 'showSplashScreen', e.target.checked)} />
                                    Enable Splash Screen
                                </label>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="label">Splash Duration (ms)</label>
                                <input className="admin-input" type="number" value={data.settings.splashDuration} onChange={(e) => updateSetting(null, 'splashDuration', parseInt(e.target.value))} />
                            </div>
                        </div>
                    </div>

                    {/* Language Management */}
                    <div className="admin-card">
                        <h3>Languages</h3>
                        <p style={{ marginBottom: '1rem', color: '#64748b' }}>Add languages here to enable them in the Quiz and Result.</p>
                        {data.settings.languages.map((lang, index) => (
                            <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                <input className="admin-input" style={{ marginBottom: 0, width: '80px' }} placeholder="Code (en)" value={lang.code} onChange={(e) => updateLanguage(index, 'code', e.target.value)} />
                                <input className="admin-input" style={{ marginBottom: 0, flex: 1 }} placeholder="Name (English)" value={lang.name} onChange={(e) => updateLanguage(index, 'name', e.target.value)} />
                                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={lang.active} onChange={(e) => updateLanguage(index, 'active', e.target.checked)} />
                                    Active
                                </label>
                                <button className="danger" style={{ padding: '0.5rem', margin: 0 }} onClick={() => removeLanguage(index)}>X</button>
                            </div>
                        ))}
                        <button className="secondary" style={{ marginTop: '1rem' }} onClick={addLanguage}>+ Add Language</button>
                    </div>

                    {/* Welcome Messages */}
                    <div className="admin-card">
                        <h3>Welcome Messages</h3>
                        {activeLangs.map(lang => (
                            <div key={lang.code} style={{ marginBottom: '1rem' }}>
                                <label className="label">Welcome Message ({lang.name})</label>
                                <textarea
                                    className="admin-input"
                                    rows="2"
                                    value={data.settings.welcomeMessage?.[lang.code] || ''}
                                    onChange={(e) => {
                                        const newWelcome = { ...data.settings.welcomeMessage, [lang.code]: e.target.value };
                                        setData({ ...data, settings: { ...data.settings, welcomeMessage: newWelcome } });
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Footer Text */}
                    <div className="admin-card">
                        <h3>Footer Text</h3>
                        {activeLangs.map(lang => (
                            <div key={lang.code} style={{ marginBottom: '1rem' }}>
                                <label className="label">Footer Text ({lang.name})</label>
                                <textarea
                                    className="admin-input"
                                    rows="2"
                                    value={data.settings.footerText?.[lang.code] || ''}
                                    onChange={(e) => {
                                        const newFooter = { ...data.settings.footerText, [lang.code]: e.target.value };
                                        setData({ ...data, settings: { ...data.settings, footerText: newFooter } });
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Scoring Settings */}
                    <div className="admin-card">
                        <h3>Scoring</h3>
                        <label className="label">Max Points (for % calculation)</label>
                        <input className="admin-input" type="number" value={data.settings.maxPoints || 100} onChange={(e) => updateSetting(null, 'maxPoints', parseInt(e.target.value))} />
                    </div>

                </div>
            )}

            {activeTab === 'uitext' && data.settings && (
                <div className="admin-section">
                    <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>Customize the text for buttons and static labels.</p>

                    {activeLangs.map(lang => (
                        <div key={lang.code} className="admin-card">
                            <h3>{lang.name} Labels</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                                {uiKeys.map(({ key, label }) => (
                                    <div key={key}>
                                        <label className="label">{label}</label>
                                        <input
                                            className="admin-input"
                                            value={data.settings.uiLabels?.[lang.code]?.[key] || ''}
                                            onChange={(e) => updateUILabel(lang.code, key, e.target.value)}
                                            placeholder={label}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;