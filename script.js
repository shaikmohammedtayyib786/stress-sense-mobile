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
        // Hide fallback shapes once tubes are loaded
        const shapes = document.querySelector('.hero-bg-shapes');
        if (shapes) shapes.classList.add('hidden');
        // Click to randomize colors
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
// Close mobile nav on link click
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
            // Animate hero stat counters
            entry.target.querySelectorAll('.hero-stat-num').forEach(el => {
                const target = parseInt(el.dataset.target);
                animateCounter(el, target);
            });
            // Animate stat card values
            entry.target.querySelectorAll('.stat-value').forEach(el => {
                const target = parseInt(el.dataset.target);
                animateCounter(el, target);
            });
            // Animate circle charts
            entry.target.querySelectorAll('.circle-fg').forEach(circle => {
                const percent = parseInt(circle.dataset.percent);
                const offset = 314 - (314 * percent / 100);
                circle.style.strokeDashoffset = offset;
            });
            // Animate level fill bars
            entry.target.querySelectorAll('.level-fill').forEach(bar => {
                const level = bar.dataset.level;
                bar.style.width = level + '%';
            });
            // Animate bar chart fills
            entry.target.querySelectorAll('.bar-fill').forEach(bar => {
                const width = bar.dataset.width;
                bar.style.width = width + '%';
            });
            fadeObserver.unobserve(entry.target);
        }
    });
}, observerOptions);
document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));
// ===== QUIZ =====
const quizQuestions = [
    {
        question: "How often do you feel overwhelmed by your responsibilities?",
        options: ["Rarely or never", "Sometimes", "Often", "Almost always"]
    },
    {
        question: "How well are you sleeping lately?",
        options: ["Very well, 7-9 hours", "Okay, but could be better", "Poorly, I often wake up tired", "I can barely sleep at all"]
    },
    {
        question: "How would you describe your ability to concentrate?",
        options: ["I focus well most of the time", "Occasional difficulty focusing", "I frequently lose focus", "I can't concentrate on anything"]
    },
    {
        question: "How often do you experience physical symptoms (headaches, tension, stomach issues)?",
        options: ["Rarely", "A few times a month", "Several times a week", "Almost daily"]
    },
    {
        question: "How would you rate your overall mood in the past two weeks?",
        options: ["Generally positive and stable", "Mostly okay with some ups and downs", "Frequently anxious or irritable", "Consistently low, anxious, or hopeless"]
    }
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
    // Render solution cards
    const grid = document.getElementById('solutionsGrid');
    grid.innerHTML = solutions.map((s, i) => `
        <div class="solution-card" style="--delay: ${i * 0.08}s">
            <div class="solution-icon">${s.icon}</div>
            <h5>${s.title}</h5>
            <p>${s.text}</p>
        </div>
    `).join('');
}
document.getElementById('quizRetake').addEventListener('click', () => {
    currentQuestion = 0;
    answers.fill(-1);
    quizContainer.style.display = 'block';
    quizResult.style.display = 'none';
    document.getElementById('resultFill').style.width = '0%';
    renderQuestion();
});
renderQuestion();
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
    // Create particles
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
        // Draw connections
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
// ===== COUNTER-UP ON SCROLL FOR ANY REMAINING COUNTERS =====
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