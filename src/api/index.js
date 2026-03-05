// ─── Base URL (proxied by Vite to http://localhost:5001) ──────────────────────
const API_BASE = '/api';

// ─── Languages ────────────────────────────────────────────────────────────────


export const getLanguages = async () => {
    const response = await fetch(`/api/languages`);
    if (!response.ok) throw new Error('Failed to fetch languages');
    return response.json();
};

export const saveLanguages = async (password, languages) => {
    const response = await fetch(`/api/admin/languages?password=${password}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ languages }),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save languages');
    }
    return response.json();
};

// ─── Quiz Config (React Admin schema) ────────────────────────────────────────

export const getAllData = async () => {
    const response = await fetch(`${API_BASE}/all-data`);
    if (!response.ok) throw new Error('Failed to fetch data');
    return response.json();
};

export const saveData = async (data) => {
    const response = await fetch(`${API_BASE}/all-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to save data');
    return response.json();
};

// ─── Quiz Content (per language/lesson) ──────────────────────────────────────

export const getQuizContent = async (language) => {
    const response = await fetch(`${API_BASE}/quiz-content/${language}`);
    if (!response.ok) throw new Error('Failed to fetch quiz content');
    return response.json();
};

export const saveQuizContent = async (password, language, lessonId, questions) => {
    const response = await fetch(`${API_BASE}/admin/quiz-content?password=${password}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, lessonId, questions }),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save quiz content');
    }
    return response.json();
};

// ─── Lesson Names ─────────────────────────────────────────────────────────────

export const getLessons = async (lang = 'en') => {
    const response = await fetch(`${API_BASE}/lessons?lang=${lang}`);
    if (!response.ok) throw new Error('Failed to fetch lessons');
    return response.json();
};

export const saveLessons = async (password, names, language = 'en') => {
    const response = await fetch(`${API_BASE}/admin/lessons?password=${password}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names, language }),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save lessons');
    }
    return response.json();
};

// ─── Scores ───────────────────────────────────────────────────────────────────

export const getAllScores = async (password) => {
    const response = await fetch(`${API_BASE}/admin/scores?password=${password}`);
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch scores');
    }
    return response.json();
};

// ─── Settings ─────────────────────────────────────────────────────────────────

export const getSettings = async () => {
    const response = await fetch(`${API_BASE}/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
};

export const saveSettings = async (password, settings) => {
    const response = await fetch(`${API_BASE}/admin/settings?password=${password}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save settings');
    }
    return response.json();
};

// ─── File Upload ──────────────────────────────────────────────────────────────

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
};
