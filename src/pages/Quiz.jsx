import React, { useState } from 'react';

// ─────────────────────────────────────────────
// HARDCODED QUIZ DATA — EDIT HERE
// ─────────────────────────────────────────────
const QUIZ_DATA = {
    lessons: [
        {
            id: 1,
            title: { en: "Giving up Control", hi: "नियंत्रण छोड़ना" },
            emoji: "🎯",
            image: "/5a9375f6-106f-4d0f-acb3-9771fc2d3fc5.jpg",
            questions: [
                {
                    id: 1,
                    text: { en: "If you're trying to control others: ?", hi: "अगर आप दूसरों को नियंत्रित करने की कोशिश कर रहे हैं तो:" },
                    image: null,
                    options: [
                        { text: { en: "You are trying to accelerate something", hi: "आप कुछ तेज़ी से बढ़ाने की कोशिश कर रहे हैं" }, correct: false },
                        { text: { en: "You are trying to prevent something from happening", hi: "आप कुछ होने से रोकने की कोशिश कर रहे हैं" }, correct: true },
                        { text: { en: "You are trying to manage something that is happening", hi: "आप जो हो रहा है उसे प्रबंधित करने की कोशिश कर रहे हैं" }, correct: false },
                        { text: { en: "You are doing nothing important", hi: "आप कुछ महत्वपूर्ण नहीं कर रहे हैं" }, correct: false },
                    ]
                },
                {
                    id: 2,
                    text: { en: "Why are you not able to give up control?", hi: "आप नियंत्रण क्यों नहीं छोड़ पा रहे हैं?" },
                    image: null,
                    options: [
                        { text: { en: "You don't trust anyone enough", hi: "आप किसी पर भरोसा नहीं करते" }, correct: true },
                        { text: { en: "You trust everyone", hi: "आप सभी पर भरोसा करते हैं" }, correct: false },
                        { text: { en: "Your tolerance for mistakes is very high", hi: "आपकी गलतियों को सहने की क्षमता बहुत अधिक है" }, correct: false },
                        { text: { en: "You are a creator", hi: "आप एक निर्माता हैं" }, correct: false },
                    ]
                },
                {
                    id: 3,
                    text: { en: "When you give up control, what do you start becoming?", hi: "जब आप नियंत्रण छोड़ते हैं, तो आप क्या बनने लगते हैं?" },
                    image: null,
                    options: [
                        { text: { en: "Survival Entrepreneur", hi: "जीवित रहने वाला उद्यमी" }, correct: false },
                        { text: { en: "Superstar Entrepreneur", hi: "सुपरस्टार उद्यमी" }, correct: false },
                        { text: { en: "Revolutionary Entrepreneur", hi: "क्रांतिकारी उद्यमी" }, correct: false },
                        { text: { en: "Ambition Entrepreneur", hi: "महत्वाकांक्षी उद्यमी" }, correct: true },
                    ]
                },
                {
                    id: 4,
                    text: { en: "When you are in control, what do you manage?", hi: "जब आप नियंत्रण में होते हैं, तो आप क्या प्रबंधित करते हैं?" },
                    image: null,
                    options: [
                        { text: { en: "New affairs", hi: "नए मामले" }, correct: false },
                        { text: { en: "International Operations", hi: "अंतर्राष्ट्रीय संचालन" }, correct: false },
                        { text: { en: "What already exists", hi: "जो पहले से मौजूद है" }, correct: true },
                        { text: { en: "What is new", hi: "जो नया है" }, correct: false },
                    ]
                },
                {
                    id: 5,
                    text: { en: "What does \"Being in Charge\" mean?", hi: "\"चार्ज में होना\" का क्या मतलब है?" },
                    image: null,
                    options: [
                        { text: { en: "Providing Money", hi: "धन प्रदान करना" }, correct: false },
                        { text: { en: "Providing Success", hi: "सफलता प्रदान करना" }, correct: false },
                        { text: { en: "Providing Salary on Time", hi: "समय पर वेतन प्रदान करना" }, correct: false },
                        { text: { en: "Providing Vision", hi: "उद्देश्य प्रदान करना" }, correct: true },
                    ]
                },
                {
                    id: 6,
                    text: { en: "Whom does your \"Self-Generated Ambition\" attract?", hi: "आपकी \"स्व-निर्मित महत्वाकांक्षा\", किसे आकर्षित करती है?" },
                    image: null,
                    options: [
                        { text: { en: "Energetic Long-Term Collaborators", hi: "ऊर्जा से भरे दीर्घकालिक सहयोगी" }, correct: true },
                        { text: { en: "Strategic Technology", hi: "रणनीतिक प्रौद्योगिकी" }, correct: false },
                        { text: { en: "Business Models", hi: "व्यापार मॉडल" }, correct: false },
                        { text: { en: "Right Vendors", hi: "सही विक्रेता" }, correct: false },
                    ]
                },
            ]
        },
        {
            id: 2,
            title: { en: "Growing your Ambition", hi: "अपनी महत्वाकांक्षा बढ़ाना" },
            emoji: "🚀",
            image: "/lesson2-bg.jpeg",
            questions: [
                {
                    id: 1,
                    text: { en: "What is Ambition?", hi: "महत्वाकांक्षा क्या है?" },
                    image: null,
                    options: [
                        { text: { en: "Great Thoughts", hi: "महान विचार" }, correct: false },
                        { text: { en: "Strong wish", hi: "प्रबल इच्छा" }, correct: false },
                        { text: { en: "Big Dreams", hi: "बड़े सपने" }, correct: false },
                        { text: { en: "Strong wish to achieve something great in life", hi: "जीवन में कुछ महान हासिल करने की प्रबल इच्छा" }, correct: true },
                    ]
                },
                {
                    id: 2,
                    text: { en: "Is Ambition a One-time thing?", hi: "क्या महत्वाकांक्षा एक बार की चीज़ है?" },
                    image: null,
                    options: [
                        { text: { en: "Yes", hi: "हाँ" }, correct: false },
                        { text: { en: "No", hi: "नहीं" }, correct: true },
                        { text: { en: "May be", hi: "शायद" }, correct: false },
                        { text: { en: "Sometimes", hi: "कभी-कभी" }, correct: false },
                    ]
                },
                {
                    id: 3,
                    text: { en: "What should be your Greatest Ambition?", hi: "आपकी सबसे बड़ी महत्वाकांक्षा क्या होनी चाहिए?" },
                    image: null,
                    options: [
                        { text: { en: "To be more Ambitious", hi: "और अधिक महत्वाकांक्षी बनना" }, correct: true },
                        { text: { en: "To be Greatest", hi: "सबसे महान बनना" }, correct: false },
                        { text: { en: "To be a Great Entrepreneur", hi: "एक महान उद्यमी बनना" }, correct: false },
                        { text: { en: "To create the best products", hi: "सर्वश्रेष्ठ उत्पाद बनाना" }, correct: false },
                    ]
                },
                {
                    id: 4,
                    text: { en: "Which of the following is NOT a characteristic of Ambition?", hi: "निम्नलिखित में से कौन सा महत्वाकांक्षा की विशेषता नहीं है?" },
                    image: null,
                    options: [
                        { text: { en: "Always Growing", hi: "हमेशा बढ़ती रहना" }, correct: false },
                        { text: { en: "Energy Multiplier", hi: "ऊर्जा गुणक" }, correct: false },
                        { text: { en: "Non-Renewable Resource", hi: "गैर-नवीकरणीय संसाधन" }, correct: true },
                        { text: { en: "Creates Greater Impact", hi: "अधिक प्रभाव पैदा करती है" }, correct: false },
                    ]
                },
                {
                    id: 5,
                    text: { en: "What will \"How Far can I go?\", decide?", hi: "\"मैं कितनी दूर जा सकता हूँ?\" क्या तय करेगा?" },
                    image: null,
                    options: [
                        { text: { en: "Till when can I live?", hi: "मैं कब तक जी सकता हूँ?" }, correct: false },
                        { text: { en: "How far can I grow?", hi: "मैं कितना बढ़ सकता हूँ?" }, correct: true },
                        { text: { en: "Multiplying momentum", hi: "गति को गुणा करना" }, correct: false },
                        { text: { en: "Enhancing impact", hi: "प्रभाव को बढ़ाना" }, correct: false },
                    ]
                },
                {
                    id: 6,
                    text: { en: "Ambition is a: ………?", hi: "महत्वाकांक्षा एक: ………?" },
                    image: null,
                    options: [
                        { text: { en: "Landmark", hi: "मील का पत्थर" }, correct: false },
                        { text: { en: "Destination", hi: "मंज़िल" }, correct: false },
                        { text: { en: "Capability", hi: "क्षमता" }, correct: true },
                        { text: { en: "Achievement", hi: "उपलब्धि" }, correct: false },
                    ]
                },
            ]
        },
        {
            id: 3,
            title: { en: "History", hi: "इतिहास" },
            emoji: "🏛️",
            image: "https://images.unsplash.com/photo-1569587112025-0d460e81a126?w=400&q=80",
            questions: [
                {
                    id: 1,
                    text: { en: "Who was the first President of the United States?", hi: "संयुक्त राज्य अमेरिका के पहले राष्ट्रपति कौन थे?" },
                    image: null,
                    options: [
                        { text: { en: "Abraham Lincoln", hi: "अब्राहम लिंकन" }, correct: false },
                        { text: { en: "George Washington", hi: "जॉर्ज वाशिंगटन" }, correct: true },
                        { text: { en: "Thomas Jefferson", hi: "थॉमस जेफर्सन" }, correct: false },
                        { text: { en: "John Adams", hi: "जॉन एडम्स" }, correct: false },
                    ]
                },
                {
                    id: 2,
                    text: { en: "In which year did World War II end?", hi: "द्वितीय विश्व युद्ध किस वर्ष समाप्त हुआ?" },
                    image: null,
                    options: [
                        { text: { en: "1943", hi: "1943" }, correct: false },
                        { text: { en: "1944", hi: "1944" }, correct: false },
                        { text: { en: "1945", hi: "1945" }, correct: true },
                        { text: { en: "1946", hi: "1946" }, correct: false },
                    ]
                },
                {
                    id: 3,
                    text: { en: "Who built the Taj Mahal?", hi: "ताज महल किसने बनाया?" },
                    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&q=80",
                    options: [
                        { text: { en: "Akbar", hi: "अकबर" }, correct: false },
                        { text: { en: "Humayun", hi: "हुमायूँ" }, correct: false },
                        { text: { en: "Shah Jahan", hi: "शाह जहाँ" }, correct: true },
                        { text: { en: "Aurangzeb", hi: "औरंगज़ेब" }, correct: false },
                    ]
                },
            ]
        },
        {
            id: 4,
            title: { en: "Geography", hi: "भूगोल" },
            emoji: "🌍",
            image: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=400&q=80",
            questions: [
                {
                    id: 1,
                    text: { en: "What is the capital of Japan?", hi: "जापान की राजधानी क्या है?" },
                    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80",
                    options: [
                        { text: { en: "Osaka", hi: "ओसाका" }, correct: false },
                        { text: { en: "Kyoto", hi: "क्योटो" }, correct: false },
                        { text: { en: "Tokyo", hi: "टोक्यो" }, correct: true },
                        { text: { en: "Hiroshima", hi: "हिरोशिमा" }, correct: false },
                    ]
                },
                {
                    id: 2,
                    text: { en: "Which is the longest river in the world?", hi: "विश्व की सबसे लंबी नदी कौन सी है?" },
                    image: null,
                    options: [
                        { text: { en: "Amazon", hi: "अमेज़न" }, correct: false },
                        { text: { en: "Nile", hi: "नील" }, correct: true },
                        { text: { en: "Ganges", hi: "गंगा" }, correct: false },
                        { text: { en: "Yangtze", hi: "यांग्त्जी" }, correct: false },
                    ]
                },
                {
                    id: 3,
                    text: { en: "Which is the smallest country in the world?", hi: "विश्व का सबसे छोटा देश कौन सा है?" },
                    image: null,
                    options: [
                        { text: { en: "Monaco", hi: "मोनाको" }, correct: false },
                        { text: { en: "Maldives", hi: "मालदीव" }, correct: false },
                        { text: { en: "Vatican City", hi: "वेटिकन सिटी" }, correct: true },
                        { text: { en: "San Marino", hi: "सैन मरीनो" }, correct: false },
                    ]
                },
            ]
        },
        {
            id: 5,
            title: { en: "Sports", hi: "खेल" },
            emoji: "⚽",
            image: "https://images.unsplash.com/photo-1587329310686-91414b8e3cb7?w=400&q=80",
            questions: [
                {
                    id: 1,
                    text: { en: "How many players are on a football team?", hi: "एक फुटबॉल टीम में कितने खिलाड़ी होते हैं?" },
                    image: null,
                    options: [
                        { text: { en: "9", hi: "9" }, correct: false },
                        { text: { en: "11", hi: "11" }, correct: true },
                        { text: { en: "13", hi: "13" }, correct: false },
                        { text: { en: "7", hi: "7" }, correct: false },
                    ]
                },
                {
                    id: 2,
                    text: { en: "In which sport do you use a shuttlecock?", hi: "किस खेल में शटलकॉक का उपयोग होता है?" },
                    image: null,
                    options: [
                        { text: { en: "Tennis", hi: "टेनिस" }, correct: false },
                        { text: { en: "Squash", hi: "स्क्वैश" }, correct: false },
                        { text: { en: "Badminton", hi: "बैडमिंटन" }, correct: true },
                        { text: { en: "Pickleball", hi: "पिकलबॉल" }, correct: false },
                    ]
                },
                {
                    id: 3,
                    text: { en: "How many rings are in the Olympic logo?", hi: "ओलंपिक लोगो में कितने छल्ले हैं?" },
                    image: null,
                    options: [
                        { text: { en: "4", hi: "4" }, correct: false },
                        { text: { en: "6", hi: "6" }, correct: false },
                        { text: { en: "5", hi: "5" }, correct: true },
                        { text: { en: "3", hi: "3" }, correct: false },
                    ]
                },
            ]
        },
        {
            id: 6,
            title: { en: "Technology", hi: "तकनीक" },
            emoji: "💻",
            image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
            questions: [
                {
                    id: 1,
                    text: { en: "What does CPU stand for?", hi: "CPU का पूर्ण रूप क्या है?" },
                    image: null,
                    options: [
                        { text: { en: "Central Processing Unit", hi: "सेंट्रल प्रोसेसिंग यूनिट" }, correct: true },
                        { text: { en: "Computer Personal Unit", hi: "कंप्यूटर पर्सनल यूनिट" }, correct: false },
                        { text: { en: "Core Power Unit", hi: "कोर पावर यूनिट" }, correct: false },
                        { text: { en: "Central Program Unit", hi: "सेंट्रल प्रोग्राम यूनिट" }, correct: false },
                    ]
                },
                {
                    id: 2,
                    text: { en: "Who founded Apple Inc.?", hi: "Apple Inc. की स्थापना किसने की?" },
                    image: null,
                    options: [
                        { text: { en: "Bill Gates", hi: "बिल गेट्स" }, correct: false },
                        { text: { en: "Elon Musk", hi: "एलन मस्क" }, correct: false },
                        { text: { en: "Steve Jobs", hi: "स्टीव जॉब्स" }, correct: true },
                        { text: { en: "Mark Zuckerberg", hi: "मार्क जुकरबर्ग" }, correct: false },
                    ]
                },
                {
                    id: 3,
                    text: { en: "What does HTTP stand for?", hi: "HTTP का पूर्ण रूप क्या है?" },
                    image: null,
                    options: [
                        { text: { en: "HyperText Transfer Protocol", hi: "हाइपरटेक्स्ट ट्रांसफर प्रोटोकॉल" }, correct: true },
                        { text: { en: "High Text Transfer Process", hi: "हाई टेक्स्ट ट्रांसफर प्रोसेस" }, correct: false },
                        { text: { en: "Hyper Transfer Text Program", hi: "हाइपर ट्रांसफर टेक्स्ट प्रोग्राम" }, correct: false },
                        { text: { en: "Home Terminal Text Protocol", hi: "होम टर्मिनल टेक्स्ट प्रोटोकॉल" }, correct: false },
                    ]
                },
            ]
        },
        {
            id: 7,
            title: { en: "Food", hi: "भोजन" },
            emoji: "🍛",
            image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
            questions: [
                {
                    id: 1,
                    text: { en: "Which vitamin is found in oranges?", hi: "संतरों में कौन सा विटामिन पाया जाता है?" },
                    image: null,
                    options: [
                        { text: { en: "Vitamin A", hi: "विटामिन A" }, correct: false },
                        { text: { en: "Vitamin B", hi: "विटामिन B" }, correct: false },
                        { text: { en: "Vitamin C", hi: "विटामिन C" }, correct: true },
                        { text: { en: "Vitamin D", hi: "विटामिन D" }, correct: false },
                    ]
                },
                {
                    id: 2,
                    text: { en: "Which food is known as the 'King of Fruits'?", hi: "किस फल को 'फलों का राजा' कहा जाता है?" },
                    image: null,
                    options: [
                        { text: { en: "Apple", hi: "सेब" }, correct: false },
                        { text: { en: "Mango", hi: "आम" }, correct: true },
                        { text: { en: "Banana", hi: "केला" }, correct: false },
                        { text: { en: "Papaya", hi: "पपीता" }, correct: false },
                    ]
                },
                {
                    id: 3,
                    text: { en: "What is the main ingredient in bread?", hi: "रोटी की मुख्य सामग्री क्या है?" },
                    image: null,
                    options: [
                        { text: { en: "Rice", hi: "चावल" }, correct: false },
                        { text: { en: "Maize", hi: "मक्का" }, correct: false },
                        { text: { en: "Wheat Flour", hi: "गेहूं का आटा" }, correct: true },
                        { text: { en: "Barley", hi: "जौ" }, correct: false },
                    ]
                },
            ]
        },
        {
            id: 8,
            title: { en: "Math", hi: "गणित" },
            emoji: "🔢",
            image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80",
            questions: [
                {
                    id: 1,
                    text: { en: "What is the value of π (pi)?", hi: "π (पाई) का मान क्या है?" },
                    image: null,
                    options: [
                        { text: { en: "3.14", hi: "3.14" }, correct: true },
                        { text: { en: "2.71", hi: "2.71" }, correct: false },
                        { text: { en: "1.61", hi: "1.61" }, correct: false },
                        { text: { en: "3.41", hi: "3.41" }, correct: false },
                    ]
                },
                {
                    id: 2,
                    text: { en: "What is 12 × 12?", hi: "12 × 12 क्या है?" },
                    image: null,
                    options: [
                        { text: { en: "132", hi: "132" }, correct: false },
                        { text: { en: "144", hi: "144" }, correct: true },
                        { text: { en: "124", hi: "124" }, correct: false },
                        { text: { en: "148", hi: "148" }, correct: false },
                    ]
                },
                {
                    id: 3,
                    text: { en: "What is the square root of 81?", hi: "81 का वर्गमूल क्या है?" },
                    image: null,
                    options: [
                        { text: { en: "7", hi: "7" }, correct: false },
                        { text: { en: "8", hi: "8" }, correct: false },
                        { text: { en: "9", hi: "9" }, correct: true },
                        { text: { en: "10", hi: "10" }, correct: false },
                    ]
                },
            ]
        },
        {
            id: 9,
            title: { en: "General Knowledge", hi: "सामान्य ज्ञान" },
            emoji: "💡",
            image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
            questions: [
                {
                    id: 1,
                    text: { en: "How many colors are in a rainbow?", hi: "इंद्रधनुष में कितने रंग होते हैं?" },
                    image: null,
                    options: [
                        { text: { en: "5", hi: "5" }, correct: false },
                        { text: { en: "6", hi: "6" }, correct: false },
                        { text: { en: "7", hi: "7" }, correct: true },
                        { text: { en: "8", hi: "8" }, correct: false },
                    ]
                },
                {
                    id: 2,
                    text: { en: "Which gas do plants absorb from the air?", hi: "पौधे वायु से कौन सी गैस अवशोषित करते हैं?" },
                    image: null,
                    options: [
                        { text: { en: "Oxygen", hi: "ऑक्सीजन" }, correct: false },
                        { text: { en: "Nitrogen", hi: "नाइट्रोजन" }, correct: false },
                        { text: { en: "Carbon Dioxide", hi: "कार्बन डाइऑक्साइड" }, correct: true },
                        { text: { en: "Hydrogen", hi: "हाइड्रोजन" }, correct: false },
                    ]
                },
                {
                    id: 3,
                    text: { en: "What is the national animal of India?", hi: "भारत का राष्ट्रीय पशु क्या है?" },
                    image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=400&q=80",
                    options: [
                        { text: { en: "Lion", hi: "शेर" }, correct: false },
                        { text: { en: "Elephant", hi: "हाथी" }, correct: false },
                        { text: { en: "Bengal Tiger", hi: "बंगाल टाइगर" }, correct: true },
                        { text: { en: "Peacock", hi: "मोर" }, correct: false },
                    ]
                },
            ]
        },
    ]
};

