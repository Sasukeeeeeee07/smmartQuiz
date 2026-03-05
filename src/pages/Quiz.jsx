import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from './logo.6712b347ef6bfbe8b880.png';

// ─────────────────────────────────────────────────────────────────────────────
// Questions are loaded from MongoDB (via Admin Panel → /admin)
// Lesson background images: L1.jpg through L9.jpeg (in project root / public)
// ─────────────────────────────────────────────────────────────────────────────

const NUM_LESSONS = 9;
const API = '/api';

// L1–L9 background images (files in public/images/ folder)
const LESSON_IMAGES = {
    1: '/images/L1.jpg',
    2: '/images/L2.jpeg',
    3: '/images/L3.jpeg',
    4: '/images/L4.jpg',
    5: '/images/L5.jpg',
    6: '/images/L6.jpeg',
    7: '/images/L7.jpg',
    8: '/images/L8.jpg',
    9: '/images/L9.jpeg',
};

// UI strings keyed by language code
const UI_EN = {
    chooseLanguage: "Choose Language", chooseLangSub: "Select your preferred language to begin",
    selectLesson: "Select a Lesson", lessonSub: "Tap a lesson to start the quiz",
    questions: "questions", question: "Question", of: "of",
    nextQuestion: "Next Question", seeResults: "See Results",
    yourScore: "Your Score", excellent: "Excellent!", good: "Good Job!", keepPracticing: "Keep Practicing!",
    retakeLesson: "Retake Lesson", backToLessons: "Back to Lessons",
    correct: "Correct!", wrong: "Wrong!", downloadPdf: "Download PDF Report",
    noQuestions: "No questions available", noQuestionsMsg: "The admin hasn't added questions yet.",
    loading: "Loading...", loggedInAs: "Logged in as", logout: "Logout",
};

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

const UI = {
    en: { ...UI_EN },
    hi: {
        chooseLanguage: "भाषा चुनें", chooseLangSub: "शुरू करने के लिए अपनी भाषा चुनें",
        selectLesson: "पाठ चुनें", lessonSub: "क्विज़ शुरू करने के लिए पाठ चुनें",
        questions: "प्रश्न", question: "प्रश्न", of: "में से",
        nextQuestion: "अगला प्रश्न", seeResults: "परिणाम देखें",
        yourScore: "आपका स्कोर", excellent: "शानदार!", good: "बहुत अच्छे!", keepPracticing: "अभ्यास जारी रखें!",
        retakeLesson: "पाठ दोबारा लें", backToLessons: "पाठ सूची पर वापस जाएं",
        correct: "सही!", wrong: "गलत!", downloadPdf: "PDF रिपोर्ट डाउनलोड करें",
        noQuestions: "कोई प्रश्न उपलब्ध नहीं", noQuestionsMsg: "इस पाठ के लिए प्रश्न अभी तक नहीं जोड़े गए।",
        loading: "लोड हो रहा है...", loggedInAs: "लॉग इन:", logout: "लॉग आउट",
    },
    mr: {
        chooseLanguage: "भाषा निवडा", chooseLangSub: "सुरू करण्यासाठी आपली भाषा निवडा",
        selectLesson: "धडा निवडा", lessonSub: "प्रश्नमंजुषा सुरू करण्यासाठी धडा निवडा",
        questions: "प्रश्न", question: "प्रश्न", of: "पैकी",
        nextQuestion: "पुढील प्रश्न", seeResults: "निकाल पाहा",
        yourScore: "तुमचे गुण", excellent: "उत्कृष्ट!", good: "छान काम!", keepPracticing: "सराव सुरू ठेवा!",
        retakeLesson: "धडा पुन्हा घ्या", backToLessons: "धड्यांवर परत जा",
        correct: "बरोबर!", wrong: "चुकीचे!", downloadPdf: "PDF अहवाल डाउनलोड करा",
        noQuestions: "प्रश्न उपलब्ध नाहीत", noQuestionsMsg: "या धड्यासाठी अद्याप प्रश्न जोडलेले नाहीत.",
        loading: "लोड होत आहे...", loggedInAs: "लॉग इन:", logout: "लॉग आउट",
    },
};

