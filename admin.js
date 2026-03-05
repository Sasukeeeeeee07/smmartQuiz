// admin.js

let adminPassword = '';

// DOM Elements
const loginView = document.getElementById('admin-login-view');
const dashboardView = document.getElementById('admin-dashboard-view');
const passwordInput = document.getElementById('admin-password-input');
const errorEl = document.getElementById('admin-error');
const tableBody = document.getElementById('scores-table-body');
const messageEl = document.getElementById('dashboard-message');

const sidebar = document.getElementById('admin-sidebar');
const mainContent = document.getElementById('admin-main');

async function handleAdminLogin() {
    const password = passwordInput.value.trim();

    if (!password) {
        showError("Please enter a password.");
        return;
    }

    adminPassword = password;
    errorEl.style.display = 'none';

    // Attempt to load dashboard to verify password
    await loadDashboardData();
}

async function loadDashboardData() {
    try {
        messageEl.textContent = "Loading data...";
        messageEl.style.display = 'block';
        tableBody.innerHTML = ''; // Clear table

        const response = await fetch(`/api/admin/scores?password=${encodeURIComponent(adminPassword)}`);
        const data = await response.json();

        if (!response.ok) {
            // Password was likely wrong
            showError(data.error || "Failed to authenticate.");
            return;
        }

        // Success
        showDashboard();
        renderTable(data);
        await loadLessonNames();
        await loadQuestionsForSelection();
        await loadGlobalSettings();

    } catch (err) {
        console.error("Error loading dashboard data:", err);
        showError("Error connecting to server.");
    }
}

function renderTable(scores) {
    if (!scores || scores.length === 0) {
        messageEl.textContent = "No quiz results found in the database.";
        return;
    }

    messageEl.style.display = 'none';

    // Language names mapping
    const langNames = { 'en': 'English', 'hi': 'Hindi', 'mr': 'Marathi' };

    scores.forEach(score => {
        const tr = document.createElement('tr');

        const dateObj = new Date(score.date);
        const dateString = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        tr.innerHTML = `
            <td>${dateString}</td>
            <td><strong>${score.name}</strong></td>
            <td>${score.email}</td>
            <td>${langNames[score.language] || score.language}</td>
            <td>Lesson ${score.lessonId}</td>
            <td>
                <span class="badge ${getScoreBadge(score.score, score.totalQuestions)}">
                    ${score.score} / ${score.totalQuestions}
                </span>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function getScoreBadge(score, total) {
    const pct = (score / total) * 100;
    if (pct >= 80) return 'badge-success';
    if (pct >= 50) return 'badge-warning';
    return 'badge-error';
}

function showDashboard() {
    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    sidebar.classList.remove('hidden');
    mainContent.style.marginLeft = 'var(--sidebar-width)';
    mainContent.style.width = 'calc(100% - var(--sidebar-width))';
}

function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
}

function logoutAdmin() {
    adminPassword = '';
    passwordInput.value = '';
    tableBody.innerHTML = '';

    dashboardView.classList.add('hidden');
    sidebar.classList.add('hidden');
    mainContent.style.marginLeft = '0';
    mainContent.style.width = '100%';
    loginView.classList.remove('hidden');
}

function switchTab(tabId) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const clickedItem = document.querySelector(`[onclick="switchTab('${tabId}')"]`) || document.getElementById(`nav-${tabId}`);
    if (clickedItem) clickedItem.classList.add('active');

    // Update content sections
    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });

    const activeSection = document.getElementById(`${tabId}-tab`);
    if (activeSection) {
        activeSection.classList.add('active');
        activeSection.classList.remove('hidden');
    }

    // Update Header title
    const titles = {
        'analytics': 'Analytics Overview',
        'lessons': 'Lesson Name Management',
        'questions': 'Question & Answer Editor',
        'settings': 'Global Application Settings'
    };
    document.getElementById('current-tab-title').textContent = titles[tabId] || 'Dashboard';
}

// Allow pressing enter to login
passwordInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        handleAdminLogin();
    }
});

// --- Lesson Management ---
async function loadLessonNames() {
    try {
        const response = await fetch('/api/lessons');
        const names = await response.json();

        const grid = document.getElementById('lesson-editor-grid');
        grid.innerHTML = ''; // Clear existing

        for (let i = 0; i < 9; i++) {
            const currentName = names[i] || `Lesson ${i + 1}`;

            const div = document.createElement('div');
            div.innerHTML = `
                <label style="display:block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 600;">Lesson ${i + 1}</label>
                <input type="text" id="lesson-input-${i}" class="input-modern" value="${currentName}" style="width: 100%;">
            `;
            grid.appendChild(div);
        }
    } catch (err) {
        console.error("Failed to load lesson names:", err);
    }
}

async function saveLessonNames() {
    const msgEl = document.getElementById('lesson-update-msg');
    msgEl.style.display = 'block';
    msgEl.style.color = 'var(--text-color)';
    msgEl.textContent = 'Saving...';

    // Gather all 9 names
    const newNames = [];
    for (let i = 0; i < 9; i++) {
        const input = document.getElementById(`lesson-input-${i}`);
        newNames.push(input.value.trim() || `Lesson ${i + 1}`);
    }

    try {
        const response = await fetch(`/api/admin/lessons?password=${encodeURIComponent(adminPassword)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ names: newNames })
        });

        const result = await response.json();

        if (response.ok) {
            msgEl.style.color = 'var(--success-color)';
            msgEl.textContent = 'Lesson names updated successfully! They will now appear on the main quiz.';
            setTimeout(() => { msgEl.style.display = 'none'; }, 4000);
        } else {
            msgEl.style.color = 'var(--error-color)';
            msgEl.textContent = result.error || 'Failed to update lesson names.';
        }
    } catch (err) {
        console.error("Failed to save lesson names:", err);
        msgEl.style.color = 'var(--error-color)';
        msgEl.textContent = 'Network error saving names.';
    }
}

