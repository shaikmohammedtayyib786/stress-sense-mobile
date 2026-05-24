// ===== THEME TOGGLE (Feature 1: Dark/Light Mode) =====
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    html.setAttribute('data-theme', theme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

initTheme();

// ===== 3D TUBES BACKGROUND =====
(async function initTubesBackground() {
    const canvas = document.getElementById('hero-canvas');
    const hero = document.getElementById('hero');
    if (!canvas || !hero) return;
    canvas.style.touchAction = 'none';
    try {
        const module = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
        const TubesCursor = module.default;
        const app = TubesCursor(canvas, {
            tubes: {
                colors: ["#6C63FF", "#FF6B8A", "#4ECDC4"],
                lights: {
                    intensity: 200,
                    colors: ["#6C63FF", "#FF6B8A", "#4ECDC4", "#FFD93D"]
                }
            }
        });
        const shapes = document.querySelector('.hero-bg-shapes');
        if (shapes) shapes.classList.add('hidden');
        hero.addEventListener('click', () => {
            const randomColors = (n) => Array.from({ length: n }, () =>
                '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
            );
            if (app && app.tubes) {
                app.tubes.setColors(randomColors(3));
                app.tubes.setLightsColors(randomColors(4));
            }
        });
    } catch (err) {
        console.warn('3D Tubes failed to load, using fallback background.', err);
    }
})();

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== ANIMATED COUNTERS =====
function animateCounter(el, target, duration = 2000) {
    let start = 0;
    const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        el.textContent = Math.floor(progress * target);
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.querySelectorAll('.hero-stat-num').forEach(el => {
                const target = parseInt(el.dataset.target);
                animateCounter(el, target);
            });
            entry.target.querySelectorAll('.stat-value').forEach(el => {
                const target = parseInt(el.dataset.target);
                animateCounter(el, target);
            });
            entry.target.querySelectorAll('.circle-fg').forEach(circle => {
                const percent = parseInt(circle.dataset.percent);
                const offset = 314 - (314 * percent / 100);
                circle.style.strokeDashoffset = offset;
            });
            entry.target.querySelectorAll('.level-fill').forEach(bar => {
                const level = bar.dataset.level;
                bar.style.width = level + '%';
            });
            entry.target.querySelectorAll('.bar-fill').forEach(bar => {
                const width = bar.dataset.width;
                bar.style.width = width + '%';
            });
            fadeObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

// ===== FEATURE 2: MOTIVATIONAL QUOTES =====
const quotesList = [
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
    { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Success is not final, failure is not fatal.", author: "Winston Churchill" },
    { text: "Stress is the price we pay for being alive.", author: "Dr. Seuss" },
    { text: "The mind is everything. What you think, you become.", author: "Buddha" },
    { text: "Life is 10% what happens to you and 90% how you react to it.", author: "Charles R. Swindoll" },
    { text: "It's not about having time. It's about making time.", author: "Unknown" },
    { text: "You are stronger than your excuses.", author: "Unknown" }
];

let currentQuoteIndex = 0;

function initQuotes() {
    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    const quotePrev = document.getElementById('quotePrev');
    const quoteNext = document.getElementById('quoteNext');
    const quoteDots = document.getElementById('quoteDots');

    if (!quoteText || !quoteDots) return;

    function renderQuote() {
        const quote = quotesList[currentQuoteIndex];
        quoteText.textContent = quote.text;
        quoteAuthor.textContent = `— ${quote.author}`;
        updateDots();
    }

    function updateDots() {
        quoteDots.innerHTML = quotesList.map((_, i) => 
            `<div class="quote-dot ${i === currentQuoteIndex ? 'active' : ''}" data-index="${i}"></div>`
        ).join('');
        quoteDots.querySelectorAll('.quote-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                currentQuoteIndex = parseInt(dot.dataset.index);
                renderQuote();
                clearInterval(quoteTimer);
                quoteTimer = setInterval(nextQuote, 6000);
            });
        });
    }

    function nextQuote() {
        currentQuoteIndex = (currentQuoteIndex + 1) % quotesList.length;
        renderQuote();
    }

    function prevQuote() {
        currentQuoteIndex = (currentQuoteIndex - 1 + quotesList.length) % quotesList.length;
        renderQuote();
    }

    quoteNext.addEventListener('click', () => {
        nextQuote();
        clearInterval(quoteTimer);
        quoteTimer = setInterval(nextQuote, 6000);
    });

    quotePrev.addEventListener('click', () => {
        prevQuote();
        clearInterval(quoteTimer);
        quoteTimer = setInterval(nextQuote, 6000);
    });

    let quoteTimer = setInterval(nextQuote, 6000);

    renderQuote();
}