const LESSON_EMOJIS = ['🎯', '🚀', '🏛️', '🌍', '⚽', '💻', '🍛', '🔢', '💡'];


// Helper – get localised text from string or {en,hi,...} object
const locText = (val, lang) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[lang] || val.en || val.hi || Object.values(val)[0] || '';
};

export default function Quiz() {
    const navigate = useNavigate();

    // ── Auth ──
    const user = JSON.parse(sessionStorage.getItem('user') || 'null');

    // ── State ──
    // ── State (Non-persisted UI) ──
    const [step, setStep] = useState('landing');
    const [lang, setLang] = useState('en');
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState([]);

    // ── Non-persisted state ──
    const [availableLanguages, setAvailableLanguages] = useState([]);
    const [lessonNames, setLessonNames] = useState(
        Array.from({ length: NUM_LESSONS }, (_, i) => `Lesson ${i + 1}`)
    );
    const [lessons, setLessons] = useState([]);
    const [loadingLessons, setLoadingLessons] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [answered, setAnswered] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    const t = UI[lang] || UI.en;

    // ── Sounds (Moved to useRef to prevent "too many WebMediaPlayers" error) ──
    const correctAudio = useRef(new Audio('/right.mp3'));
    const wrongAudio = useRef(new Audio('/wrong.mp3'));

    const playSound = useCallback((correct, onEndedCallback) => {
        try {
            const audio = correct ? correctAudio.current : wrongAudio.current;
            audio.currentTime = 0;
            if (onEndedCallback) {
                audio.onended = () => { audio.onended = null; onEndedCallback(); };
            }
            audio.play().catch(() => { if (onEndedCallback) setTimeout(onEndedCallback, 1200); });
        } catch {
            if (onEndedCallback) setTimeout(onEndedCallback, 1200);
        }
    }, []);

    // ── Initial Data Fetch ──
    useEffect(() => {
        // We load languages first. Lesson names are now loaded per language in fetchLessons.
        fetch(`${API}/languages`)
            .then(r => r.json())
            .then(langs => { if (Array.isArray(langs) && langs.length > 0) setAvailableLanguages(langs); })
            .catch(() => {
                setAvailableLanguages([{ code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' }]);
            });
    }, []);

    // ── Fetch questions for the chosen language ──
    const fetchLessons = useCallback(async (language, autoSelectId = null) => {
        // 1. Immediately update names from hardcoded constants (INSTANT)
        const names = language === 'hi' ? LESSON_NAMES_HI : LESSON_NAMES_EN;
        setLessonNames(names);

        // 2. Pre-initialize lessons so the UI doesn't show "Loading..."
        const initialLessons = Array.from({ length: NUM_LESSONS }, (_, i) => ({
            id: i + 1,
            name: names[i] || `Lesson ${i + 1}`,
            questions: [],
        }));
        setLessons(initialLessons);

        // 3. Fetch questions in the background
        setLoadingLessons(true);
        try {
            const res = await fetch(`${API}/quiz-content/${language}`);
            const content = await res.json();

            const built = initialLessons.map((lesson) => {
                const dbLesson = content.find(c => c.lessonId === lesson.id);
                const rawQs = dbLesson?.questions || [];
                const questions = rawQs.map(q => ({
                    text: q.text,
                    options: (q.options || []).map((opt, oIdx) => ({
                        text: opt,
                        correct: oIdx === q.correctIndex,
                    })),
                }));

                return { ...lesson, questions };
            });

            setLessons(built);
            if (autoSelectId) {
                const found = built.find(l => l.id === autoSelectId);
                if (found) setSelectedLesson(found);
            }
        } catch (err) {
            console.error('Failed to load quiz content:', err);
        } finally {
            setLoadingLessons(false);
        }
    }, [lessonNames]);

    // ── Handlers ──
    const handleLogout = () => {
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    const selectLanguage = (code) => {
        setLang(code);
        fetchLessons(code);
        setStep('lessons');
    };

    const startLesson = async (lesson) => {
        if (lesson.questions.length === 0) return;

        // Check for existing database progress OR finished score
        if (user) {
            try {
                // 1. Check if they already finished this lesson
                const sRes = await fetch(`${API}/scores/${user.email}`);
                const scores = await sRes.json();
                const existingScore = scores.find(s => s.lessonId === lesson.id && s.language === lang);

                if (existingScore) {
                    setScore(existingScore.score);
                    setAnswers(existingScore.answers || []);
                    setSelectedLesson(lesson);
                    setStep('result');
                    return; // Stop here, don't start the quiz
                }

                // 2. Check for partial progress
                const res = await fetch(`${API}/progress/${user.email}/${lang}/${lesson.id}`);
                const p = await res.json();
                if (p && p.updatedAt) {
                    setQIndex(p.qIndex || 0);
                    setScore(p.score || 0);
                    setAnswers(p.answers || []);
                } else {
                    setQIndex(0); setScore(0); setAnswers([]);
                }
            } catch (err) {
                setQIndex(0); setScore(0); setAnswers([]);
            }
        } else {
            setQIndex(0); setScore(0); setAnswers([]);
        }

        setSelectedLesson(lesson);
        setFeedback(null);
        setAnswered(false);
        setSelectedOption(null);
        setStep('quiz');
    };

    const handleAnswer = (optionIndex) => {
        if (answered) return;
        const question = selectedLesson.questions[qIndex];
        const isCorrect = question.options[optionIndex].correct;
        setSelectedOption(optionIndex);
        setAnswered(true);
        setFeedback(isCorrect ? 'correct' : 'wrong');

        const newScore = isCorrect ? score + 1 : score;
        const newAnswers = [...answers, { qIndex, selectedIdx: optionIndex, correct: isCorrect }];

        playSound(isCorrect, async () => {
            if (qIndex + 1 < selectedLesson.questions.length) {
                const nextIdx = qIndex + 1;
                setQIndex(nextIdx);
                setScore(newScore);
                setAnswers(newAnswers);
                setFeedback(null);
                setAnswered(false);
                setSelectedOption(null);

                // Save persistent progress to database
                if (user) {
                    fetch(`${API}/progress`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: user.email,
                            language: lang,
                            lessonId: selectedLesson.id,
                            qIndex: nextIdx,
                            score: newScore,
                            answers: newAnswers
                        })
                    }).catch(() => { });
                }
            } else {
                setScore(newScore);
                setAnswers(newAnswers);

                // Save final score to DB
                if (user) {
                    fetch(`${API}/scores`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            language: lang,
                            lessonId: selectedLesson.id,
                            score: newScore,
                            totalQuestions: selectedLesson.questions.length,
                            answers: newAnswers
                        }),
                    }).then(() => {
                        // Clear partial progress after completion
                        fetch(`${API}/progress/${user.email}/${lang}/${selectedLesson.id}`, { method: 'DELETE' }).catch(() => { });
                    }).catch(() => { });
                }
                setStep('result');
            }
        });
    };

    const resetToLessons = () => {
        setStep('lessons');
        setSelectedLesson(null);
        setQIndex(0); setScore(0);
        setFeedback(null); setAnswered(false); setSelectedOption(null);
        setAnswers([]);
    };

    const getResultEmoji = () => {
        const pct = score / selectedLesson.questions.length;
        if (pct >= 0.8) return { emoji: '🏆', msg: t.excellent };
        if (pct >= 0.5) return { emoji: '⭐', msg: t.good };
        return { emoji: '📚', msg: t.keepPracticing };
    };

    // ── PDF Generator ──
    const generatePDF = () => {
        const total = selectedLesson.questions.length;
        const pct = Math.round((score / total) * 100);
        const lessonName = selectedLesson.name;

        // Use today's date formatted nicely
        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

        const questionsHTML = selectedLesson.questions.map((q, idx) => {
            const ans = answers.find(a => a.qIndex === idx);
            const selectedIdx = ans ? ans.selectedIdx : null;
            const wasCorrect = ans ? ans.correct : null;

            const qText = typeof q.text === 'object' ? (q.text[lang] || q.text.en || '') : q.text;

            // Follow the user design logic exactly: Option containers side-by-side or stacked cleanly
            const optionsHTML = q.options.map((opt, oIdx) => {
                const isSelected = oIdx === selectedIdx;
                const isCorr = opt.correct;
                let bg = '#fafafa', border = '#e5e7eb', optColor = '#374151', badge = '';

                // Styling based exactly on the screenshot colors
                if (isSelected && wasCorrect) {
                    bg = '#5e68ec'; border = '#5e68ec'; optColor = '#fff'; badge = `(Selected)`;
                }
                else if (isSelected && !wasCorrect) {
                    bg = '#5e68ec'; border = '#5e68ec'; optColor = '#fff'; badge = `(Selected)`;
                }
                // The correct answer gets highlighted in green if it wasn't selected (or if it was, the above block handles it but wait! In the screenshot, the 'Selected' option is Blue and 'Best Answer' is Green).
                let correctClass = '';
                if (isCorr) {
                    if (!isSelected) {
                        bg = '#34d399'; border = '#34d399'; optColor = '#fff'; badge = `(Best Answer)`;
                    } else {
                        // If it's both selected and best answer, we color it Green with 'Best Answer' or handle as per screenshot
                        bg = '#34d399'; border = '#34d399'; optColor = '#fff'; badge = `(Best Answer)`;
                    }
                }

                // If not selected and not correct, default simple box
                const optText = typeof opt.text === 'object' ? (opt.text[lang] || opt.text.en || '') : opt.text;

                return `
                <div style="flex: 1; padding: 14px 18px; border: 1px solid ${border}; background: ${bg}; border-radius: 4px; display: inline-flex; justify-content: space-between; align-items: center; min-width: 45%; margin: 6px;">
                    <span style="font-size: 13px; color: ${optColor}; margin: 0;">${optText} <strong>${badge}</strong></span>
                </div>`;
            }).join('');

            return `<div style="margin-bottom: 32px; page-break-inside: avoid;">
                <h3 style="font-size: 16px; font-weight: 700; color: #000; margin-bottom: 12px;">Q${idx + 1}: ${qText}</h3>
                <div style="display: flex; flex-wrap: wrap; margin: -6px;">
                    ${optionsHTML}
                </div>
            </div>`;
        }).join('');

        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Assessment Report</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#111827;max-width:850px;margin:0 auto;}@media print{body{padding:20px;-webkit-print-color-adjust: exact;}} .analysis-box{border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 32px;} .analysis-title{font-size: 16px; font-weight: 700; color: #111; margin-bottom: 12px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;} .analysis-text{font-size: 14px; color: #4b5563; line-height: 1.6;}</style></head><body>
            
            <!-- Header layout -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid transparent; padding-bottom: 24px; margin-bottom: 32px;">
                <div style="flex: 1;">
                    <img src="${window.location.origin}/src/pages/logo.6712b347ef6bfbe8b880.png" style="height: 48px; object-fit: contain;" alt="Smmart Logo"/>
                </div>
                <div style="flex: 2; text-align: center;">
                    <h1 style="font-size: 24px; font-weight: 800; color: #111; margin: 0;">${lessonName}</h1>
                    <p style="font-size: 14px; color: #555; margin: 4px 0 0;"></p>
                </div>
                <div style="flex: 1; text-align: right;">
                    <p style="font-size: 14px; font-weight: 700; color: #444; margin: 0;">Assessment Report</p>
                    <p style="font-size: 13px; color: #666; margin: 2px 0 0;">Date: ${today}</p>
                </div>
            </div>

            <!-- Score Banner -->
            <div style="background-color: #f0f4ff; border: 1.5px solid #a5b4fc; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <h2 style="font-size: 28px; font-weight: 600; color: #4f46e5; margin: 0 0 8px 0;">Total Score: ${score * 10}</h2>
                <p style="font-size: 20px; font-weight: 700; color: #374151; margin: 0;">${pct >= 80 ? 'The journey of transformation has started' : 'Keep demanding excellence from yourself!'}</p>
            </div>

            <!-- Analysis Box -->
            <div class="analysis-box">
                <div class="analysis-title">Analysis</div>
                <div class="analysis-text">
                    ${pct >= 80 ? "The journey of transformation has started. With continued push for determination, learning, capability building and implementation you will surely achieve your goals!<br/>Keep demanding excellence from yourself and don't loosen the grip..." : "There's room for improvement. Focus more on the core concepts of this lesson to strengthen your understanding and reach your target goals."}
                </div>
            </div>

            ${questionsHTML}

        </body></html>`;

        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 500);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    const PURPLE_BG = 'linear-gradient(160deg, #6366f1 0%, #7c3aed 50%, #a855f7 100%)';

    // Truly full-screen overlay (escapes any parent max-width constraint)
    const FullScreen = ({ bg, children, style = {} }) => (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: bg || 'transparent',
            overflowY: 'auto', overflowX: 'hidden',
            display: 'flex', flexDirection: 'column',
            ...style,
        }}>
            {children}
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // SCREENS
    // ─────────────────────────────────────────────────────────────────────────

    // ── LANDING ──
    if (step === 'landing') {
        return (
            <FullScreen bg="#000" style={{ alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <div className="landing-company-logo-wrap">
                    <img src={logoImg} alt="Company Logo" className="landing-company-logo" />
                </div>
                <div className="landing-bg"></div>
                <div className="landing-content" style={{ zIndex: 10 }}>
                    <h1 className="landing-title">9 LESSONS<br />QUIZ</h1>
                    <button className="landing-btn" onClick={() => setStep('language')}>START QUIZ</button>
                    {user && (
                        <p style={{ marginTop: '1.25rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                            {t.loggedInAs} <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{user.name}</strong>
                            <button onClick={handleLogout} style={{ marginLeft: '0.75rem', background: 'none', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.6)', borderRadius: '999px', padding: '0.2rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem' }}>
                                {t.logout}
                            </button>
                        </p>
                    )}
                </div>
            </FullScreen>
        );
    }

    // ── LANGUAGE SELECTION — Truly full-screen purple gradient ──
    if (step === 'language') {
        const langList = availableLanguages.length > 0
            ? availableLanguages
            : [{ code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' }];
        const flagMap = { en: '', hi: '', mr: '', gu: '', ta: '', te: '', bn: '', pa: '', kn: '', ml: '', ur: '', fr: '', de: '', es: '', ar: '' };

        return (
            <FullScreen bg={PURPLE_BG} style={{ justifyContent: 'center', alignItems: 'center' }}>
                {/* Logo top-left */}
                <div style={{ position: 'absolute', top: '1.2rem', left: '1.5rem', zIndex: 1 }}>
                    <img src="src/pages/logo.6712b347ef6bfbe8b880.png" alt="Logo" style={{ height: '36px', objectFit: 'contain' }} />
                </div>
                {/* Centred content */}
                <div style={{ width: '100%', maxWidth: '480px', padding: '5rem 1.75rem 2.5rem', boxSizing: 'border-box' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '1.25rem' }}>🎓</div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem', letterSpacing: '-0.5px' }}>{t.chooseLanguage}</h1>
                        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.75)', margin: 0 }}>{t.chooseLangSub}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {langList.map(l => (
                            <button key={l.code} className="lang-btn" onClick={() => selectLanguage(l.code)}>
                                <span className="lang-flag">{flagMap[l.code] || ''}</span>
                                <span className="lang-name">{l.name}</span>
                                <span className="lang-arrow">→</span>
                            </button>
                        ))}
                    </div>
                </div>
            </FullScreen>
        );
    }

    // ── LESSONS LIST — Truly full-screen purple gradient ──
    if (step === 'lessons') {
        return (
            <FullScreen bg={PURPLE_BG}>
                {/* Sticky header */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1.25rem 1.25rem 1rem',
                    background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255,255,255,0.12)',
                    position: 'sticky', top: 0, zIndex: 10,
                    flexShrink: 0,
                }}>
                    <button onClick={() => setStep('language')} style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        border: '1.5px solid rgba(255,255,255,0.35)',
                        background: 'rgba(255,255,255,0.15)',
                        color: '#fff', fontSize: '1.1rem', cursor: 'pointer', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>←</button>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>{t.selectLesson}</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>{t.lessonSub}</p>
                    </div>
                </div>

                {/* Lesson cards */}
                <div style={{ padding: '1rem 1.25rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '540px', alignSelf: 'center', boxSizing: 'border-box' }}>
                    {lessons.map((lesson) => {
                        const hasQ = lesson.questions.length > 0;
                        const isSyncing = loadingLessons && !hasQ;

                        return (
                            <button key={lesson.id} onClick={() => startLesson(lesson)} disabled={!hasQ} style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '0.85rem 1rem',
                                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '18px',
                                cursor: hasQ ? 'pointer' : 'not-allowed', textAlign: 'left',
                                width: '100%', opacity: hasQ ? 1 : 0.45,
                                transition: 'all 0.22s ease', boxSizing: 'border-box',
                            }}>
                                {/* L-number thumbnail (instead of emoji/image) */}
                                <div style={{
                                    width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                                    background: 'rgba(255,255,255,0.15)',
                                    border: '1.5px solid rgba(255,255,255,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.4rem', fontWeight: 800, color: '#fff',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                }}>
                                    {lesson.id}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{lesson.name}</div>
                                    <div style={{ fontSize: '0.78rem', color: isSyncing ? 'rgba(255,255,255,0.45)' : (hasQ ? 'rgba(255,255,255,0.65)' : 'rgba(255,120,120,0.9)') }}>
                                        {isSyncing ? "Syncing..." : (hasQ ? `${lesson.questions.length} ${t.questions}` : t.noQuestions)}
                                    </div>
                                </div>
                                <span style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.4)' }}>›</span>
                            </button>
                        );
                    })}
                </div>
            </FullScreen>
        );
    }

    // ── QUIZ — Full-screen L-image, transparent content ──
    if (step === 'quiz') {
        const question = selectedLesson.questions[qIndex];
        const total = selectedLesson.questions.length;
        const qText = locText(question.text, lang);
        const img = LESSON_IMAGES[selectedLesson.id];

        return (
            <>
                {/* Fixed background image */}
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 40,
                    background: img ? `url(${img}) center/cover` : '#0f0f1a',
                }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
                </div>

                {/* Fixed transparent content layer */}
                <div className="desktop-quiz-container-wrapper" style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
                    <div className="desktop-quiz-container" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        {/* Top bar */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '1rem 1.25rem',
                            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
                        }}>
                            <button onClick={resetToLessons} style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>←</button>
                            <span style={{ flex: 1, textAlign: 'center', fontWeight: 600, color: '#fff', fontSize: '0.95rem', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{selectedLesson.name}</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.65rem', borderRadius: '8px' }}>{qIndex + 1}/{total}</span>
                        </div>

                        {/* Progress */}
                        <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(0,0,0,0.15)', flexShrink: 0 }}>
                            <div style={{ height: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${((qIndex + 1) / total) * 100}%`, background: 'linear-gradient(90deg,#818cf8,#c084fc)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
                            </div>
                        </div>

                        {/* Quiz body — centred, gaps */}
                        <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '600px', alignSelf: 'center', boxSizing: 'border-box' }}>

                            {/* Question card — fully transparent */}
                            <div style={{
                                background: 'transparent',
                                borderBottom: '1px solid rgba(255,255,255,0.15)',
                                paddingBottom: '1rem', marginBottom: '0.25rem',
                            }}>
                                <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    {t.question} {qIndex + 1} {t.of} {total}
                                </p>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff', lineHeight: 1.55, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>{qText}</h3>
                            </div>

                            {/* Options — glass transparent */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                {question.options.map((opt, i) => {
                                    let bg = 'transparent';
                                    let border = 'rgba(255,255,255,0.3)';
                                    let color = '#fff';
                                    if (answered) {
                                        if (i === selectedOption && opt.correct) { bg = 'rgba(34,197,94,0.2)'; border = '#22c55e'; }
                                        else if (i === selectedOption && !opt.correct) { bg = 'rgba(239,68,68,0.2)'; border = '#ef4444'; }
                                        else { bg = 'transparent'; border = 'rgba(255,255,255,0.15)'; color = 'rgba(255,255,255,0.4)'; }
                                    }
                                    return (
                                        <button key={i} onClick={() => handleAnswer(i)} disabled={answered} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.9rem',
                                            padding: '0.75rem 0.5rem',
                                            background: bg,
                                            border: 'none',
                                            borderBottom: `1px solid ${border}`,
                                            cursor: answered ? 'default' : 'pointer',
                                            transition: 'all 0.2s ease', width: '100%', textAlign: 'left',
                                            boxSizing: 'border-box',
                                        }}>
                                            <span style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'transparent', border: `1.5px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#fff', flexShrink: 0, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color, flex: 1, textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>{locText(opt.text, lang)}</span>
                                            {answered && i === selectedOption && opt.correct && <span style={{ fontSize: '1.1rem' }}>✓</span>}
                                            {answered && i === selectedOption && !opt.correct && <span style={{ fontSize: '1.1rem' }}>✗</span>}
                                        </button>
                                    );
                                })}
                            </div>

                            {feedback && (
                                <div className={`feedback-toast ${feedback}`}>
                                    {feedback === 'correct' ? `✅ ${t.correct}` : `❌ ${t.wrong}`}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ── RESULT — Same L-image fullscreen, transparent card ──
    if (step === 'result') {
        const { emoji, msg } = getResultEmoji();
        const total = selectedLesson.questions.length;
        const pct = Math.round((score / total) * 100);
        const img = LESSON_IMAGES[selectedLesson.id];

        return (
            <>
                {/* Fixed background */}
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 40,
                    background: img ? `url(${img}) center/cover` : '#0f0f1a',
                }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
                </div>

                {/* Fixed transparent result content */}
                <div className="desktop-quiz-container-wrapper" style={{ position: 'fixed', inset: 0, zIndex: 50, padding: window.innerWidth > 768 ? '2rem' : 0 }}>
                    <div className="desktop-quiz-container" style={{ overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', boxSizing: 'border-box' }}>
                        <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}>{emoji}</div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>{msg}</h2>
                            <p style={{ color: 'rgba(255,255,255,0.65)', margin: 0, fontSize: '0.9rem' }}>{selectedLesson.name}</p>

                            {/* Score ring — transparent bg */}
                            <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0.5rem 0' }}>
                                <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%' }}>
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="url(#rGrad)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${pct * 3.14} 314`} transform="rotate(-90 60 60)" />
                                    <defs>
                                        <linearGradient id="rGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#818cf8" />
                                            <stop offset="100%" stopColor="#c084fc" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{score}</span>
                                    <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', alignSelf: 'flex-end', marginBottom: '4px' }}>/{total}</span>
                                </div>
                            </div>
                            <p style={{ color: '#c4b5fd', fontWeight: 600, margin: 0, fontSize: '1rem' }}>{pct}% {t.yourScore}</p>

                            {/* Action buttons */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', marginTop: '0.75rem' }}>
                                <button onClick={generatePDF} style={{ padding: '0.9rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '14px', color: '#fff', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>
                                    📄 {t.downloadPdf}
                                </button>
                                <button onClick={resetToLessons} style={{ padding: '0.9rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>
                                    📚 {t.backToLessons}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return null;
}

