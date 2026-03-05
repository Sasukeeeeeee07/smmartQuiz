// script.js

// State Management
const state = {
    language: null,
    username: null,
    userEmail: null,
    lesson: null,
    currentQuestionIndex: 0,
    score: 0,
    customLessonNames: [],
    customQuestions: [], // Store dynamic questions for the active lesson
    settings: {
        eventName: "smmart - Incharge vs Incontrol",
        pointsPerQuestion: 10,
        passingScore: 8
    }
};

// DOM Elements
const appContainer = document.getElementById('app-container');

// Initialization
async function init() {
    await loadSettings();
    renderLanguageSelection();
}

async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        if (response.ok) {
            state.settings = await response.json();
        }
    } catch (err) {
        console.error("Failed to load settings:", err);
    }
}

// Render Functions
function renderLanguageSelection() {
    let html = `
        <div class="view fade-in" id="language-view">
            <h1 style="margin-bottom: 0.5rem;">${state.settings.eventName}</h1>
            <p style="text-align: center; color: var(--text-muted); margin-bottom: 2rem;">Select Language to Begin</p>
            <div class="options-container">
                <button class="btn-primary" onclick="selectLanguage('en')">English</button>
                <button class="btn-primary" onclick="selectLanguage('hi')">हिंदी (Hindi)</button>
                <button class="btn-primary" onclick="selectLanguage('mr')">मराठी (Marathi)</button>
            </div>
        </div>
    `;
    appContainer.innerHTML = html;
}

function selectLanguage(langId) {
    state.language = langId;
    renderLogin();
}

function renderLogin() {
    let html = `
        <div class="view fade-in" id="login-view">
            <h2>Login</h2>
            <div class="options-container" style="align-items: center;">
                <input type="email" id="email-input" class="input-modern" placeholder="Email Address" />
                <input type="password" id="password-input" class="input-modern mt-4" placeholder="Password" />
                <button class="btn-primary mt-4" style="width: 100%; max-width: 300px;" onclick="handleLogin()">Login / Register</button>
            </div>
            <p id="login-error" style="color: var(--error-color); margin-top: 10px; display: none; text-align: center;"></p>
            <button class="btn-secondary mt-4" onclick="init()">Back</button>
        </div>
    `;
    appContainer.innerHTML = html;
}

async function handleLogin() {
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const errorEl = document.getElementById('login-error');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        errorEl.textContent = "Please enter both email and password.";
        errorEl.style.display = 'block';
        return;
    }

    errorEl.style.display = 'none';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            errorEl.textContent = data.error || "Login failed.";
            errorEl.style.display = 'block';
        } else {
            // Success
            state.username = data.name || email.split('@')[0]; // Use prefix if name not provided
            state.userEmail = email;
            renderLessonSelection();
        }
    } catch (err) {
        console.error('Error connecting to backend:', err);
        errorEl.textContent = "Error connecting to server. Is it running?";
        errorEl.style.display = 'block';
    }
}

async function renderLessonSelection() {
    // Fetch custom lesson names if not already loaded
    if (state.customLessonNames.length === 0) {
        try {
            const response = await fetch('/api/lessons');
            const data = await response.json();
            if (response.ok && Array.isArray(data)) {
                state.customLessonNames = data;
            }
        } catch (err) {
            console.error("Failed to fetch lesson names", err);
            // fallback defaults
            state.customLessonNames = Array.from({ length: 9 }, (_, i) => `Lesson ${i + 1}`);
        }
    }

    const langData = quizData[state.language];
    let html = `
        <div class="view fade-in" id="lesson-view">
            <h2>${langData.greeting}, ${state.username}!</h2>
            <h3>Select a Lesson</h3>
            <div class="lesson-grid">
    `;

    langData.lessons.forEach((lesson, index) => {
        const customName = state.customLessonNames[index] || lesson.title;
        html += `<button class="btn-lesson" onclick="startLesson(${lesson.id})">${customName}</button>`;
    });

    html += `
            </div>
            <button class="btn-secondary mt-4" onclick="renderLanguageSelection()">Back</button>
        </div>
    `;
    appContainer.innerHTML = html;
}

async function startLesson(lessonId) {
    state.lesson = lessonId;
    state.currentQuestionIndex = 0;
    state.score = 0;

    // Fetch custom questions from the server
    try {
        const response = await fetch(`/api/quiz-content/${state.language}`);
        if (response.ok) {
            const allContent = await response.json();
            const lessonData = allContent.find(c => c.lessonId === lessonId);
            if (lessonData && lessonData.questions && Array.isArray(lessonData.questions)) { // Allow any number of questions, including zero for fallback
                state.customQuestions = lessonData.questions;
            } else {
                state.customQuestions = null; // Use fallback
            }
        }
    } catch (err) {
        console.error("Failed to fetch questions:", err);
        state.customQuestions = null; // Use fallback
    }

    renderQuestion();
}