document.addEventListener('DOMContentLoaded', initQuotes);

// ===== FEATURE 3: STRESS TIMELINE WITH SCROLL ANIMATIONS =====
function initTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                timelineObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    timelineItems.forEach(item => timelineObserver.observe(item));
}

document.addEventListener('DOMContentLoaded', initTimeline);

// ===== FEATURE 4: GUIDED BREATHING EXERCISE =====
function initBreathing() {
    const techniques = {
        calm: { inhale: 4, exhale: 6, hold: 0, cycles: null },
        box: { inhale: 4, hold: 4, exhale: 4, hold2: 4, cycles: null },
        478: { inhale: 4, hold: 7, exhale: 8, cycles: null }
    };

    let currentTechnique = 'calm';
    let isBreathing = false;
    let cycleCount = 0;
    let breathingSession = 0;

    const breathingToggle = document.getElementById('breathingToggle');
    const breathingPhase = document.getElementById('breathingPhase');
    const breathingCount = document.getElementById('breathingCount');
    const cycleCounter = document.getElementById('cycleCount');
    const techniqueDesc = document.getElementById('techniqueDesc');
    const breathingCircle = document.getElementById('breathingCircle');

    document.querySelectorAll('.technique-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isBreathing) return;
            document.querySelectorAll('.technique-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTechnique = btn.dataset.technique;
            updateTechniqueDesc();
        });
    });

    function updateTechniqueDesc() {
        const desc = {
            calm: 'Calm breathing: Inhale for 4 seconds, exhale for 6 seconds. Simple and effective.',
            box: 'Box breathing: Inhale, hold, exhale, hold for 4 seconds each. Great for focus.',
            478: '4-7-8 breathing: Inhale 4s, hold 7s, exhale 8s. Activates calming response.'
        };
        techniqueDesc.textContent = desc[currentTechnique];
    }

     async function breathe() {
        const sessionStartTime = Date.now();
        const session = ++breathingSession;
        isBreathing = true;
        breathingToggle.disabled = false;
        breathingCircle.classList.add('breathing-active');
        cycleCount = 0;
        cycleCounter.textContent = cycleCount;

        while (isBreathing && session === breathingSession) {
            const tech = techniques[currentTechnique];

            // Inhale
            await animateBreathing('Inhale', tech.inhale, session);
            if (!isBreathing || session !== breathingSession) break;

            // Hold (if exists)
            if (tech.hold) await animateBreathing('Hold', tech.hold, session);
            if (!isBreathing || session !== breathingSession) break;

            // Exhale
            await animateBreathing('Exhale', tech.exhale, session);
            if (!isBreathing || session !== breathingSession) break;

            // Hold 2 (for box breathing)
            if (tech.hold2) await animateBreathing('Hold', tech.hold2, session);
            if (!isBreathing || session !== breathingSession) break;

            cycleCount++;
            cycleCounter.textContent = cycleCount;
        }

        if (session !== breathingSession) return;

        const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);
        saveBreatheSession(sessionDuration, cycleCount);

        breathingToggle.disabled = false;
        isBreathing = false;
        breathingCircle.classList.remove('breathing-active');
        breathingToggle.textContent = 'Start Breathing';
        breathingPhase.textContent = 'Stopped';
        breathingCount.textContent = '0';
        updateDashboard();
    }

    function animateBreathing(phase, duration, session) {
        return new Promise(resolve => {
            breathingPhase.textContent = phase;
            let elapsed = 0;
            const step = 30;

            function update() {
                if (!isBreathing || session !== breathingSession) {
                    resolve();
                    return;
                }

                elapsed += step;
                const remaining = Math.ceil((duration - elapsed / 1000));
                breathingCount.textContent = Math.max(0, remaining);

                if (elapsed >= duration * 1000) {
                    resolve();
                } else {
                    setTimeout(update, step);
                }
            }
            update();
        });
    }

    breathingToggle.addEventListener('click', () => {
        if (isBreathing) {
            isBreathing = false;
            breathingSession++;
            breathingToggle.disabled = false;
            breathingToggle.textContent = 'Start Breathing';
            breathingPhase.textContent = 'Stopped';
            breathingCount.textContent = '0';
            breathingCircle.classList.remove('breathing-active');
        } else {
            breathingToggle.textContent = 'Stop Breathing';
            breathe();
        }
    });

    updateTechniqueDesc();

    // Breathing History Functions
    function saveBreatheSession(duration, cycles) {
        const now = new Date();
        const session = {
            sessionId: 'breath_' + Date.now(),
            date: now.toISOString().split('T')[0],
            time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            technique: currentTechnique,
            cycles: cycles,
            duration: Math.round(duration / 60),
            timestamp: Date.now()
        };
        
        let sessions = getBreatheHistory();
        sessions.push(session);
        localStorage.setItem('breathingSessions', JSON.stringify(sessions));
    }

    function getBreatheHistory() {
        const stored = localStorage.getItem('breathingSessions');
        return stored ? JSON.parse(stored) : [];
    }

    function getWeeklyBreathingStats() {
        const sessions = getBreatheHistory();
        const now = Date.now();
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
        
        const weeklySessions = sessions.filter(s => s.timestamp >= weekAgo);
        const totalDuration = weeklySessions.reduce((sum, s) => sum + s.duration, 0);
        const avgCycles = weeklySessions.length > 0 ? 
            Math.round(weeklySessions.reduce((sum, s) => sum + s.cycles, 0) / weeklySessions.length) : 0;
        
        return {
            count: weeklySessions.length,
            totalDuration: totalDuration,
            avgCycles: avgCycles
        };
    }
}

