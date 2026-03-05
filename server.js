require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const logStream = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
const log = (msg) => {
    const time = new Date().toISOString();
    console.log(`[${time}] ${msg}`);
    logStream.write(`[${time}] ${msg}\n`);
};

const app = express();
const PORT = process.env.PORT || 3000;
const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the root and uploads directory
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection (Safe Start)
let isDbConnected = false;

// Check both typical env variables names
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (mongoUri && mongoUri.startsWith('mongodb')) {
    mongoose.connect(mongoUri, {
        tls: true,
        tlsAllowInvalidCertificates: false // Try true if it still fails locally, but usually false is better for Atlas
    })
        .then(() => {
            console.log('Successfully connected to MongoDB.');
            isDbConnected = true;
        })
        .catch((error) => console.error('Error connecting to MongoDB:', error.message));
} else {
    console.warn('⚠️ MONGODB_URI missing or invalid. Starting server without Database connection.');
}

// Define Mongoose Schema & Model for Scores
const scoreSchema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    language: { type: String, required: true },
    lessonId: { type: Number, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, default: 10 },
    answers: { type: Array, default: [] },
    date: { type: Date, default: Date.now }
});
const Score = mongoose.model('Score', scoreSchema);

// Define Mongoose Schema & Model for Progress Tracking
const progressSchema = new mongoose.Schema({
    email: { type: String, required: true },
    lessonId: { type: Number, required: true },
    language: { type: String, required: true },
    qIndex: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    answers: { type: Array, default: [] },
    completed: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
});
progressSchema.index({ email: 1, lessonId: 1, language: 1 }, { unique: true });
const Progress = mongoose.model('Progress', progressSchema);

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Define Mongoose Schema & Model for Lesson Configuration
const lessonConfigSchema = new mongoose.Schema({
    language: { type: String, default: 'en', unique: true },
    names: {
        type: [String],
        default: [
            "Lesson 1", "Lesson 2", "Lesson 3",
            "Lesson 4", "Lesson 5", "Lesson 6",
            "Lesson 7", "Lesson 8", "Lesson 9"
        ]
    }
});
const LessonConfig = mongoose.model('LessonConfig', lessonConfigSchema);

// Define Mongoose Schema & Model for Quiz Content
const questionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true }
});

const quizContentSchema = new mongoose.Schema({
    language: { type: String, required: true }, // 'en', 'hi', 'mr'
    lessonId: { type: Number, required: true }, // 1 to 9
    questions: { type: [questionSchema], required: true }
});

// Ensure combination of language and lessonId is unique
quizContentSchema.index({ language: 1, lessonId: 1 }, { unique: true });

const QuizContent = mongoose.model('QuizContent', quizContentSchema);

// Define Mongoose Schema & Model for Global Settings
const globalSettingsSchema = new mongoose.Schema({
    eventName: { type: String, default: "Smmart - Incharge vs Incontrol" },
    pointsPerQuestion: { type: Number, default: 10 },
    passingScore: { type: Number, default: 8 },
    adminPassword: { type: String, default: DEFAULT_ADMIN_PASS }
});

const GlobalSettings = mongoose.model('GlobalSettings', globalSettingsSchema);

// Define Mongoose Schema & Model for Language Config
const languageConfigSchema = new mongoose.Schema({
    languages: [{
        code: { type: String, required: true },
        name: { type: String, required: true },
        active: { type: Boolean, default: true }
    }]
});
const LanguageConfig = mongoose.model('LanguageConfig', languageConfigSchema);