function renderQuestion() {
    const langData = quizData[state.language];
    const staticLessonData = langData.lessons.find(l => l.id === state.lesson);

    // Choose between dynamic questions or static fallback
    const questionsList = state.customQuestions || staticLessonData.questions;
    const totalQuestions = questionsList.length;
    const question = questionsList[state.currentQuestionIndex];

    // Use custom title if available
    const customTitle = state.customLessonNames[state.lesson - 1] || staticLessonData.title;

    let html = `
        <div class="view fade-in" id="question-view">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(state.currentQuestionIndex / totalQuestions) * 100}%"></div>
            </div>
            <h3 class="question-title">${customTitle} - Question ${state.currentQuestionIndex + 1} of ${totalQuestions}</h3>
            <p class="question-text">${question.text}</p>
            <div class="options-container">
    `;

    question.options.forEach((opt, index) => {
        html += `<button class="btn-option option-btn" id="opt-${index}" onclick="handleAnswer(${index}, ${question.correctIndex})">${opt}</button>`;
    });

    html += `
            </div>
        </div>
    `;
    appContainer.innerHTML = html;
}

function handleAnswer(selectedIndex, correctIndex) {
    // Disable all buttons to prevent double clicking
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(btn => btn.disabled = true);

    const selectedBtn = document.getElementById(`opt-${selectedIndex}`);
    const correctBtn = document.getElementById(`opt-${correctIndex}`);

    if (selectedIndex === correctIndex) {
        state.score++;
        selectedBtn.classList.add('btn-correct');
    } else {
        selectedBtn.classList.add('btn-wrong');
        correctBtn.classList.add('btn-correct'); // Show the right answer
    }

    state.currentQuestionIndex++;

    const questionsList = state.customQuestions || quizData[state.language].lessons.find(l => l.id === state.lesson).questions;

    // Wait 1.5 seconds before moving on
    setTimeout(() => {
        if (state.currentQuestionIndex < questionsList.length) {
            renderQuestion();
        } else {
            renderResults();
        }
    }, 1500);
}

function renderResults() {
    const langData = quizData[state.language];
    const questionsList = state.customQuestions || langData.lessons.find(l => l.id === state.lesson).questions;
    const totalQuestions = questionsList.length;

    const totalPoints = state.settings.pointsPerQuestion * totalQuestions;
    const userPoints = state.score * state.settings.pointsPerQuestion;

    // Save score to backend (asynchronously)
    saveScoreToBackend(totalQuestions);

    let nextLessonBtn = '';
    if (state.lesson < 9) {
        nextLessonBtn = `<button class="btn-primary" onclick="startLesson(${state.lesson + 1})">Next Lesson</button>`;
    }

    let html = `
        <div class="view fade-in" id="result-view">
            <h2>Lesson Completed!</h2>
            <p class="score-text" style="color: var(--text-main); font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0;">${userPoints} / ${totalPoints} Points</p>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">Well done, ${state.username}. You correctly answered ${state.score} out of ${totalQuestions} questions.</p>
            <div class="action-buttons">
                <button class="btn-primary" onclick="downloadPDF()" style="background: linear-gradient(to right, #10b981, #059669);">Download PDF Result</button>
                ${nextLessonBtn}
                <button class="btn-secondary" onclick="renderLessonSelection()">Back to Lessons</button>
            </div>
        </div>
    `;
    appContainer.innerHTML = html;
}

async function saveScoreToBackend(totalNum) {
    if (!state.userEmail) return; // Only save if logged in

    try {
        const response = await fetch('/api/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: state.userEmail,
                name: state.username,
                language: state.language,
                lessonId: state.lesson,
                score: state.score,
                totalQuestions: totalNum
            }),
        });

        if (!response.ok) {
            console.error('Failed to save score backend: ', await response.text());
        }
    } catch (err) {
        console.error('Error contacting backend:', err);
    }
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Language names mapping for PDF
    const langNames = { 'en': 'English', 'hi': 'Hindi', 'mr': 'Marathi' };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // primary color
    doc.text("Quiz Completion Certificate", 105, 30, null, null, "center");

    doc.setFontSize(16);
    doc.setTextColor(31, 41, 55); // text color
    doc.setFont("helvetica", "normal");

    doc.text(`This is to certify that`, 105, 60, null, null, "center");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(`${state.username}`, 105, 80, null, null, "center");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text(`has successfully completed`, 105, 100, null, null, "center");

    doc.setFont("helvetica", "bold");
    doc.text(`Lesson ${state.lesson}: ${langNames[state.language]} Language`, 105, 115, null, null, "center");

    doc.setFont("helvetica", "normal");
    doc.text(`with a score of`, 105, 135, null, null, "center");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);

    const langData = quizData[state.language];
    const questionsList = state.customQuestions || langData.lessons.find(l => l.id === state.lesson).questions;
    const totalQuestions = questionsList.length;

    // Color score based on result
    const passThreshold = (state.settings.passingScore / 10) * totalQuestions;
    if (state.score >= passThreshold) doc.setTextColor(16, 185, 129); // green
    else if (state.score >= (totalQuestions / 2)) doc.setTextColor(236, 72, 153); // pink
    else doc.setTextColor(239, 68, 68); // red

    const totalPoints = state.settings.pointsPerQuestion * totalQuestions;
    const userPoints = state.score * state.settings.pointsPerQuestion;

    doc.text(`${userPoints} / ${totalPoints}`, 105, 155, null, null, "center");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text(`Correct Answers: ${state.score} / ${totalQuestions}`, 105, 170, null, null, "center");

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // muted text
    const date = new Date().toLocaleDateString();
    doc.text(`${state.settings.eventName}`, 105, 270, null, null, "center");
    doc.text(`Generated on: ${date}`, 105, 280, null, null, "center");

    doc.save(`Quiz_Result_${state.username.replace(/\s+/g, '_')}_L${state.lesson}.pdf`);
}

// Start the app
init();