document.addEventListener('DOMContentLoaded', initBreathing);

// Global helper functions for breathing history (used by dashboard)
window.getBreatheHistory = () => {
    const stored = localStorage.getItem('breathingSessions');
    return stored ? JSON.parse(stored) : [];
};

window.getWeeklyBreathingStats = () => {
    const sessions = window.getBreatheHistory();
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    const weeklySessions = sessions.filter(s => s.timestamp >= weekAgo);
    const totalDuration = weeklySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const avgCycles = weeklySessions.length > 0 ? 
        Math.round(weeklySessions.reduce((sum, s) => sum + (s.cycles || 0), 0) / weeklySessions.length) : 0;
    
    return {
        count: weeklySessions.length,
        totalDuration: totalDuration,
        avgCycles: avgCycles
    };
};

// ===== FEATURE 5: BUBBLE POP GAME (Canvas) =====
function initBubbleGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let gameRunning = false;
    let score = 0;
    let timeLeft = 30;
    let bubbles = [];

    class Bubble {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height;
            this.radius = Math.random() * 15 + 10;
            this.speedY = Math.random() * 1 + 0.5;
            this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        }

        update() {
            this.y -= this.speedY;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        isClicked(mx, my) {
            return Math.hypot(this.x - mx, this.y - my) < this.radius;
        }
    }

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = Math.min(600, rect.width - 40);
        canvas.height = 400;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function startGame() {
        gameRunning = true;
        score = 0;
        timeLeft = 30;
        bubbles = [];
        document.getElementById('gameStart').textContent = 'Game Running...';
        document.getElementById('gameScore').textContent = score;
        document.getElementById('gameTimer').textContent = timeLeft;

        const gameInterval = setInterval(() => {
            timeLeft--;
            document.getElementById('gameTimer').textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(gameInterval);
                endGame();
            }
        }, 1000);

        animate();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (Math.random() < 0.05 + timeLeft / 300) {
            bubbles.push(new Bubble());
        }

        bubbles = bubbles.filter(b => b.y > -b.radius);
        bubbles.forEach(b => {
            b.update();
            b.draw();
        });

        if (gameRunning) requestAnimationFrame(animate);
    }

    function endGame() {
        gameRunning = false;
        document.getElementById('gameStart').textContent = `Game Over! Score: ${score}`;
        document.getElementById('gameStart').disabled = false;
    }

    canvas.addEventListener('click', (e) => {
        if (!gameRunning) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        for (let i = bubbles.length - 1; i >= 0; i--) {
            if (bubbles[i].isClicked(mx, my)) {
                bubbles.splice(i, 1);
                score++;
                document.getElementById('gameScore').textContent = score;
                break;
            }
        }
    });

    document.getElementById('gameStart').addEventListener('click', () => {
        if (!gameRunning) startGame();
    });
}

document.addEventListener('DOMContentLoaded', initBubbleGame);