// --- NEW REACT-COMPATIBLE SCHEMA ---
const quizConfigSchema = new mongoose.Schema({
    questions: [{
        id: { type: Number },
        lessonId: { type: Number, default: 1 },
        text: { type: Object, default: {} }, // {en: "", hi: ""}
        options: [{
            text: { type: Object, default: {} },
            points: { type: Number, default: 0 }
        }]
    }],
    scoringRules: { type: Array, default: [] },
    settings: {
        eventName: { type: String, default: "Smmart - Incharge vs Incontrol" },
        sessionName: { type: String, default: "" },
        logoUrl: { type: String, default: "" },
        showLogo: { type: Boolean, default: true },
        colors: {
            primary: { type: String, default: '#6366f1' },
            secondary: { type: String, default: '#ec4899' },
            text: { type: String, default: '#1e293b' },
            buttonText: { type: String, default: '#ffffff' },
            cardBg: { type: String, default: '#ffffff' },
            background: { type: String, default: '#f8fafc' }
        },
        showSplashScreen: { type: Boolean, default: true },
        splashDuration: { type: Number, default: 3000 },
        languages: {
            type: Array, default: [
                { code: 'en', name: 'English', active: true },
                { code: 'hi', name: 'Hindi', active: true }
            ]
        },
        welcomeMessage: { type: Object, default: {} },
        footerText: { type: Object, default: {} },
        maxPoints: { type: Number, default: 100 },
        uiLabels: { type: Object, default: {} }
    },
    updatedAt: { type: Date, default: Date.now }
});

const QuizConfig = mongoose.model('QuizConfig', quizConfigSchema);


// ==========================================
// API Routes
// ==========================================

