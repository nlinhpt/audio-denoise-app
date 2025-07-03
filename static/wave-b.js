const canvas = document.getElementById('wave-bg');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

let time = 0;
let mouseX = 0;
let mouseY = 0;

// Track mouse movement for interactive effects
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
});

function drawWaveBackground() {
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0a0a0f');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw flowing waves
    ctx.save();
    
    // Primary wave layers
    for (let layer = 0; layer < 4; layer++) {
        drawWaveLayer(layer);
    }
    
    // Particle system
    drawParticles();
    
    ctx.restore();
    
    time += 0.005;
    requestAnimationFrame(drawWaveBackground);
}

function drawWaveLayer(layer) {
    const amplitude = 60 + layer * 20 + Math.sin(time * 2) * 10;
    const frequency = 0.008 + layer * 0.002;
    const speed = time * (0.5 + layer * 0.3);
    const yOffset = canvas.height * 0.5 + layer * 40 - 80;
    
    ctx.beginPath();
    ctx.globalAlpha = 0.15 - layer * 0.03;
    
    for (let x = 0; x <= canvas.width + 50; x += 3) {
        const mouseInfluence = Math.exp(-Math.pow(x - mouseX * canvas.width, 2) / 10000) * mouseY * 30;
        const y = Math.sin(x * frequency + speed) * amplitude + 
                 Math.sin(x * frequency * 1.5 + speed * 1.2) * amplitude * 0.5 + 
                 yOffset + mouseInfluence;
        
        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    // Create gradient stroke
    const strokeGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    strokeGradient.addColorStop(0, `hsla(${180 + layer * 20}, 70%, 60%, 0.8)`);
    strokeGradient.addColorStop(0.5, `hsla(${200 + layer * 25}, 80%, 70%, 1)`);
    strokeGradient.addColorStop(1, `hsla(${220 + layer * 30}, 70%, 60%, 0.8)`);
    
    ctx.strokeStyle = strokeGradient;
    ctx.lineWidth = 2.5 - layer * 0.4;
    ctx.lineCap = 'round';
    ctx.stroke();
}

// Particle system for extra visual appeal
const particles = [];
const maxParticles = 50;

function initParticles() {
    for (let i = 0; i < maxParticles; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.1,
            hue: Math.random() * 60 + 180
        });
    }
}

function drawParticles() {
    particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Mouse interaction
        const dx = particle.x - mouseX * canvas.width;
        const dy = particle.y - mouseY * canvas.height;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.vx += (dx / distance) * force * 0.01;
            particle.vy += (dy / distance) * force * 0.01;
        }
        
        // Apply friction
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        
        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = `hsl(${particle.hue}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsl(${particle.hue}, 70%, 60%)`;
        ctx.fill();
        ctx.restore();
    });
}

// Initialize and start animation
initParticles();
drawWaveBackground();

// Resize handler
window.addEventListener('resize', () => {
    resize();
    // Redistribute particles on resize
    particles.forEach(particle => {
        if (particle.x > canvas.width) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = canvas.height;
    });
});