// ===== FEATURE 6: MOOD TRACKER / DAILY JOURNAL =====
function initMoodTracker() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const journalEntry = document.getElementById('journalEntry');
    const charCount = document.getElementById('charCount');
    const journalSubmit = document.getElementById('journalSubmit');
    const trackerClear = document.getElementById('trackerClear');
    const moodChart = document.getElementById('moodChart');
    const historyList = document.getElementById('historyList');

    let selectedMood = 0;

    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            moodButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedMood = parseInt(btn.dataset.mood);
        });
    });

    journalEntry.addEventListener('input', () => {
        charCount.textContent = `${journalEntry.value.length}/500`;
    });

    journalSubmit.addEventListener('click', () => {
        if (selectedMood === 0) {
            alert('Please select a mood first');
            return;
        }

        const entry = {
            date: new Date().toLocaleDateString(),
            mood: selectedMood,
            text: journalEntry.value
        };

        let entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
        entries.push(entry);
        if (entries.length > 30) entries.shift();
        localStorage.setItem('moodEntries', JSON.stringify(entries));

        moodButtons.forEach(b => b.classList.remove('selected'));
        journalEntry.value = '';
        charCount.textContent = '0/500';
        selectedMood = 0;
        
        renderTracker();
        alert('Entry saved!');
    });

    trackerClear.addEventListener('click', () => {
        if (confirm('Clear all mood data?')) {
            localStorage.removeItem('moodEntries');
            renderTracker();
        }
    });

    function renderTracker() {
        const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
        const last7 = entries.slice(-7);

        moodChart.innerHTML = last7.map((e, i) => {
            const moodEmoji = ['😢', '😕', '😐', '😊', '😄'];
            const height = (e.mood / 5) * 100;
            return `<div class="mood-bar" style="height: ${height}%" title="${e.date}: ${moodEmoji[e.mood - 1]}"></div>`;
        }).join('');

        historyList.innerHTML = entries.slice().reverse().slice(0, 5).map(e => {
            const moodEmoji = ['😢', '😕', '😐', '😊', '😄'];
            return `
                <div class="history-item">
                    <div><span class="history-date">${e.date}</span></div>
                    <div class="history-mood">${moodEmoji[e.mood - 1]}</div>
                </div>
            `;
        }).join('');
    }

    renderTracker();
}

document.addEventListener('DOMContentLoaded', initMoodTracker);

// ===== FEATURE 7: EXPANDED QUIZ + SHARE FUNCTIONALITY =====
const quizQuestions = [
    { question: "How often do you feel overwhelmed by your responsibilities?", options: ["Rarely or never", "Sometimes", "Often", "Almost always"] },
    { question: "How well are you sleeping lately?", options: ["Very well, 7-9 hours", "Okay, but could be better", "Poorly, I often wake up tired", "I can barely sleep at all"] },
    { question: "How would you describe your ability to concentrate?", options: ["I focus well most of the time", "Occasional difficulty focusing", "I frequently lose focus", "I can't concentrate on anything"] },
    { question: "How often do you experience physical symptoms (headaches, tension, stomach issues)?", options: ["Rarely", "A few times a month", "Several times a week", "Almost daily"] },
    { question: "How would you rate your overall mood in the past two weeks?", options: ["Generally positive and stable", "Mostly okay with some ups and downs", "Frequently anxious or irritable", "Consistently low, anxious, or hopeless"] },
    { question: "How much do you exercise or engage in physical activity?", options: ["5+ times per week", "3-4 times per week", "1-2 times per week", "Rarely or never"] },
    { question: "How many hours do you spend on screens daily?", options: ["Less than 2 hours", "2-4 hours", "4-6 hours", "More than 6 hours"] },
    { question: "How often do you feel supported by friends or family?", options: ["Always", "Usually", "Sometimes", "Rarely"] },
    { question: "How well do you handle setbacks or failures?", options: ["Very well, I bounce back quickly", "Okay, with some effort", "Struggle initially", "Overwhelmed, hard to recover"] },
    { question: "How satisfied are you with your work-life balance?", options: ["Very satisfied", "Mostly satisfied", "Somewhat dissatisfied", "Very dissatisfied"] }
];

let currentQuestion = 0;
const answers = new Array(quizQuestions.length).fill(-1);
const quizContent = document.getElementById('quizContent');
const quizPrev = document.getElementById('quizPrev');
const quizNext = document.getElementById('quizNext');
const quizStep = document.getElementById('quizStep');
const quizProgressBar = document.getElementById('quizProgressBar');
const quizContainer = document.getElementById('quizContainer');
const quizResult = document.getElementById('quizResult');