const UI = {
    en: {
        chooseLanguage: "Choose Language",
        chooseLangSub: "Select your preferred language to begin",
        selectLesson: "Select a Lesson",
        lessonSub: "Tap a lesson to start the quiz",
        questions: "questions",
        question: "Question",
        of: "of",
        nextQuestion: "Next Question",
        seeResults: "See Results",
        yourScore: "Your Score",
        excellent: "Excellent!",
        good: "Good Job!",
        keepPracticing: "Keep Practicing!",
        retakeLesson: "Retake Lesson",
        backToLessons: "Back to Lessons",
        correct: "Correct!",
        wrong: "Wrong!",
        downloadPdf: "Download PDF Report",
    },
    hi: {
        chooseLanguage: "भाषा चुनें",
        chooseLangSub: "शुरू करने के लिए अपनी भाषा चुनें",
        selectLesson: "पाठ चुनें",
        lessonSub: "क्विज़ शुरू करने के लिए पाठ चुनें",
        questions: "प्रश्न",
        question: "प्रश्न",
        of: "में से",
        nextQuestion: "अगला प्रश्न",
        seeResults: "परिणाम देखें",
        yourScore: "आपका स्कोर",
        excellent: "शानदार!",
        good: "बहुत अच्छे!",
        keepPracticing: "अभ्यास जारी रखें!",
        retakeLesson: "पाठ दोबारा लें",
        backToLessons: "पाठ सूची पर वापस जाएं",
        correct: "सही!",
        wrong: "गलत!",
        downloadPdf: "PDF रिपोर्ट डाउनलोड करें",
    }
};

