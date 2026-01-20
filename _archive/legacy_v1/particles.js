/**
 * NAROA GUTIÉRREZ GIL - PARTICLE SYSTEM
 * Subtle floating particles that react to cursor
 * Minimalist palette: Naroa Red (#c41e3a) + Soft Greys
 */

class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150, down: false };
        this.maxParticles = 80; // Increased for more density
        this.animationId = null;

        // Check for reduced motion preference
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Check for mobile
        this.isMobile = window.innerWidth < 768;

        if (!this.reducedMotion && !this.isMobile) {
            this.init();
        }
    }

    init() {
        this.createCanvas();
        this.createParticles();
        this.setupEventListeners();
        this.animate();
    }

    createCanvas() {
        this.canvas = document.getElementById('particle-canvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'particle-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '1'; // Above bg-decoration, below content
            this.canvas.style.opacity = '0.5';
            document.body.prepend(this.canvas);
        }

        this.ctx = this.canvas.getContext('2d');
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];

        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
            this.mouse.down = false;
        });

        window.addEventListener('mousedown', () => {
            this.mouse.down = true;
        });

        window.addEventListener('mouseup', () => {
            this.mouse.down = false;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections between nearby particles
        this.drawConnections();

        // Update and draw particles
        this.particles.forEach(particle => {
            particle.update(this.mouse);
            particle.draw(this.ctx);
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawConnections() {
        const maxDistance = 150;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (1 - (distance / maxDistance)) * 0.12;

                    this.ctx.beginPath();
                    this.ctx.strokeStyle = this.particles[i].isRed 
                        ? `rgba(196, 30, 58, ${opacity})` 
                        : `rgba(40, 40, 40, ${opacity * 0.5})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.baseX = this.x;
        this.baseY = this.y;

        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.vx = 0;
        this.vy = 0;

        this.isRed = Math.random() > 0.75; // More red particles
        this.alpha = Math.random() * 0.5 + 0.1;
        this.glowSize = Math.random() * 15 + 8;
        this.angle = Math.random() * Math.PI * 2;
        this.angularVelocity = (Math.random() - 0.5) * 0.02;
    }

    update(mouse) {
        // Liquid drift
        this.x += this.speedX + Math.sin(this.angle) * 0.2;
        this.y += this.speedY + Math.cos(this.angle) * 0.2;
        this.angle += this.angularVelocity;

        if (this.x < -20) this.x = this.canvas.width + 20;
        if (this.x > this.canvas.width + 20) this.x = -20;
        if (this.y < -20) this.y = this.canvas.height + 20;
        if (this.y > this.canvas.height + 20) this.y = -20;

        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const angle = Math.atan2(dy, dx);

                // Fluid drag effect
                const drag = this.isRed ? 2.5 : 1.2;
                this.x -= Math.cos(angle) * force * drag;
                this.y -= Math.sin(angle) * force * drag;

                // Vortex Effect on Click - Refined for "Premium" feel
                if (mouse.down) {
                    const vortexForce = 6.0;
                    const inwardPull = 0.5;
                    this.x += (Math.cos(angle + Math.PI / 2) * vortexForce - Math.cos(angle) * inwardPull) * force;
                    this.y += (Math.sin(angle + Math.PI / 2) * vortexForce - Math.sin(angle) * inwardPull) * force;
                }

                // Burst Effect - NEW
                if (mouse.down && distance < 100) {
                    this.vx += (Math.random() - 0.5) * 5;
                    this.vy += (Math.random() - 0.5) * 5;
                }
            }
        }

        // Apply velocity from burst effect, with some decay
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.9; // Decay velocity
        this.vy *= 0.9; // Decay velocity

        this.alpha = 0.15 + Math.sin(Date.now() * 0.001 + this.x * 0.002) * 0.2;
    }

    draw(ctx) {
        const color = this.isRed ? `rgba(196, 30, 58, ${this.alpha})` : `rgba(26, 26, 26, ${this.alpha})`;

        // Glow effect
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.glowSize
        );

        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.glowSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }
}


// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.particleSystem = new ParticleSystem();
});