function renderQuestion() {
    const q = quizQuestions[currentQuestion];
    quizContent.innerHTML = `
        <div class="quiz-question">
            <h3>${currentQuestion + 1}. ${q.question}</h3>
            <div class="quiz-options">
                ${q.options.map((opt, i) => `
                    <button class="quiz-option ${answers[currentQuestion] === i ? 'selected' : ''}" data-val="${i}">${opt}</button>
                `).join('')}
            </div>
        </div>
    `;
    quizStep.textContent = `${currentQuestion + 1} / ${quizQuestions.length}`;
    quizProgressBar.style.width = `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;
    quizPrev.disabled = currentQuestion === 0;
    quizNext.textContent = currentQuestion === quizQuestions.length - 1 ? 'See Results' : 'Next →';
    quizContent.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
            answers[currentQuestion] = parseInt(btn.dataset.val);
            quizContent.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
}

quizPrev.addEventListener('click', () => {
    if (currentQuestion > 0) { currentQuestion--; renderQuestion(); }
});

quizNext.addEventListener('click', () => {
    if (answers[currentQuestion] === -1) {
        quizNext.style.animation = 'shake 0.3s ease';
        setTimeout(() => quizNext.style.animation = '', 300);
        return;
    }
    if (currentQuestion < quizQuestions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        showResults();
    }
});

function showResults() {
    const total = answers.reduce((a, b) => a + b, 0);
    const maxScore = (quizQuestions.length) * 3;
    const percent = Math.round((total / maxScore) * 100);
    let title, desc, color, solutions;

    if (percent <= 25) {
        title = "Low Stress 😊"; color = "#4ECDC4";
        desc = "Great news! Your stress levels appear low. Keep up your healthy habits and continue taking care of yourself.";
        solutions = [
            { icon: "🧘", title: "Maintain Mindfulness", text: "Continue your current practices. Try 10 minutes of daily meditation to stay grounded." },
            { icon: "📖", title: "Gratitude Journal", text: "Write 3 things you're grateful for each day to reinforce positivity." },
            { icon: "🌿", title: "Stay Active", text: "Keep regular exercise and outdoor time as part of your routine." },
            { icon: "😊", title: "Support Others", text: "Share your coping strategies with friends or peers who may need help." }
        ];
    } else if (percent <= 50) {
        title = "Moderate Stress 😐"; color = "#FFD93D";
        desc = "You're experiencing some stress. Consider incorporating relaxation techniques into your daily routine.";
        solutions = [
            { icon: "🫁", title: "4-7-8 Breathing", text: "Inhale for 4s, hold for 7s, exhale for 8s. Do this 3-4 times when feeling tense." },
            { icon: "🏃", title: "Daily Exercise", text: "Aim for 30 minutes of physical activity — walking, jogging, or yoga work great." },
            { icon: "📝", title: "Start Journaling", text: "Write your thoughts for 10 minutes each evening to process emotions and spot patterns." },
            { icon: "💬", title: "Talk It Out", text: "Share how you're feeling with a friend, family member, or school counselor." },
            { icon: "⏰", title: "Time Blocking", text: "Break tasks into focused 25-minute blocks with 5-min breaks (Pomodoro Technique)." },
            { icon: "🎵", title: "Music Therapy", text: "Create a calming playlist. Slow-tempo music (60-80 BPM) can lower cortisol levels." }
        ];
    } else if (percent <= 75) {
        title = "High Stress 😟"; color = "#FF8A5C";
        desc = "Your stress levels are elevated. It's important to take action now with these strategies.";
        solutions = [
            { icon: "🧘", title: "Guided Meditation", text: "Use apps like Headspace or Calm for daily guided sessions — start with just 5 minutes." },
            { icon: "😴", title: "Sleep Hygiene", text: "Set a consistent bedtime, avoid screens 1 hour before sleep, keep your room cool and dark." },
            { icon: "🚶", title: "Nature Walks", text: "Spend 20+ minutes in nature daily. Green spaces are proven to reduce cortisol significantly." },
            { icon: "📵", title: "Digital Detox", text: "Limit social media to 30 minutes daily. Turn off non-essential notifications." },
            { icon: "🍎", title: "Nutrition Focus", text: "Reduce caffeine and sugar. Eat omega-3 rich foods, leafy greens, and stay hydrated." },
            { icon: "💬", title: "Seek Support", text: "Talk to a school counselor, trusted teacher, or call a helpline. You don't need to handle this alone." },
            { icon: "✍️", title: "Worry Scheduling", text: "Set aside 15 minutes daily to write worries. Outside that time, redirect your focus." },
            { icon: "🎨", title: "Creative Outlet", text: "Drawing, painting, music, or crafts can channel stress into something productive and calming." }
        ];
    } else {
        title = "Very High Stress 😰"; color = "#FF6B8A";
        desc = "Your responses suggest significant stress. Please consider these steps and reach out for professional support.";
        solutions = [
            { icon: "🆘", title: "Talk to a Professional", text: "Please reach out to a counselor, therapist, or mental health professional. This is the most important step." },
            { icon: "📞", title: "Crisis Helplines", text: "If overwhelmed: call 988 (Suicide & Crisis Lifeline), or text HOME to 741741 (Crisis Text Line)." },
            { icon: "🫂", title: "Lean on Your Circle", text: "Tell someone you trust — a parent, teacher, friend, or mentor — exactly how you're feeling." },
            { icon: "🧘", title: "Grounding Exercise", text: "Use 5-4-3-2-1: Notice 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste." },
            { icon: "😴", title: "Prioritize Rest", text: "Your body needs recovery. Aim for 8-9 hours of sleep and give yourself permission to rest." },
            { icon: "📋", title: "Simplify Your Load", text: "Identify one commitment you can pause or delegate. Reducing pressure is not failure — it's wisdom." },
            { icon: "🚶", title: "Movement & Fresh Air", text: "Even a 10-minute slow walk outside can break the cycle of overwhelm." },
            { icon: "💚", title: "Self-Compassion", text: "You are not weak for feeling this way. Stress is real, valid, and manageable with the right support." }
        ];
    }

    quizContainer.style.display = 'none';
    quizResult.style.display = 'block';
    document.getElementById('resultTitle').textContent = title;
    document.getElementById('resultDesc').textContent = desc;
    const fill = document.getElementById('resultFill');
    fill.style.background = color;
    setTimeout(() => fill.style.width = percent + '%', 100);

    const grid = document.getElementById('solutionsGrid');
    grid.innerHTML = solutions.map((s, i) => `
        <div class="solution-card" style="--delay: ${i * 0.08}s">
            <div class="solution-icon">${s.icon}</div>
            <h5>${s.title}</h5>
            <p>${s.text}</p>
        </div>
    `).join('');

    // Store results for sharing
    localStorage.setItem('lastQuizResult', JSON.stringify({ percent, title, color, date: Date.now() }));
}

document.getElementById('quizRetake').addEventListener('click', () => {
    currentQuestion = 0;
    answers.fill(-1);
    quizContainer.style.display = 'block';
    quizResult.style.display = 'none';
    document.getElementById('resultFill').style.width = '0%';
    renderQuestion();
});

// Share functionality
document.getElementById('shareResult').addEventListener('click', () => {
    const result = JSON.parse(localStorage.getItem('lastQuizResult') || '{}');
    createShareImage(result.percent, result.title);
});

document.getElementById('copyResultLink').addEventListener('click', () => {
    const result = JSON.parse(localStorage.getItem('lastQuizResult') || '{}');
    const link = `${window.location.href.split('#')[0]}#result=${result.percent}`;
    navigator.clipboard.writeText(link).then(() => {
        alert('Result link copied to clipboard!');
    });
});