// Event name shown in the PDF header — change this to your event/company name
const EVENT_NAME = "Your Event Name";

// ─────────────────────────────────────────────
// QUIZ COMPONENT
// ─────────────────────────────────────────────
export default function Quiz() {
    const [step, setStep] = useState('landing'); // landing | language | lessons | quiz | result
    const [lang, setLang] = useState('en');
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [qIndex, setQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
    const [answered, setAnswered] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [answers, setAnswers] = useState([]); // [{qIndex, selectedIdx, correct}]

    const t = UI[lang];

    const startLesson = (lesson) => {
        setSelectedLesson(lesson);
        setQIndex(0);
        setScore(0);
        setFeedback(null);
        setAnswered(false);
        setSelectedOption(null);
        setAnswers([]);
        setStep('quiz');
    };

    // ── SOUND EFFECT ──
    const correctAudio = new Audio('/right.mp3');
    const wrongAudio = new Audio('/wrong.mp3');

    const playSound = (correct, onEndedCallback) => {
        try {
            const audioToPlay = correct ? correctAudio : wrongAudio;
            audioToPlay.currentTime = 0; // Reset sound to start

            // Set the onended callback if provided
            if (onEndedCallback) {
                audioToPlay.onended = () => {
                    audioToPlay.onended = null; // Clean up listener
                    onEndedCallback();
                };
            }

            audioToPlay.play().catch(e => {
                // If play() fails (e.g. browser policy), just trigger callback after a default delay
                console.error("Audio play failed:", e);
                if (onEndedCallback) setTimeout(onEndedCallback, 1200);
            });
        } catch (e) {
            // fallback if completely failed
            if (onEndedCallback) setTimeout(onEndedCallback, 1200);
        }
    };

    const handleAnswer = (optionIndex) => {
        if (answered) return;
        const question = selectedLesson.questions[qIndex];
        const isCorrect = question.options[optionIndex].correct;
        setSelectedOption(optionIndex);
        setAnswered(true);
        setFeedback(isCorrect ? 'correct' : 'wrong');
        if (isCorrect) setScore(s => s + 1);
        setAnswers(prev => [...prev, { qIndex, selectedIdx: optionIndex, correct: isCorrect }]);

        // Pass the transition logic as a callback to playSound so it happens when audio finishes
        playSound(isCorrect, () => {
            if (qIndex + 1 < selectedLesson.questions.length) {
                setQIndex(i => i + 1);
                setFeedback(null);
                setAnswered(false);
                setSelectedOption(null);
            } else {
                setStep('result');
            }
        });
    };

    const resetToLessons = () => {
        setStep('lessons');
        setSelectedLesson(null);
        setQIndex(0);
        setScore(0);
        setFeedback(null);
        setAnswered(false);
        setSelectedOption(null);
    };

    const getResultEmoji = () => {
        const pct = score / selectedLesson.questions.length;
        if (pct >= 0.8) return { emoji: '🏆', msg: t.excellent };
        if (pct >= 0.5) return { emoji: '⭐', msg: t.good };
        return { emoji: '📚', msg: t.keepPracticing };
    };

    // ── PDF GENERATOR ──
    const generatePDF = () => {
        const total = selectedLesson.questions.length;
        const pct = Math.round((score / total) * 100);
        const lessonName = selectedLesson.title[lang];

        const questionsHTML = selectedLesson.questions.map((q, idx) => {
            const ans = answers.find(a => a.qIndex === idx);
            const selectedIdx = ans ? ans.selectedIdx : null;
            const wasCorrect = ans ? ans.correct : null;

            const optionsHTML = q.options.map((opt, oIdx) => {
                const isSelected = oIdx === selectedIdx;
                const isCorrect = opt.correct;

                let bg = '#ffffff';
                let border = '#e5e7eb';
                let badge = '';

                if (isSelected && wasCorrect) {
                    // Selected & correct
                    bg = '#f0fdf4'; border = '#22c55e';
                    badge = `<span style="margin-left:auto;font-size:11px;font-weight:700;color:#16a34a;background:#dcfce7;padding:2px 10px;border-radius:999px;">✓ YOUR ANSWER</span>`;
                } else if (isSelected && !wasCorrect) {
                    // Selected but wrong
                    bg = '#fef2f2'; border = '#ef4444';
                    badge = `<span style="margin-left:auto;font-size:11px;font-weight:700;color:#dc2626;background:#fee2e2;padding:2px 10px;border-radius:999px;">✗ YOUR ANSWER</span>`;
                } else if (!wasCorrect && isCorrect) {
                    // Correct answer (when user got it wrong)
                    bg = '#f0fdf4'; border = '#22c55e';
                    badge = `<span style="margin-left:auto;font-size:11px;font-weight:700;color:#16a34a;background:#dcfce7;padding:2px 10px;border-radius:999px;">✓ CORRECT ANSWER</span>`;
                }

                return `
                  <div style="display:flex;align-items:center;padding:10px 14px;border:1.5px solid ${border};background:${bg};border-radius:8px;margin-bottom:6px;">
                    <span style="font-size:13px;color:#374151;flex:1;">${opt.text[lang]}</span>
                    ${badge}
                  </div>`;
            }).join('');

            return `
              <div style="margin-bottom:28px;page-break-inside:avoid;">
                <p style="font-size:14px;font-weight:700;color:#111827;margin-bottom:12px;">${idx + 1}. ${q.text[lang]}</p>
                ${optionsHTML}
              </div>`;
        }).join('');

        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8" />
            <title>Quiz Report — ${lessonName}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 32px; color: #111827; max-width: 700px; margin: 0 auto; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <div style="text-align:center;border-bottom:2px solid #e5e7eb;padding-bottom:20px;margin-bottom:28px;">
              <p style="font-size:12px;color:#9ca3af;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">${EVENT_NAME}</p>
              <h1 style="font-size:22px;font-weight:800;color:#6366f1;margin:0 0 6px;">${lessonName}</h1>
              <p style="font-size:14px;color:#6b7280;margin:0;">Score: ${score}/${total} &nbsp;|&nbsp; ${pct}%</p>
            </div>
            ${questionsHTML}
            <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px;">Generated by Quiz App &nbsp;|&nbsp; ${EVENT_NAME}</p>
          </body>
          </html>`;

        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 400);
    };

    // ── LANDING SCREEN ──
    if (step === 'landing') {
        return (
            <div className="landing-wrapper">
                <div className="landing-company-logo-wrap">
                    <img
                        src="src/pages/logo.6712b347ef6bfbe8b880.png"
                        alt="Company Logo"
                        className="landing-company-logo"
                    />
                </div>
                <div className="landing-bg"></div>
                <div className="landing-content">
                    <h1 className="landing-title">9 LESSONS<br />QUIZ</h1>
                    <button className="landing-btn" onClick={() => setStep('language')}>
                        START QUIZ
                    </button>
                </div>
            </div>
        );
    }

    // ── LANGUAGE SELECTION ──
    if (step === 'language') {
        return (
            <div className="phone-wrap">
                <div className="screen lang-screen">
                    {/* ── COMPANY LOGO — swap src to your logo URL or file path ── */}
                    <div className="company-logo-wrap">
                        <img
                            src="src\pages\logo.6712b347ef6bfbe8b880.png"
                            alt="Company Logo"
                            className="company-logo"
                        />
                    </div>
                    <div className="lang-hero">
                        <div className="lang-logo">🎓</div>
                        <h1 className="lang-title">{t.chooseLanguage}</h1>
                        <p className="lang-sub">{t.chooseLangSub}</p>
                    </div>
                    <div className="lang-options">
                        <button className="lang-btn" onClick={() => { setLang('en'); setStep('lessons'); }}>
                            <span className="lang-flag">🇬🇧</span>
                            <span className="lang-name">English</span>
                            <span className="lang-arrow">→</span>
                        </button>
                        <button className="lang-btn" onClick={() => { setLang('hi'); setStep('lessons'); }}>
                            <span className="lang-flag">🇮🇳</span>
                            <span className="lang-name">हिंदी</span>
                            <span className="lang-arrow">→</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── LESSONS LIST ──
    if (step === 'lessons') {
        return (
            <div className="phone-wrap">
                <div className="screen lessons-screen">
                    <div className="lessons-header">
                        <button className="back-btn" onClick={() => setStep('language')}>←</button>
                        <div>
                            <h2 className="lessons-title">{t.selectLesson}</h2>
                            <p className="lessons-sub">{t.lessonSub}</p>
                        </div>
                    </div>
                    <div className="lessons-list">
                        {QUIZ_DATA.lessons.map((lesson) => (
                            <button key={lesson.id} className="lesson-item" onClick={() => startLesson(lesson)}>
                                <div className="lesson-thumb">
                                    <span className="lesson-emoji-big">{lesson.emoji}</span>
                                </div>
                                <div className="lesson-info">
                                    <span className="lesson-name">{lesson.title[lang]}</span>
                                    <span className="lesson-count">{lesson.questions.length} {t.questions}</span>
                                </div>
                                <span className="lesson-chevron">›</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ── QUIZ ──
    if (step === 'quiz') {
        const question = selectedLesson.questions[qIndex];
        const total = selectedLesson.questions.length;
        const progress = ((qIndex) / total) * 100;

        return (
            <div className="phone-wrap">
                <div className={`screen quiz-screen lesson-id-${selectedLesson.id}`}>
                    {selectedLesson.image && (
                        <div className="quiz-bg" style={{ backgroundImage: `url(${selectedLesson.image})` }} />
                    )}
                    <div className="quiz-top-bar">
                        <button className="back-btn" onClick={resetToLessons}>←</button>
                        <span className="quiz-lesson-title">{selectedLesson.title[lang]}</span>
                        <span className="quiz-count">{qIndex + 1}/{total}</span>
                    </div>

                    <div className="quiz-progress-wrap">
                        <div className="quiz-progress-bar">
                            <div className="quiz-progress-fill" style={{ width: `${((qIndex + 1) / total) * 100}%` }} />
                        </div>
                    </div>

                    <div className={`quiz-body lesson-${selectedLesson.id}`}>
                        <div className="question-card">
                            {question.image && (
                                <div className="question-bg" style={{ backgroundImage: `url(${question.image})` }} />
                            )}
                            <p className="question-num">{t.question} {qIndex + 1} {t.of} {total}</p>
                            <h3 className="question-text">{question.text[lang]}</h3>
                        </div>

                        <div className="options-list">
                            {question.options.map((opt, i) => {
                                let cls = 'option-btn';
                                if (answered) {
                                    if (i === selectedOption && opt.correct) cls += ' correct';
                                    else if (i === selectedOption && !opt.correct) cls += ' wrong';
                                    else cls += ' dimmed';
                                }
                                return (
                                    <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={answered}>
                                        <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                                        <span className="option-text">{opt.text[lang]}</span>
                                        {answered && i === selectedOption && opt.correct && <span className="option-icon">✓</span>}
                                        {answered && i === selectedOption && !opt.correct && <span className="option-icon">✗</span>}
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
        );
    }

    // ── RESULT ──
    if (step === 'result') {
        const { emoji, msg } = getResultEmoji();
        const total = selectedLesson.questions.length;
        const pct = Math.round((score / total) * 100);

        return (
            <div className="phone-wrap">
                <div className="screen result-screen">
                    <div className="result-body">
                        <div className="result-emoji">{emoji}</div>
                        <h2 className="result-msg">{msg}</h2>
                        <p className="result-lesson">{selectedLesson.title[lang]}</p>

                        <div className="result-score-ring">
                            <svg viewBox="0 0 120 120" className="score-ring-svg">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                                <circle
                                    cx="60" cy="60" r="50"
                                    fill="none"
                                    stroke="url(#scoreGrad)"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={`${pct * 3.14} 314`}
                                    transform="rotate(-90 60 60)"
                                />
                                <defs>
                                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="score-ring-text">
                                <span className="score-num">{score}</span>
                                <span className="score-den">/{total}</span>
                            </div>
                        </div>

                        <p className="score-pct">{pct}% {t.yourScore}</p>

                        <div className="result-actions">
                            <button className="result-btn pdf-btn" onClick={generatePDF}>
                                📄 {t.downloadPdf}
                            </button>
                            <button className="result-btn primary-btn" onClick={() => startLesson(selectedLesson)}>
                                🔄 {t.retakeLesson}
                            </button>
                            <button className="result-btn secondary-btn" onClick={resetToLessons}>
                                📚 {t.backToLessons}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
