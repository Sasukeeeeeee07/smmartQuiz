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
    date: { type: Date, default: Date.now }
});
const Score = mongoose.model('Score', scoreSchema);

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Define Mongoose Schema & Model for Lesson Configuration
const lessonConfigSchema = new mongoose.Schema({
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
    adminPassword: { type: String, default: 'admin123' }
});

const GlobalSettings = mongoose.model('GlobalSettings', globalSettingsSchema);

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

// 1. User Login Route
app.post('/api/login', async (req, res) => {
    try {
        if (!isDbConnected) {
            return res.status(503).json({ error: 'Database is not connected. Login disabled.' });
        }

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password' });
        }

        let user = await User.findOne({ email });

        if (user) {
            // Check password
            if (user.password !== password) {
                return res.status(401).json({ error: 'Incorrect password.' });
            }
        } else {
            // User not found, automatically register them (for demonstration)
            user = new User({ email, password, name: email.split('@')[0] });
            await user.save();
        }

        res.status(200).json({ message: 'Login successful', name: user.name, email: user.email });
    } catch (error) {
        console.error('Login/Register error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// 2. Save Score Route
app.post('/api/scores', async (req, res) => {
    try {
        const { email, name, language, lessonId, score } = req.body;

        // Basic validation
        if (!email || !name || !language || lessonId === undefined || score === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!isDbConnected) {
            return res.status(503).json({ error: 'Database is not connected. Score tracking is disabled.' });
        }

        const newScore = new Score({ email, name, language, lessonId, score });
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

// 4. Admin Scores Route (Protected)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
app.get('/api/admin/scores', async (req, res) => {
    try {
        if (!isDbConnected) {
            return res.status(503).json({ error: 'Database is not connected.' });
        }

        // Simple auth check via hardcoded password password
        // Normally this would be a secure token, but keeping it simple as requested
        const providedPassword = req.query.password || req.headers.authorization?.split(' ')[1];

        if (providedPassword !== ADMIN_PASSWORD) {
            return res.status(401).json({ error: 'Unauthorized: Invalid Admin Password' });
        }

        const allScores = await Score.find().sort({ date: -1 });
        res.status(200).json(allScores);

    } catch (error) {
        console.error('Error fetching all scores for admin:', error);
        res.status(500).json({ error: 'Failed to fetch all scores' });
    }
});

// 5. Get Custom Lesson Names
app.get('/api/lessons', async (req, res) => {
    try {
        if (!isDbConnected) {
            // Return defaults if DB is down
            return res.status(200).json(["Lesson 1", "Lesson 2", "Lesson 3", "Lesson 4", "Lesson 5", "Lesson 6", "Lesson 7", "Lesson 8", "Lesson 9"]);
        }

        let config = await LessonConfig.findOne();
        if (!config) {
            config = new LessonConfig();
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
        if (providedPassword !== ADMIN_PASSWORD) {
            return res.status(401).json({ error: 'Unauthorized: Invalid Admin Password' });
        }

        const { names } = req.body;
        if (!Array.isArray(names) || names.length !== 9) {
            return res.status(400).json({ error: 'Must provide exactly 9 lesson names.' });
        }

        let config = await LessonConfig.findOne();
        if (!config) {
            config = new LessonConfig();
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
        if (providedPassword !== ADMIN_PASSWORD) {
            return res.status(401).json({ error: 'Unauthorized: Invalid Admin Password' });
        }

        const { language, lessonId, questions } = req.body;

        if (!language || typeof lessonId !== 'number' || !Array.isArray(questions) || questions.length !== 10) {
            return res.status(400).json({ error: 'Invalid payload. Must provide language, lessonId, and exactly 10 questions.' });
        }

        // Validate structure of questions roughly
        for (let q of questions) {
            if (!q.text || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctIndex !== 'number') {
                return res.status(400).json({ error: 'Invalid question format.' });
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
        const currentAdminPass = settings.adminPassword || process.env.ADMIN_PASSWORD || 'admin123';
        if (providedPassword !== currentAdminPass) {
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