function createShareImage(percent, title) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, 800, 600);

    // Title
    ctx.fillStyle = '#f0f0f5';
    ctx.font = 'bold 36px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('My Stress Level Results', 400, 80);

    // Score meter
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(100, 150, 600, 40);
    ctx.fillStyle = '#6C63FF';
    ctx.fillRect(100, 150, (600 * percent / 100), 40);
    
    ctx.fillStyle = '#f0f0f5';
    ctx.font = 'bold 24px Inter';
    ctx.fillText(`${percent}%`, 400, 230);

    // Result title
    ctx.font = 'bold 28px Inter';
    ctx.fillText(title, 400, 300);

    // Text
    ctx.font = '16px Inter';
    ctx.fillStyle = '#a0a0b8';
    ctx.fillText('Take the full quiz at StressSense', 400, 400);
    ctx.fillText('Manage your stress effectively today!', 400, 450);

    // Download
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stress-level-result.png';
        a.click();
    });
}

renderQuestion();

// ===== FEATURE 8: AMBIENT SOUND PLAYER =====
function initSoundPlayer() {
    const soundToggle = document.getElementById('soundToggle');
    const soundPanel = document.getElementById('soundPanel');
    const soundClose = document.getElementById('soundClose');
    const soundOptions = document.querySelectorAll('.sound-option');
    const masterVolume = document.getElementById('masterVolume');
    const soundPlaying = document.getElementById('soundPlaying');

    const soundUrls = {
        rain: 'https://assets.mixkit.co/active_storage/sfx/2536/2536-preview.mp3',
        ocean: 'https://assets.mixkit.co/active_storage/sfx/2542/2542-preview.mp3',
        forest: 'https://assets.mixkit.co/active_storage/sfx/2589/2589-preview.mp3',
        lofi: 'https://assets.mixkit.co/active_storage/music/27296/27296-preview.mp3',
        white: 'https://assets.mixkit.co/active_storage/sfx/2400/2400-preview.mp3'
    };

    const audioElements = {};
    const soundStates = {};

    Object.keys(soundUrls).forEach(key => {
        const audio = new Audio(soundUrls[key]);
        audio.loop = true;
        audio.volume = 0.3;
        audioElements[key] = audio;
        soundStates[key] = false;
    });

    soundToggle.addEventListener('click', () => {
        soundPanel.style.display = soundPanel.style.display === 'none' ? 'block' : 'none';
    });

    soundClose.addEventListener('click', () => {
        soundPanel.style.display = 'none';
    });

    soundOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            const soundKey = btn.dataset.sound;
            soundStates[soundKey] = !soundStates[soundKey];

            if (soundStates[soundKey]) {
                audioElements[soundKey].play().catch(() => console.log('Audio play failed'));
                btn.classList.add('playing');
            } else {
                audioElements[soundKey].pause();
                audioElements[soundKey].currentTime = 0;
                btn.classList.remove('playing');
            }

            updatePlayingDisplay();
        });
    });

    masterVolume.addEventListener('input', (e) => {
        const vol = e.target.value / 100;
        Object.values(audioElements).forEach(audio => {
            audio.volume = vol * 0.3;
        });
    });

    function updatePlayingDisplay() {
        const playing = Object.keys(soundStates).filter(k => soundStates[k]);
        if (playing.length === 0) {
            soundPlaying.textContent = '';
        } else if (playing.length === 1) {
            soundPlaying.textContent = `Playing: ${playing[0].charAt(0).toUpperCase() + playing[0].slice(1)}`;
        } else {
            soundPlaying.textContent = `Playing: ${playing.length} sounds`;
        }
    }

    // Load saved preferences
    const saved = localStorage.getItem('soundPreferences');
    if (saved) {
        try {
            const prefs = JSON.parse(saved);
            masterVolume.value = prefs.volume || 50;
        } catch (e) {}
    }

    // Save preferences
    masterVolume.addEventListener('change', () => {
        localStorage.setItem('soundPreferences', JSON.stringify({ volume: masterVolume.value }));
    });
}