// --- Question Management ---
let currentQuestionsState = [];

async function loadQuestionsForSelection() {
    const lang = document.getElementById('edit-language-select').value;
    const lessonId = parseInt(document.getElementById('edit-lesson-select').value);

    const container = document.getElementById('questions-editor-container');
    container.innerHTML = '<p style="text-align:center; padding: 2rem;">Loading questions...</p>';

    try {
        const response = await fetch(`/api/quiz-content/${lang}`);
        let allLessonData = [];
        if (response.ok) {
            allLessonData = await response.json();
        }

        const lessonData = allLessonData.find(d => d.lessonId === lessonId);

        if (lessonData && lessonData.questions) {
            currentQuestionsState = JSON.parse(JSON.stringify(lessonData.questions));
        } else {
            // Fallback to data.js
            const fallbackLangData = quizData[lang];
            const fallbackLessonData = fallbackLangData?.lessons.find(l => l.id === lessonId);
            if (fallbackLessonData) {
                currentQuestionsState = JSON.parse(JSON.stringify(fallbackLessonData.questions));
            } else {
                currentQuestionsState = [{ text: '', options: ['', '', '', ''], correctIndex: 0 }];
            }
        }

        renderQuestionEditor();
    } catch (err) {
        console.error("Failed to load questions:", err);
        container.innerHTML = '<p style="color:var(--error-color); text-align:center; padding: 2rem;">Error loading questions. Is the server running?</p>';
    }
}

