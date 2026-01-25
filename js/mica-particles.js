/**
 * NAROA.ONLINE v5.0 — MICA PARTICLE SYSTEM
 * Three.js WebGL effect for floating mica/gold dust particles
 * Inspired by Bruno Simon's immersive experiences
 */

(function() {
    'use strict';

    // Check for Three.js and reduced motion preference
    if (typeof THREE === 'undefined') {
        console.warn('[MicaParticles] Three.js not loaded');
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        console.log('[MicaParticles] Reduced motion enabled, skipping particle system');
        return;
    }

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        particleCount: 150,          // Number of particles
        particleSize: { min: 2, max: 8 },
        colors: {
            gold: [0xD4AF37, 0xC5A028, 0xB8860B],   // Mica gold tones
            silver: [0xC0C0C0, 0xA8A8A8, 0x909090]  // Mica silver tones
        },
        movement: {
            speed: 0.0003,           // Rotation speed
            drift: 0.02,             // Vertical drift amount
            mouseInfluence: 0.0003   // Mouse parallax effect
        },
        bounds: {
            x: 30,
            y: 20,
            z: 15
        }
    };

    // ============================================
    // SCENE SETUP
    // ============================================
    let scene, camera, renderer, particles, clock;
    let mouseX = 0, mouseY = 0;
    let isVisible = true;
    let animationId = null;

    function init() {
        // Create container
        const container = document.createElement('div');
        container.id = 'mica-particles';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.6;
        `;
        document.body.insertBefore(container, document.body.firstChild);

        // Scene
        scene = new THREE.Scene();

        // Camera
        camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 30;

        // Renderer
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Clock for animation
        clock = new THREE.Clock();

        // Create particle system
        createParticles();

        // Event listeners
        setupEventListeners();

        // Start animation
        animate();

        console.log('[MicaParticles] Initialized with', CONFIG.particleCount, 'particles');
    }

    // ============================================
    // PARTICLE CREATION
    // ============================================
    function createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(CONFIG.particleCount * 3);
        const colors = new Float32Array(CONFIG.particleCount * 3);
        const sizes = new Float32Array(CONFIG.particleCount);
        const velocities = new Float32Array(CONFIG.particleCount * 3);

        const goldColors = CONFIG.colors.gold.map(c => new THREE.Color(c));
        const silverColors = CONFIG.colors.silver.map(c => new THREE.Color(c));

        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3;

            // Random position within bounds
            positions[i3] = (Math.random() - 0.5) * CONFIG.bounds.x * 2;
            positions[i3 + 1] = (Math.random() - 0.5) * CONFIG.bounds.y * 2;
            positions[i3 + 2] = (Math.random() - 0.5) * CONFIG.bounds.z * 2;

            // Random velocities for drifting
            velocities[i3] = (Math.random() - 0.5) * 0.01;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.01 - 0.005; // Slight downward drift
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;

            // Random color (mix of gold and silver)
            const colorPool = Math.random() > 0.3 ? goldColors : silverColors;
            const color = colorPool[Math.floor(Math.random() * colorPool.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            // Random size
            sizes[i] = CONFIG.particleSize.min + 
                       Math.random() * (CONFIG.particleSize.max - CONFIG.particleSize.min);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Store velocities for animation
        geometry.userData.velocities = velocities;

        // Create shader material for sparkle effect
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: renderer.getPixelRatio() }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                varying float vOpacity;
                uniform float time;
                uniform float pixelRatio;
                
                void main() {
                    vColor = color;
                    
                    // Twinkle effect
                    float twinkle = sin(time * 2.0 + position.x * 10.0 + position.y * 10.0) * 0.5 + 0.5;
                    vOpacity = 0.4 + twinkle * 0.6;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z) * (0.5 + twinkle * 0.5);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vOpacity;
                
                void main() {
                    // Circular particle with soft edge
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    if (dist > 0.5) discard;
                    
                    // Soft glow
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    alpha *= vOpacity;
                    
                    // Add sparkle highlight
                    float sparkle = pow(1.0 - dist * 2.0, 3.0) * 0.5;
                    vec3 finalColor = vColor + vec3(sparkle);
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);
    }

    // ============================================
    // ANIMATION
    // ============================================
    function animate() {
        if (!isVisible) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        const elapsedTime = clock.getElapsedTime();
        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.geometry.userData.velocities;

        // Update particle positions
        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3;

            // Apply velocity
            positions[i3] += velocities[i3];
            positions[i3 + 1] += velocities[i3 + 1];
            positions[i3 + 2] += velocities[i3 + 2];

            // Add subtle sine wave movement
            positions[i3] += Math.sin(elapsedTime * 0.5 + i * 0.1) * 0.002;
            positions[i3 + 1] += Math.cos(elapsedTime * 0.3 + i * 0.1) * 0.002;

            // Boundary check - wrap around
            if (positions[i3] > CONFIG.bounds.x) positions[i3] = -CONFIG.bounds.x;
            if (positions[i3] < -CONFIG.bounds.x) positions[i3] = CONFIG.bounds.x;
            if (positions[i3 + 1] > CONFIG.bounds.y) positions[i3 + 1] = -CONFIG.bounds.y;
            if (positions[i3 + 1] < -CONFIG.bounds.y) positions[i3 + 1] = CONFIG.bounds.y;
            if (positions[i3 + 2] > CONFIG.bounds.z) positions[i3 + 2] = -CONFIG.bounds.z;
            if (positions[i3 + 2] < -CONFIG.bounds.z) positions[i3 + 2] = CONFIG.bounds.z;
        }

        particles.geometry.attributes.position.needsUpdate = true;

        // Update shader time uniform
        particles.material.uniforms.time.value = elapsedTime;

        // Mouse influence on camera
        camera.position.x += (mouseX * CONFIG.movement.mouseInfluence - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * CONFIG.movement.mouseInfluence - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // Slow rotation
        particles.rotation.y += CONFIG.movement.speed;

        renderer.render(scene, camera);
        animationId = requestAnimationFrame(animate);
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    function setupEventListeners() {
        // Mouse movement
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - window.innerWidth / 2);
            mouseY = (e.clientY - window.innerHeight / 2);
        });

        // Window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Visibility change (pause when tab not visible)
        document.addEventListener('visibilitychange', () => {
            isVisible = !document.hidden;
        });

        // Reduced motion toggle
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="reduce-motion"]')) {
                toggleVisibility();
            }
        });
    }

    function toggleVisibility() {
        const container = document.getElementById('mica-particles');
        if (container) {
            const isReduced = document.body.classList.contains('reduce-motion');
            container.style.opacity = isReduced ? '0' : '0.6';
        }
    }

    // ============================================
    // CLEANUP
    // ============================================
    function destroy() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        if (renderer) {
            renderer.dispose();
        }
        const container = document.getElementById('mica-particles');
        if (container) {
            container.remove();
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function initOnReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            // Small delay to ensure Three.js is fully loaded
            setTimeout(init, 100);
        }
    }

    // Export
    window.MicaParticles = {
        init: initOnReady,
        destroy,
        toggleVisibility
    };

    // Auto-initialize
    initOnReady();

})();