document.addEventListener('DOMContentLoaded', initSoundPlayer);

// ===== DASHBOARD & METRICS FUNCTIONS =====
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getLatestQuizScore() {
    const lastResult = localStorage.getItem('lastQuizResult');
    if (!lastResult) return null;
    try {
        const result = JSON.parse(lastResult);
        if (!result.percent && !result.score) return null;
        return {
            score: result.percent || result.score || 0,
            date: result.date || Date.now()
        };
    } catch (e) {
        return null;
    }
}

function get7DayMoodAverage() {
    const moodData = localStorage.getItem('moodEntries');
    if (!moodData) return 0;
    try {
        const entries = JSON.parse(moodData);
        const now = Date.now();
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
        
        const weekEntries = entries.filter(e => e.timestamp >= weekAgo);
        if (weekEntries.length === 0) return 0;
        
        const avgMood = weekEntries.reduce((sum, e) => sum + (e.mood || 0), 0) / weekEntries.length;
        return Math.round(avgMood * 10) / 10;
    } catch (e) {
        return 0;
    }
}

function getWeeklyBreathingStats() {
    const sessions = localStorage.getItem('breathingSessions');
    if (!sessions) return { count: 0, totalDuration: 0 };
    try {
        const parsed = JSON.parse(sessions);
        const now = Date.now();
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
        
        const weeklySessions = parsed.filter(s => s.timestamp >= weekAgo);
        const totalDuration = weeklySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        
        return {
            count: weeklySessions.length,
            totalDuration: totalDuration
        };
    } catch (e) {
        return { count: 0, totalDuration: 0 };
    }
}

