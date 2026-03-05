// data.js

// A helper to generate dummy questions for the lessons.
// In a real app, this would be fetched from a backend or a static JSON file.
function generateQuizData() {
    const languages = [
        { id: 'en', name: 'English', greeting: 'Welcome to the Quiz' },
        { id: 'hi', name: 'Hindi', greeting: 'क्विज में आपका स्वागत है' },
        { id: 'mr', name: 'Marathi', greeting: 'क्विझमध्ये आपले स्वागत आहे' }
    ];

    const data = {};

    languages.forEach(lang => {
        data[lang.id] = {
            name: lang.name,
            greeting: lang.greeting,
            lessons: []
        };

        // Generate 9 lessons
        for (let l = 1; l <= 9; l++) {
            const lesson = {
                id: l,
                title: lang.id === 'en' ? `Lesson ${l}` : (lang.id === 'hi' ? `पाठ ${l}` : `धडा ${l}`),
                questions: []
            };

            // Generate 10 questions per lesson
            for (let q = 1; q <= 10; q++) {
                let questionText = '';
                let options = [];
                let correctIndex = Math.floor(Math.random() * 4); // 0, 1, 2, or 3

                if (lang.id === 'en') {
                    questionText = `This is English Question ${q} for Lesson ${l}. What is the correct option?`;
                    options = [`Option 1`, `Option 2`, `Option 3`, `Option 4`];
                } else if (lang.id === 'hi') {
                    questionText = `यह पाठ ${l} के लिए हिंदी का प्रश्न ${q} है। सही विकल्प क्या है?`;
                    options = [`विकल्प 1`, `विकल्प 2`, `विकल्प 3`, `विकल्प 4`];
                } else if (lang.id === 'mr') {
                    questionText = `हा धडा ${l} साठी मराठी प्रश्न ${q} आहे. योग्य पर्याय कोणता?`;
                    options = [`पर्याय 1`, `पर्याय 2`, `पर्याय 3`, `पर्याय 4`];
                }
                
                // ensuring the "correct" is somewhat randomized but valid
                options[correctIndex] = options[correctIndex] + ' (Correct)';

                lesson.questions.push({
                    text: questionText,
                    options: options,
                    correctIndex: correctIndex
                });
            }

            data[lang.id].lessons.push(lesson);
        }
    });

    return data;
}

const quizData = generateQuizData();