function renderQuestionEditor() {
    const container = document.getElementById('questions-editor-container');
    container.innerHTML = '';

    if (currentQuestionsState.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">No questions yet. Click "Add New Question" to start.</p>';
        return;
    }

    currentQuestionsState.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.dataset.index = index;

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h4 style="margin:0;">Question ${index + 1}</h4>
                <button class="btn-secondary" onclick="removeQuestionSlot(${index})" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; border-color: #fee2e2; color: #b91c1c;">Remove</button>
            </div>
            
            <div class="form-group" style="margin-bottom: 1.5rem;">
                <label>Question Text</label>
                <input type="text" class="input-modern q-text" value="${escapeHtml(q.text)}" style="width: 100%;" onchange="updateQuestionData(${index}, 'text', this.value)">
            </div>
            
            <div class="form-grid" style="margin-bottom: 1.5rem;">
                <div class="form-group">
                    <label>Option 1</label>
                    <input type="text" class="input-modern q-opt-0" value="${escapeHtml(q.options[0] || '')}" onchange="updateOptionData(${index}, 0, this.value)">
                </div>
                <div class="form-group">
                    <label>Option 2</label>
                    <input type="text" class="input-modern q-opt-1" value="${escapeHtml(q.options[1] || '')}" onchange="updateOptionData(${index}, 1, this.value)">
                </div>
                <div class="form-group">
                    <label>Option 3</label>
                    <input type="text" class="input-modern q-opt-2" value="${escapeHtml(q.options[2] || '')}" onchange="updateOptionData(${index}, 2, this.value)">
                </div>
                <div class="form-group">
                    <label>Option 4</label>
                    <input type="text" class="input-modern q-opt-3" value="${escapeHtml(q.options[3] || '')}" onchange="updateOptionData(${index}, 3, this.value)">
                </div>
            </div>
            
            <div class="form-group" style="max-width: 200px;">
                <label>Correct Answer</label>
                <select class="input-modern q-correct" onchange="updateQuestionData(${index}, 'correctIndex', parseInt(this.value))">
                    <option value="0" ${q.correctIndex === 0 ? 'selected' : ''}>Option 1</option>
                    <option value="1" ${q.correctIndex === 1 ? 'selected' : ''}>Option 2</option>
                    <option value="2" ${q.correctIndex === 2 ? 'selected' : ''}>Option 3</option>
                    <option value="3" ${q.correctIndex === 3 ? 'selected' : ''}>Option 4</option>
                </select>
            </div>
        `;
        container.appendChild(card);
    });
}

function addNewQuestionSlot() {
    currentQuestionsState.push({
        text: '',
        options: ['', '', '', ''],
        correctIndex: 0
    });
    renderQuestionEditor();
}

function removeQuestionSlot(index) {
    currentQuestionsState.splice(index, 1);
    renderQuestionEditor();
}

function updateQuestionData(index, field, value) {
    currentQuestionsState[index][field] = value;
}

function updateOptionData(index, optIndex, value) {
    currentQuestionsState[index].options[optIndex] = value;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function saveQuestions() {
    const lang = document.getElementById('edit-language-select').value;
    const lessonId = parseInt(document.getElementById('edit-lesson-select').value);

    const msgEl = document.getElementById('questions-update-msg');
    msgEl.style.display = 'block';
    msgEl.style.color = 'inherit';
    msgEl.textContent = 'Saving questions...';

    const payload = {
        language: lang,
        lessonId: lessonId,
        questions: currentQuestionsState
    };

    try {
        const response = await fetch(`/api/admin/quiz-content?password=${encodeURIComponent(adminPassword)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            msgEl.style.color = 'var(--success-color)';
            msgEl.textContent = 'Questions saved successfully!';
            setTimeout(() => { msgEl.style.display = 'none'; }, 4000);
        } else {
            msgEl.style.color = 'var(--error-color)';
            msgEl.textContent = result.error || 'Failed to save questions.';
        }
    } catch (err) {
        console.error("Failed to save questions:", err);
        msgEl.style.color = 'var(--error-color)';
        msgEl.textContent = 'Network error saving questions.';
    }
}

// --- Global Settings ---
async function loadGlobalSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();

        document.getElementById('setting-event-name').value = settings.eventName || '';
        document.getElementById('setting-points').value = settings.pointsPerQuestion || 10;
        document.getElementById('setting-passing').value = settings.passingScore * 10 || 80;
    } catch (err) {
        console.error("Failed to load settings:", err);
    }
}

async function saveGlobalSettings() {
    const msgEl = document.getElementById('settings-update-msg');
    const eventName = document.getElementById('setting-event-name').value.trim();
    const points = parseInt(document.getElementById('setting-points').value);
    const passing = parseInt(document.getElementById('setting-passing').value) / 10; // Convert 80% to 8

    msgEl.textContent = 'Saving...';
    msgEl.style.color = 'inherit';

    try {
        const response = await fetch(`/api/admin/settings?password=${encodeURIComponent(adminPassword)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventName,
                pointsPerQuestion: points,
                passingScore: passing
            })
        });

        if (response.ok) {
            msgEl.style.color = 'var(--success-color)';
            msgEl.textContent = 'Settings updated!';
            setTimeout(() => { msgEl.textContent = ''; }, 3000);
        } else {
            const data = await response.json();
            msgEl.style.color = 'var(--error-color)';
            msgEl.textContent = data.error || 'Failed to save.';
        }
    } catch (err) {
        msgEl.style.color = 'var(--error-color)';
        msgEl.textContent = 'Error saving.';
    }
}

async function updateAdminPassword() {
    const msgEl = document.getElementById('password-update-msg');
    const newPass = document.getElementById('setting-new-password').value;
    const confirmPass = document.getElementById('setting-confirm-password').value;

    if (!newPass || newPass !== confirmPass) {
        msgEl.style.color = 'var(--error-color)';
        msgEl.textContent = 'Passwords do not match or are empty.';
        return;
    }

    msgEl.textContent = 'Updating...';

    try {
        const response = await fetch(`/api/admin/settings?password=${encodeURIComponent(adminPassword)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newAdminPassword: newPass })
        });

        if (response.ok) {
            msgEl.style.color = 'var(--success-color)';
            msgEl.textContent = 'Password changed! Please login again with your new password.';
            setTimeout(() => { logoutAdmin(); }, 2000);
        } else {
            const data = await response.json();
            msgEl.style.color = 'var(--error-color)';
            msgEl.textContent = data.error || 'Failed to update.';
        }
    } catch (err) {
        msgEl.style.color = 'var(--error-color)';
        msgEl.textContent = 'Error updating.';
    }
}