function getJournalStreak() {
    const moodData = localStorage.getItem('moodEntries');
    if (!moodData) return 0;
    try {
        const entries = JSON.parse(moodData);
        if (entries.length === 0) return 0;
        
        const dates = entries.map(e => {
            const d = new Date(e.timestamp);
            return d.toISOString().split('T')[0];
        }).sort().reverse();
        
        let streak = 1;
        for (let i = 1; i < dates.length; i++) {
            const currDate = new Date(dates[i - 1]);
            const prevDate = new Date(dates[i]);
            const diff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
            
            if (diff === 1) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    } catch (e) {
        return 0;
    }
}

function updateDashboard() {
    const dashLatestScore = document.getElementById('dashLatestScore');
    const dashLatestDate = document.getElementById('dashLatestDate');
    const dashMoodAvg = document.getElementById('dashMoodAvg');
    const dashBreathCount = document.getElementById('dashBreathCount');
    const dashBreathDuration = document.getElementById('dashBreathDuration');
    const dashStreak = document.getElementById('dashStreak');
    
    if (!dashLatestScore) return;
    
    const quizScore = getLatestQuizScore();
    if (quizScore) {
        dashLatestScore.textContent = quizScore.score + '%';
        dashLatestDate.textContent = formatDate(quizScore.date);
    }
    
    const moodAvg = get7DayMoodAverage();
    if (moodAvg > 0) {
        dashMoodAvg.textContent = moodAvg + '/10';
    }
    
    const breathStats = getWeeklyBreathingStats();
    dashBreathCount.textContent = breathStats.count;
    dashBreathDuration.textContent = breathStats.totalDuration + ' min total';
    
    const streak = getJournalStreak();
    dashStreak.textContent = streak;
}

document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    
    const quizRetake = document.getElementById('quizRetake');
    const journalSubmit = document.getElementById('journalSubmit');
    
    if (quizRetake) quizRetake.addEventListener('click', updateDashboard);
    if (journalSubmit) journalSubmit.addEventListener('click', () => {
        setTimeout(updateDashboard, 100);
    });
});

// ===== SMOOTH SCROLL FOR NAV LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// ===== ACTIVE NAV LINK HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

function highlightNav() {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (link) {
            if (scrollY >= top && scrollY < top + height) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    });
}

window.addEventListener('scroll', highlightNav);
highlightNav();

// ===== PARALLAX HERO CONTENT ON SCROLL =====
const heroContent = document.querySelector('.hero-content');
const scrollIndicator = document.querySelector('.scroll-indicator');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (heroContent && scrollY < window.innerHeight) {
        const progress = scrollY / window.innerHeight;
        heroContent.style.transform = `translateY(${scrollY * 0.35}px)`;
        heroContent.style.opacity = 1 - progress * 1.3;
    }
    if (scrollIndicator && scrollY < window.innerHeight) {
        scrollIndicator.style.opacity = 1 - (scrollY / 200);
    }
});

// ===== MAGNETIC HOVER ON CARDS =====
document.querySelectorAll('.about-card, .tip-card, .stat-card, .level-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// ===== TILT GLOW EFFECT ON CARDS =====
document.querySelectorAll('.about-card, .tip-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--glow-x', x + '%');
        card.style.setProperty('--glow-y', y + '%');
    });
});

// ===== TYPED TEXT EFFECT ON HERO =====
(function typedEffect() {
    const tag = document.querySelector('.hero-tag');
    if (!tag) return;
    const originalText = tag.textContent;
    tag.textContent = '';
    tag.style.visibility = 'visible';
    let i = 0;
    function type() {
        if (i < originalText.length) {
            tag.textContent += originalText.charAt(i);
            i++;
            setTimeout(type, 80);
        }
    }
    setTimeout(type, 600);
})();

// ===== FLOATING PARTICLES OVERLAY =====
(function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.pulseSpeed = Math.random() * 0.02 + 0.005;
            this.pulseOffset = Math.random() * Math.PI * 2;
        }
        update(time) {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > w) this.speedX *= -1;
            if (this.y < 0 || this.y > h) this.speedY *= -1;
            this.currentOpacity = this.opacity * (0.5 + 0.5 * Math.sin(time * this.pulseSpeed + this.pulseOffset));
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(108, 99, 255, ${this.currentOpacity})`;
            ctx.fill();
        }
    }

    const count = Math.min(60, Math.floor(w * h / 20000));
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }

    let animTime = 0;
    function animate() {
        ctx.clearRect(0, 0, w, h);
        animTime++;
        particles.forEach(p => {
            p.update(animTime);
            p.draw();
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(108, 99, 255, ${0.06 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
})();

// ===== COUNTER-UP ON SCROLL FOR HERO STATS =====
const heroStatsRow = document.querySelector('.hero-stats-row');
if (heroStatsRow) {
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.hero-stat-num').forEach(el => {
                    if (!el.dataset.animated) {
                        const target = parseInt(el.dataset.target);
                        animateCounter(el, target);
                        el.dataset.animated = 'true';
                    }
                });
                heroObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    heroObserver.observe(heroStatsRow);
}

console.log('✨ StressSense 8-Feature Enhancement Loaded Successfully!');