// 1. User Register Route
app.post('/api/register', async (req, res) => {
    try {
        if (!isDbConnected) {
            return res.status(503).json({ error: 'Database is not connected. Registration disabled.' });
        }

        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const user = new User({ name, email, password });
        await user.save();

        res.status(201).json({ message: 'Account created successfully!', name: user.name, email: user.email });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// 2. User Login Route
app.post('/api/login', async (req, res) => {
    try {
        if (!isDbConnected) {
            return res.status(503).json({ error: 'Database is not connected. Login disabled.' });
        }

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'No account found with this email. Please sign up first.' });
        }
        if (user.password !== password) {
            return res.status(401).json({ error: 'Incorrect password. Please try again.' });
        }

        res.status(200).json({ message: 'Login successful', name: user.name, email: user.email });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});


// 2. Save Score Route
app.post('/api/scores', async (req, res) => {
    try {
        const { email, name, language, lessonId, score, totalQuestions, answers } = req.body;

        // Basic validation
        if (!email || !name || !language || lessonId === undefined || score === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!isDbConnected) {
            return res.status(503).json({ error: 'Database is not connected. Score tracking is disabled.' });
        }

        const newScore = new Score({ email, name, language, lessonId, score, totalQuestions, answers });
        await newScore.save();

        res.status(201).json({ message: 'Score saved successfully!', data: newScore });
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({ error: 'Failed to save score' });
    }
});

// 3. User Specific Scores Route
app.get('/api/scores/:email', async (req, res) => {
    try {
        if (!isDbConnected) return res.status(503).json({ error: 'Database is not connected.' });

        const scores = await Score.find({ email: req.params.email }).sort({ date: -1 });
        res.status(200).json(scores);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch scores' });
    }
});

// 3b. Progress Routes (Resuming Quiz)
app.get('/api/progress/:email/latest', async (req, res) => {
    try {
        if (!isDbConnected) return res.status(503).json({ error: 'Database disconnected' });
        const progress = await Progress.findOne({ email: req.params.email }).sort({ updatedAt: -1 });
        res.status(200).json(progress || null);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/api/progress/:email/:language/:lessonId', async (req, res) => {
    try {
        if (!isDbConnected) return res.status(503).json({ error: 'Database disconnected' });
        const { email, language, lessonId } = req.params;
        const progress = await Progress.findOne({ email, language, lessonId: Number(lessonId) });
        res.status(200).json(progress || { qIndex: 0, score: 0, answers: [] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

app.post('/api/progress', async (req, res) => {
    try {
        if (!isDbConnected) return res.status(503).json({ error: 'Database disconnected' });
        const { email, language, lessonId, qIndex, score, answers } = req.body;
        if (!email) return res.status(400).json({ error: 'Email required' });

        await Progress.findOneAndUpdate(
            { email, language, lessonId: Number(lessonId) },
            { qIndex, score, answers, updatedAt: Date.now() },
            { upsert: true, new: true }
        );
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Save progress error:', error);
        res.status(500).json({ error: 'Failed to save progress' });
    }
});

app.delete('/api/progress/:email/:language/:lessonId', async (req, res) => {
    try {
        if (!isDbConnected) return res.status(503).json({ error: 'Database disconnected' });
        const { email, language, lessonId } = req.params;
        await Progress.deleteOne({ email, language, lessonId: Number(lessonId) });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear progress' });
    }
});

// Helper to check admin password against DB configuration or env fallback
const verifyAdminPassword = async (provided) => {
    if (!provided) return false;
    const trimmed = provided.trim();
    try {
        const settings = await GlobalSettings.findOne();
        const currentPass = (settings && settings.adminPassword) ? settings.adminPassword : DEFAULT_ADMIN_PASS;
        return trimmed === currentPass;
    } catch (err) {
        console.error(`Auth verification error: ${err.message}`);
        return trimmed === DEFAULT_ADMIN_PASS;
    }
};

// 4. Admin Scores Route (Protected)
app.get('/api/admin/scores', async (req, res) => {
    try {
        if (!isDbConnected) {
            return res.status(503).json({ error: 'Database is not connected.' });
        }

        // Simple auth check via hardcoded password password
        // Normally this would be a secure token, but keeping it simple as requested
        const providedPassword = req.query.password || req.headers.authorization?.split(' ')[1];

        if (!(await verifyAdminPassword(providedPassword))) {
            return res.status(401).json({ error: 'Unauthorized: Invalid Admin Password' });
        }

        const allScores = await Score.find().sort({ date: -1 });
        res.status(200).json(allScores);

    } catch (error) {
        console.error('Error fetching all scores for admin:', error);
        res.status(500).json({ error: 'Failed to fetch all scores' });
    }
});

// 4b. Get Available Languages (Public)
app.get('/api/languages', async (req, res) => {
    try {
        const DEFAULT_LANGS = [
            { code: 'en', name: 'English', active: true },
            { code: 'hi', name: 'Hindi', active: true }
        ];
        if (!isDbConnected) return res.status(200).json(DEFAULT_LANGS);

        let config = await LanguageConfig.findOne();
        if (!config) {
            config = new LanguageConfig({ languages: DEFAULT_LANGS });
            await config.save();
        }
        res.status(200).json(config.languages);
    } catch (error) {
        console.error('Error fetching languages:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// 4c. Update Available Languages (Admin Protected)
app.post('/api/admin/languages', async (req, res) => {
    try {
        if (!isDbConnected) return res.status(503).json({ error: 'Database not connected.' });

        const providedPassword = req.query.password || req.headers.authorization?.split(' ')[1];
        if (!(await verifyAdminPassword(providedPassword))) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { languages } = req.body;
        if (!Array.isArray(languages) || languages.length === 0) {
            return res.status(400).json({ error: 'Must provide at least one language.' });
        }

        let config = await LanguageConfig.findOne();
        if (!config) config = new LanguageConfig();
        config.languages = languages;
        await config.save();

        res.status(200).json({ message: 'Languages updated successfully!' });
    } catch (error) {
        console.error('Error updating languages:', error);
        res.status(500).json({ error: 'Update failed' });
    }
});

// 5. Get Custom Lesson Names
app.get('/api/lessons', async (req, res) => {
    try {
        const { lang = 'en' } = req.query;
        if (!isDbConnected) {
            return res.status(200).json(["Lesson 1", "Lesson 2", "Lesson 3", "Lesson 4", "Lesson 5", "Lesson 6", "Lesson 7", "Lesson 8", "Lesson 9"]);
        }

        let config = await LessonConfig.findOne({ language: lang });
        if (!config) {
            config = new LessonConfig({ language: lang });
            await config.save();
        }
        res.status(200).json(config.names);
    } catch (error) {
        console.error('Error fetching lesson config:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// 6. Admin Update Lesson Names Route (Protected)
app.post('/api/admin/lessons', async (req, res) => {
    try {
        if (!isDbConnected) {
            return res.status(503).json({ error: 'Database is not connected.' });
        }

        const providedPassword = req.query.password || req.headers.authorization?.split(' ')[1];
        if (!(await verifyAdminPassword(providedPassword))) {
            return res.status(401).json({ error: 'Unauthorized: Invalid Admin Password' });
        }

        const { names, language = 'en' } = req.body;
        if (!Array.isArray(names) || names.length !== 9) {
            return res.status(400).json({ error: 'Must provide exactly 9 lesson names.' });
        }

        let config = await LessonConfig.findOne({ language });
        if (!config) {
            config = new LessonConfig({ language });
        }
        config.names = names;
        await config.save();

        res.status(200).json({ message: 'Lesson names updated successfully!' });
    } catch (error) {
        console.error('Error updating lesson names:', error);
        res.status(500).json({ error: 'Update failed' });
    }
});

// 7. Get Quiz Content (Questions)
app.get('/api/quiz-content/:language', async (req, res) => {
    try {
        if (!isDbConnected) {
            return res.status(503).json({ error: 'Database is not connected.' });
        }
        const { language } = req.params;
        const quizContent = await QuizContent.find({ language });
        res.status(200).json(quizContent);
    } catch (error) {
        console.error('Error fetching quiz content:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// 8. Admin Update Quiz Content (Protected)
app.post('/api/admin/quiz-content', async (req, res) => {
    try {
        if (!isDbConnected) {
            return res.status(503).json({ error: 'Database is not connected.' });
        }

        const providedPassword = req.query.password || req.headers.authorization?.split(' ')[1];
        if (!(await verifyAdminPassword(providedPassword))) {
            return res.status(401).json({ error: 'Unauthorized: Invalid Admin Password' });
        }

        const { language, lessonId, questions } = req.body;

        if (!language || typeof lessonId !== 'number' || !Array.isArray(questions) || questions.length < 1) {
            return res.status(400).json({ error: 'Invalid payload. Must provide language, lessonId, and at least 1 question.' });
        }

        // Validate structure of questions roughly
        for (let q of questions) {
            if (!q.text || !Array.isArray(q.options) || q.options.length < 2 || typeof q.correctIndex !== 'number') {
                return res.status(400).json({ error: 'Invalid question format. Each question needs text, at least 2 options, and a correctIndex.' });
            }
        }

        let content = await QuizContent.findOne({ language, lessonId });
        if (!content) {
            content = new QuizContent({ language, lessonId, questions });
        } else {
            content.questions = questions;
        }

        await content.save();

        res.status(200).json({ message: 'Quiz content updated successfully!' });
    } catch (error) {
        console.error('Error updating quiz content:', error);
        res.status(500).json({ error: 'Update failed' });
    }
});

// 9. Get Global Settings
app.get('/api/settings', async (req, res) => {
    try {
        if (!isDbConnected) {
            return res.status(200).json({
                eventName: "Smmart - Incharge vs Incontrol",
                pointsPerQuestion: 10,
                passingScore: 8
            });
        }
        let settings = await GlobalSettings.findOne();
        if (!settings) {
            settings = new GlobalSettings();
            await settings.save();
        }
        // Don't leak the password in the public settings route
        const { adminPassword, ...publicSettings } = settings.toObject();
        res.status(200).json(publicSettings);
    } catch (error) {
        console.error('Error fetching global settings:', error);
        res.status(500).json({ error: 'Failed' });
    }
});

// 10. Update Global Settings (Protected)
app.post('/api/admin/settings', async (req, res) => {
    try {
        if (!isDbConnected) return res.status(503).json({ error: 'Database is not connected.' });

        const providedPassword = req.query.password || req.headers.authorization?.split(' ')[1];

        let settings = await GlobalSettings.findOne();
        if (!settings) {
            settings = new GlobalSettings();
            await settings.save();
        }

        // Auth check against dynamic password in DB, or env fallback
        if (!(await verifyAdminPassword(providedPassword))) {
            return res.status(401).json({ error: 'Unauthorized: Invalid Admin Password' });
        }

        const { eventName, pointsPerQuestion, passingScore, newAdminPassword } = req.body;

        if (eventName) settings.eventName = eventName;
        if (typeof pointsPerQuestion === 'number') settings.pointsPerQuestion = pointsPerQuestion;
        if (typeof passingScore === 'number') settings.passingScore = passingScore;
        if (newAdminPassword) settings.adminPassword = newAdminPassword;

        await settings.save();
        res.status(200).json({ message: 'Settings updated successfully!' });
    } catch (error) {
        console.error('Error updating global settings:', error);
        res.status(500).json({ error: 'Update failed' });
    }
});

// --- NEW REACT-COMPATIBLE API ROUTES ---

// 11. Get All Quiz Data (React Admin)
app.get('/api/all-data', async (req, res) => {
    try {
        if (!isDbConnected) {
            return res.status(200).json({
                questions: [],
                scoringRules: [],
                settings: {
                    eventName: "Smmart - Incharge vs Incontrol",
                    languages: [
                        { code: 'en', name: 'English', active: true },
                        { code: 'hi', name: 'Hindi', active: true }
                    ],
                    colors: { primary: '#6366f1', secondary: '#ec4899' },
                    uiLabels: {
                        en: { startBtn: "Start Quiz", nextBtn: "Next", submitBtn: "Submit", downloadBtn: "Download PDF", homeBtn: "Back to Home", selectLanguage: "Select Language" },
                        hi: { startBtn: "क्विज़ शुरू करें", nextBtn: "अगला", submitBtn: "जमा करें", downloadBtn: "पीडीएफ डाउनलोड करें", homeBtn: "होम पर वापस जाएं", selectLanguage: "भाषा चुनें" }
                    }
                }
            });
        }
        let config = await QuizConfig.findOne();
        if (!config) {
            config = new QuizConfig();
            await config.save();
        }
        res.status(200).json(config);
    } catch (error) {
        log(`Error fetching quiz data: ${error.stack}`);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

// 14. Get Public Config (Quiz Frontend)
app.get('/api/config', async (req, res) => {
    try {
        if (!isDbConnected) return res.status(503).json({ error: 'Database is not connected.' });
        const config = await QuizConfig.findOne();
        res.status(200).json(config);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

// 12. Update All Quiz Data (React Admin)
app.post('/api/all-data', async (req, res) => {
    try {
        if (!isDbConnected) return res.status(503).json({ error: 'Database is not connected.' });

        const data = req.body;
        let config = await QuizConfig.findOne();
        if (!config) {
            config = new QuizConfig(data);
        } else {
            // Update fields manually or via spread
            config.questions = data.questions || config.questions;
            config.scoringRules = data.scoringRules || config.scoringRules;
            config.settings = data.settings || config.settings;
            config.updatedAt = Date.now();
        }

        await config.save();
        res.status(200).json({ success: true, message: 'Configuration saved!' });
    } catch (error) {
        log(`Error saving quiz data: ${error.stack}`);
        res.status(500).json({ error: 'Failed to save', details: error.message });
    }
});

// 13. File Upload Route
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }
        // Generate public URL
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.status(200).json({ success: true, fileUrl: fileUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Fallback route to serve index.html for undefined routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});