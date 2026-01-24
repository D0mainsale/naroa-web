/**
 * UNIFIED GALLERY — Museo Virtual 3D + Interacción Táctil
 * Fusión de gallery-3d.js y tactile-gallery.js
 * 
 * Features:
 * 🏛️ Museo 3D navegable con Three.js
 * ✋ Click en obras para examinar en modo táctil
 * 🔄 Rotar, zoom, voltear obras individuales
 * 💡 Iluminación premium de museo
 * 
 * v3.0.0 - 2026-01-24 — Unified Edition
 */

class UnifiedGallery {
    constructor() {
        // 3D Museum state
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.artworkMeshes = [];
        this.isMuseumActive = false;
        this.clock = null;
        this.raycaster = null;
        
        // Movement — Enhanced Navigation v2
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.isSprinting = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.moveSpeed = 60;
        this.sprintMultiplier = 2.0;
        this.acceleration = 200;
        this.deceleration = 8;
        
        // Head bob effect
        this.headBobTime = 0;
        this.headBobIntensity = 0.08;
        this.headBobSpeed = 12;
        this.baseHeight = 4.5;
        
        // Proximity detection
        this.nearbyArtwork = null;
        this.artworkProximityDistance = 8;
        
        // Gallery settings
        this.roomWidth = 50;
        this.roomHeight = 10;
        this.roomDepth = 80;
        
        // Minimap
        this.minimapCanvas = null;
        this.minimapCtx = null;
        
        // Tactile mode state
        this.isTactileMode = false;
        this.tactileCard = null;
        this.rotation = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
        this.scale = 1;
        this.targetScale = 1;
        this.tactileVelocity = { x: 0, y: 0 };
        this.isDragging = false;
        this.lastPos = { x: 0, y: 0 };
        this.isFlipped = false;
        
        // Physics
        this.friction = 0.92;
        this.lerp = 0.12;
        this.maxRotation = 45;
        this.maxZoom = 5;
        this.minZoom = 1;
        
        // Artworks data
        this.artworks = [];
        
        console.log('🏛️✋ Unified Gallery loaded');
    }
    
    async init() {
        await this.loadThreeJS();
        this.createUI();
        this.addStyles();
        this.setupTactileOnCards();
    }
    
    async loadThreeJS() {
        if (typeof THREE !== 'undefined') return;
        
        const loadScript = (src) => new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
        
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/PointerLockControls.js');
        console.log('✅ Three.js loaded');
    }
    
    createUI() {
        // Main toggle button
        const btn = document.createElement('div');
        btn.className = 'unified-gallery-toggle';
        btn.innerHTML = `
            <button class="unified-btn" title="Museo Virtual 3D">
                <span class="unified-icon">🏛️</span>
                <span class="unified-text">Museo 3D</span>
            </button>
        `;
        document.body.appendChild(btn);
        btn.querySelector('.unified-btn').addEventListener('click', () => this.openMuseum());
        
        // Museum container
        this.container = document.createElement('div');
        this.container.className = 'unified-museum hidden';
        this.container.innerHTML = `
            <div class="museum-header">
                <div class="museum-branding">
                    <span>🏛️</span>
                    <div>
                        <h2>Museo Virtual</h2>
                        <p>Naroa Gutiérrez Gil</p>
                    </div>
                </div>
                <div class="museum-controls">
                    <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Mover
                    <span>|</span>
                    <kbd>⇧ Shift</kbd> Sprint
                    <span>|</span>
                    <kbd>Click</kbd> Examinar obra
                    <span>|</span>
                    <kbd>ESC</kbd> Salir
                </div>
                <button class="museum-close">✕</button>
            </div>
            <div class="museum-canvas-wrapper">
                <canvas class="museum-canvas"></canvas>
                <div class="museum-crosshair">◎</div>
                <div class="museum-minimap">
                    <canvas class="minimap-canvas" width="180" height="240"></canvas>
                    <div class="minimap-label">Planta del Museo</div>
                </div>
                <div class="museum-artwork-hint hidden">
                    <span class="hint-icon">🖼️</span>
                    <span class="hint-text">Click para examinar</span>
                </div>
                <div class="museum-speed-indicator">🚶</div>
            </div>
            <div class="museum-loading">
                <div class="museum-spinner"></div>
                <p>Construyendo museo...</p>
            </div>
            <div class="museum-instructions">
                <div class="museum-instructions-content">
                    <div class="instructions-icon">👆</div>
                    <p>Haz click para explorar el museo</p>
                    <span>Mantén ⇧ Shift para correr · Click en una obra para verla</span>
                </div>
            </div>
        `;
        document.body.appendChild(this.container);
        
        // Tactile overlay (for examining individual artworks)
        this.tactileOverlay = document.createElement('div');
        this.tactileOverlay.className = 'tactile-overlay';
        this.tactileOverlay.innerHTML = `
            <div class="tactile-workspace">
                <div class="tactile-card-container"></div>
                <div class="tactile-instructions">
                    <span>🖱️ Arrastra para rotar</span>
                    <span>🔍 Scroll para zoom</span>
                    <span>👆 Doble-click para voltear</span>
                </div>
                <button class="tactile-close">✕</button>
                <button class="tactile-back-to-museum">← Volver al museo</button>
            </div>
        `;
        document.body.appendChild(this.tactileOverlay);
        
        // Events
        this.container.querySelector('.museum-close').addEventListener('click', () => this.closeMuseum());
        this.container.querySelector('.museum-instructions').addEventListener('click', () => this.lockPointer());
        this.tactileOverlay.querySelector('.tactile-close').addEventListener('click', () => this.closeTactile());
        this.tactileOverlay.querySelector('.tactile-back-to-museum').addEventListener('click', () => this.closeTactile());
    }
    
    // ═══════════════════════════════════════════════════════════
    // MUSEUM MODE (3D)
    // ═══════════════════════════════════════════════════════════
    
    async openMuseum() {
        this.container.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        const loading = this.container.querySelector('.museum-loading');
        loading.classList.add('active');
        
        await this.initScene();
        this.loadArtworks();
        this.buildMuseum();
        this.createAtmosphere();
        this.initMinimap();
        
        loading.classList.remove('active');
        this.isMuseumActive = true;
        this.animate();
        
        console.log('🏛️ Museum opened with enhanced navigation');
    }
    
    closeMuseum() {
        this.isMuseumActive = false;
        this.container.classList.add('hidden');
        document.body.style.overflow = '';
        
        if (this.controls?.isLocked) {
            this.controls.unlock();
        }
        
        console.log('🏛️ Museum closed');
    }
    
    async initScene() {
        const canvas = this.container.querySelector('.museum-canvas');
        const wrapper = this.container.querySelector('.museum-canvas-wrapper');
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.012);
        
        this.camera = new THREE.PerspectiveCamera(70, wrapper.clientWidth / wrapper.clientHeight, 0.1, 500);
        this.camera.position.set(0, 4.5, 30);
        
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        
        if (typeof THREE.PointerLockControls !== 'undefined') {
            this.controls = new THREE.PointerLockControls(this.camera, canvas);
            this.scene.add(this.controls.getObject());
            
            this.controls.addEventListener('lock', () => {
                this.container.querySelector('.museum-instructions').classList.add('hidden');
            });
            this.controls.addEventListener('unlock', () => {
                if (this.isMuseumActive && !this.isTactileMode) {
                    this.container.querySelector('.museum-instructions').classList.remove('hidden');
                }
            });
        }
        
        this.raycaster = new THREE.Raycaster();
        this.clock = new THREE.Clock();
        
        this.addLighting();
        this.bindMuseumEvents();
        
        window.addEventListener('resize', () => this.onResize());
    }
    
    addLighting() {
        const ambient = new THREE.AmbientLight(0xfff5e6, 0.15);
        this.scene.add(ambient);
        
        [[0, 0], [0, -20], [0, -40]].forEach(([x, z]) => {
            const light = new THREE.PointLight(0xfff0e0, 0.4, 30);
            light.position.set(x, this.roomHeight - 0.5, z);
            light.castShadow = true;
            this.scene.add(light);
        });
    }
    
    loadArtworks() {
        this.artworks = [
            { id: 1, title: 'DiviNos VaiVenes I', technique: 'Grafito y mica', year: '2026', description: 'Serie que explora los vaivenes emocionales a través de iconos del cine.', image: '/images/optimized/853524166127006_000001_485141007_1310753923737359_3104141236670420796_n.webp' },
            { id: 2, title: 'DiviNos VaiVenes II', technique: 'Carbón y mica', year: '2026', description: 'El baile de polaridades complementarias: luz y tiniebla.', image: '/images/optimized/853524166127006_000002_485142581_1310753963737355_5413431824173292980_n.webp' },
            { id: 3, title: 'Serie del Error I', technique: 'Grafito', year: '2024', description: 'El error como método creativo.', image: '/images/optimized/1111052607040826_000001_488801818_1326493758830042_9047190515717355076_n.webp' },
            { id: 4, title: 'Serie del Error II', technique: 'Técnica mixta', year: '2024', description: 'La belleza de lo imperfecto.', image: '/images/optimized/1111052607040826_000003_488904810_1326493332163418_8036600761455551925_n.webp' },
            { id: 5, title: 'Iconos Pop I', technique: 'Acrílico', year: '2020', description: 'Rostros que trascienden su fama.', image: '/images/optimized/551743489638410_000002_475668184_1271253591020726_6657980105758186982_n.webp' },
            { id: 6, title: 'Iconos Pop II', technique: 'Acrílico y grafito', year: '2020', description: 'La mirada del icono.', image: '/images/optimized/551743489638410_000005_475783569_1271253671020718_8162290046042793177_n.webp' },
            { id: 7, title: 'Vaivenes I', technique: 'Grafito', year: '2019', description: 'Retratos que pendulean entre estados.', image: '/images/optimized/1577827357030013_000001_616035859_1577822453697170_3937842745320602184_n.webp' },
            { id: 8, title: 'Vaivenes II', technique: 'Carbón', year: '2019', description: 'El retrato como ventana al alma.', image: '/images/optimized/1577827357030013_000008_615932964_1577822457030503_2110397705300850911_n.webp' },
            { id: 9, title: 'Retrato I', technique: 'Grafito', year: '2022', description: 'La búsqueda de lo permanente.', image: '/images/optimized/1571125317700217_000001_612329591_1571120784367337_8798688892093004057_n.webp' },
            { id: 10, title: 'Retrato II', technique: 'Grafito y tinta', year: '2022', description: 'Capturando la esencia.', image: '/images/optimized/1571125317700217_000007_614639292_1571120764367339_609424517255324890_n.webp' },
            { id: 11, title: 'Espejos I', technique: 'Acrílico', year: '2015', description: 'Todos somos lo mismo.', image: '/images/optimized/1112397760239644_000001_488633569_1326500505496034_1381147627022751779_n.webp' },
            { id: 12, title: 'Espejos II', technique: 'Óleo', year: '2015', description: 'Una misma inmensa identidad.', image: '/images/optimized/1112397760239644_000005_488887780_1326500332162718_7659033577272622277_n.webp' }
        ];
    }
    
    buildMuseum() {
        // Floor
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1815, roughness: 0.4 });
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(this.roomWidth, this.roomDepth), floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Walls
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8f5f0, roughness: 0.9 });
        
        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(this.roomWidth, this.roomHeight), wallMat);
        backWall.position.set(0, this.roomHeight / 2, -this.roomDepth / 2);
        this.scene.add(backWall);
        
        const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(this.roomDepth, this.roomHeight), wallMat);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-this.roomWidth / 2, this.roomHeight / 2, 0);
        this.scene.add(leftWall);
        
        const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(this.roomDepth, this.roomHeight), wallMat);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.set(this.roomWidth / 2, this.roomHeight / 2, 0);
        this.scene.add(rightWall);
        
        // Place artworks
        this.placeArtworks();
    }
    
    placeArtworks() {
        const loader = new THREE.TextureLoader();
        
        // Left wall (4 obras)
        this.artworks.slice(0, 4).forEach((art, i) => {
            this.createFrame(art, { x: -this.roomWidth/2 + 0.3, y: 4.5, z: -25 + i * 15 }, Math.PI/2, loader);
        });
        
        // Right wall (4 obras)
        this.artworks.slice(4, 8).forEach((art, i) => {
            this.createFrame(art, { x: this.roomWidth/2 - 0.3, y: 4.5, z: -25 + i * 15 }, -Math.PI/2, loader);
        });
        
        // Back wall (4 obras)
        this.artworks.slice(8, 12).forEach((art, i) => {
            this.createFrame(art, { x: -12 + i * 8, y: 4.5, z: -this.roomDepth/2 + 0.3 }, 0, loader);
        });
    }
    
    createFrame(artwork, pos, rot, loader) {
        const group = new THREE.Group();
        const frameW = 5, frameH = 4, border = 0.25;
        
        // Golden frame
        const frameMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.7, roughness: 0.3 });
        
        [
            [0, frameH/2 + border/2, 0, frameW + border*2, border],
            [0, -frameH/2 - border/2, 0, frameW + border*2, border],
            [-frameW/2 - border/2, 0, 0, border, frameH],
            [frameW/2 + border/2, 0, 0, border, frameH]
        ].forEach(([x, y, z, w, h]) => {
            const piece = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.15), frameMat);
            piece.position.set(x, y, z);
            piece.castShadow = true;
            group.add(piece);
        });
        
        // Artwork texture
        loader.load(artwork.image, (texture) => {
            texture.encoding = THREE.sRGBEncoding;
            const artMat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.4 });
            const artMesh = new THREE.Mesh(new THREE.PlaneGeometry(frameW - 0.6, frameH - 0.6), artMat);
            artMesh.position.z = 0.08;
            artMesh.userData = { isArtwork: true, artwork };
            group.add(artMesh);
            this.artworkMeshes.push(artMesh);
        });
        
        group.position.set(pos.x, pos.y, pos.z);
        group.rotation.y = rot;
        this.scene.add(group);
        
        // Spotlight
        const spot = new THREE.SpotLight(0xfff8e8, 1.2);
        const offsetX = rot === 0 ? 0 : (rot > 0 ? 4 : -4);
        const offsetZ = rot === 0 ? 6 : 0;
        spot.position.set(pos.x + offsetX, this.roomHeight - 1, pos.z + offsetZ);
        const target = new THREE.Object3D();
        target.position.set(pos.x, pos.y, pos.z);
        this.scene.add(target);
        spot.target = target;
        spot.angle = Math.PI / 8;
        spot.penumbra = 0.5;
        spot.castShadow = true;
        this.scene.add(spot);
    }
    
    createAtmosphere() {
        const particles = new Float32Array(300 * 3);
        for (let i = 0; i < 300; i++) {
            particles[i*3] = (Math.random() - 0.5) * this.roomWidth;
            particles[i*3+1] = Math.random() * this.roomHeight;
            particles[i*3+2] = (Math.random() - 0.5) * this.roomDepth;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(particles, 3));
        const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, opacity: 0.4, transparent: true });
        this.dustParticles = new THREE.Points(geo, mat);
        this.scene.add(this.dustParticles);
    }
    
    bindMuseumEvents() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        this.container.addEventListener('click', () => this.onMuseumClick());
    }
    
    lockPointer() {
        if (this.controls && !this.controls.isLocked) {
            this.controls.lock();
        }
    }
    
    onKeyDown(e) {
        if (!this.isMuseumActive || !this.controls?.isLocked) return;
        switch (e.code) {
            case 'KeyW': case 'ArrowUp': this.moveForward = true; break;
            case 'KeyS': case 'ArrowDown': this.moveBackward = true; break;
            case 'KeyA': case 'ArrowLeft': this.moveLeft = true; break;
            case 'KeyD': case 'ArrowRight': this.moveRight = true; break;
            case 'ShiftLeft': case 'ShiftRight': 
                this.isSprinting = true;
                this.updateSpeedIndicator();
                break;
        }
    }
    
    onKeyUp(e) {
        switch (e.code) {
            case 'KeyW': case 'ArrowUp': this.moveForward = false; break;
            case 'KeyS': case 'ArrowDown': this.moveBackward = false; break;
            case 'KeyA': case 'ArrowLeft': this.moveLeft = false; break;
            case 'KeyD': case 'ArrowRight': this.moveRight = false; break;
            case 'ShiftLeft': case 'ShiftRight': 
                this.isSprinting = false;
                this.updateSpeedIndicator();
                break;
        }
    }
    
    updateSpeedIndicator() {
        const indicator = this.container.querySelector('.museum-speed-indicator');
        if (indicator) {
            indicator.textContent = this.isSprinting ? '🏃' : '🚶';
            indicator.classList.toggle('sprinting', this.isSprinting);
        }
    }
    
    onMuseumClick() {
        if (!this.isMuseumActive || !this.controls?.isLocked) return;
        
        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        const hits = this.raycaster.intersectObjects(this.artworkMeshes);
        
        if (hits.length > 0 && hits[0].distance < 10) {
            const artwork = hits[0].object.userData.artwork;
            if (artwork) {
                this.openTactile(artwork);
            }
        }
    }
    
    // ═══════════════════════════════════════════════════════════
    // TACTILE MODE (2D Examination)
    // ═══════════════════════════════════════════════════════════
    
    openTactile(artwork) {
        this.isTactileMode = true;
        
        if (this.controls?.isLocked) {
            this.controls.unlock();
        }
        
        const cardContainer = this.tactileOverlay.querySelector('.tactile-card-container');
        cardContainer.innerHTML = `
            <div class="tactile-card">
                <div class="tactile-inner">
                    <div class="tactile-front">
                        <img src="${artwork.image}" alt="${artwork.title}">
                    </div>
                    <div class="tactile-back">
                        <h3>${artwork.title}</h3>
                        <p class="tactile-tech">${artwork.technique} · ${artwork.year}</p>
                        <p class="tactile-desc">${artwork.description}</p>
                        <div class="tactile-flip-hint">↻ Doble-click para volver</div>
                    </div>
                </div>
            </div>
        `;
        
        this.tactileCard = cardContainer.querySelector('.tactile-card');
        this.rotation = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
        this.scale = 1;
        this.targetScale = 1;
        this.isFlipped = false;
        
        this.tactileOverlay.classList.add('active');
        this.bindTactileEvents();
        this.animateTactile();
        
        console.log('✋ Tactile mode:', artwork.title);
    }
    
    closeTactile() {
        this.isTactileMode = false;
        this.tactileOverlay.classList.remove('active');
        this.tactileCard = null;
        
        // Return to museum navigation
        if (this.isMuseumActive) {
            setTimeout(() => {
                this.container.querySelector('.museum-instructions').classList.remove('hidden');
            }, 300);
        }
    }
    
    bindTactileEvents() {
        const container = this.tactileOverlay.querySelector('.tactile-card-container');
        
        container.onmousedown = (e) => {
            this.isDragging = true;
            this.lastPos = { x: e.clientX, y: e.clientY };
            this.tactileVelocity = { x: 0, y: 0 };
        };
        
        document.onmousemove = (e) => {
            if (!this.isDragging || !this.tactileCard) return;
            const dx = e.clientX - this.lastPos.x;
            const dy = e.clientY - this.lastPos.y;
            this.tactileVelocity = { x: dx * 0.5, y: dy * 0.5 };
            this.targetRotation.y += dx * 0.3;
            this.targetRotation.x -= dy * 0.3;
            this.targetRotation.x = Math.max(-this.maxRotation, Math.min(this.maxRotation, this.targetRotation.x));
            this.lastPos = { x: e.clientX, y: e.clientY };
        };
        
        document.onmouseup = () => {
            this.isDragging = false;
        };
        
        container.onwheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.targetScale = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetScale + delta));
        };
        
        container.ondblclick = () => {
            this.isFlipped = !this.isFlipped;
            this.targetRotation.y += 180;
            if ('vibrate' in navigator) navigator.vibrate([30, 50, 30]);
        };
        
        document.onkeydown = (e) => {
            if (e.key === 'Escape' && this.isTactileMode) {
                this.closeTactile();
            }
        };
    }
    
    animateTactile() {
        if (!this.tactileCard || !this.isTactileMode) return;
        
        if (!this.isDragging) {
            this.targetRotation.y += this.tactileVelocity.x;
            this.targetRotation.x += this.tactileVelocity.y;
            this.tactileVelocity.x *= this.friction;
            this.tactileVelocity.y *= this.friction;
        }
        
        this.rotation.x += (this.targetRotation.x - this.rotation.x) * this.lerp;
        this.rotation.y += (this.targetRotation.y - this.rotation.y) * this.lerp;
        this.scale += (this.targetScale - this.scale) * this.lerp;
        
        const inner = this.tactileCard.querySelector('.tactile-inner');
        if (inner) {
            inner.style.transform = `
                perspective(1200px)
                rotateX(${this.rotation.x}deg)
                rotateY(${this.rotation.y}deg)
                scale(${this.scale})
            `;
        }
        
        requestAnimationFrame(() => this.animateTactile());
    }
    
    // ═══════════════════════════════════════════════════════════
    // ANIMATION LOOP
    // ═══════════════════════════════════════════════════════════
    
    animate() {
        if (!this.isMuseumActive) return;
        requestAnimationFrame(() => this.animate());
        
        const delta = Math.min(this.clock.getDelta(), 0.1); // Cap delta for stability
        
        if (this.controls?.isLocked && !this.isTactileMode) {
            const isMoving = this.moveForward || this.moveBackward || this.moveLeft || this.moveRight;
            const currentSpeed = this.moveSpeed * (this.isSprinting ? this.sprintMultiplier : 1);
            
            // Smooth deceleration
            this.velocity.x -= this.velocity.x * this.deceleration * delta;
            this.velocity.z -= this.velocity.z * this.deceleration * delta;
            
            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize();
            
            // Smooth acceleration
            if (this.moveForward || this.moveBackward) {
                this.velocity.z -= this.direction.z * currentSpeed * delta;
            }
            if (this.moveLeft || this.moveRight) {
                this.velocity.x -= this.direction.x * currentSpeed * delta;
            }
            
            this.controls.moveRight(-this.velocity.x * delta);
            this.controls.moveForward(-this.velocity.z * delta);
            
            // Head bobbing effect when moving
            if (isMoving) {
                const bobSpeed = this.isSprinting ? this.headBobSpeed * 1.5 : this.headBobSpeed;
                const bobIntensity = this.isSprinting ? this.headBobIntensity * 1.3 : this.headBobIntensity;
                this.headBobTime += delta * bobSpeed;
                const bobOffset = Math.sin(this.headBobTime) * bobIntensity;
                this.controls.getObject().position.y = this.baseHeight + bobOffset;
            } else {
                // Smoothly return to base height
                const currentY = this.controls.getObject().position.y;
                this.controls.getObject().position.y += (this.baseHeight - currentY) * 5 * delta;
                this.headBobTime = 0;
            }
            
            // Boundary collision
            const pos = this.controls.getObject().position;
            pos.x = Math.max(-this.roomWidth/2 + 2, Math.min(this.roomWidth/2 - 2, pos.x));
            pos.z = Math.max(-this.roomDepth/2 + 2, Math.min(this.roomDepth/2, pos.z));
            
            // Check artwork proximity
            this.checkArtworkProximity();
            
            // Update minimap
            this.updateMinimap();
        }
        
        if (this.dustParticles) {
            this.dustParticles.rotation.y += 0.0002;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // ═══════════════════════════════════════════════════════════
    // ENHANCED NAVIGATION FEATURES
    // ═══════════════════════════════════════════════════════════
    
    initMinimap() {
        this.minimapCanvas = this.container.querySelector('.minimap-canvas');
        if (this.minimapCanvas) {
            this.minimapCtx = this.minimapCanvas.getContext('2d');
        }
    }
    
    updateMinimap() {
        if (!this.minimapCtx || !this.controls) return;
        
        const ctx = this.minimapCtx;
        const w = 180, h = 240;
        const scaleX = w / this.roomWidth;
        const scaleZ = h / this.roomDepth;
        
        // Clear
        ctx.fillStyle = 'rgba(10, 10, 10, 0.9)';
        ctx.fillRect(0, 0, w, h);
        
        // Draw room outline
        ctx.strokeStyle = 'rgba(184, 134, 11, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(5, 5, w - 10, h - 10);
        
        // Draw artwork positions
        ctx.fillStyle = 'rgba(184, 134, 11, 0.7)';
        this.artworks.forEach((art, i) => {
            let x, z;
            if (i < 4) { // Left wall
                x = 15;
                z = 40 + i * 45;
            } else if (i < 8) { // Right wall
                x = w - 15;
                z = 40 + (i - 4) * 45;
            } else { // Back wall
                x = 35 + (i - 8) * 30;
                z = 15;
            }
            ctx.beginPath();
            ctx.arc(x, z, 5, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw player position
        const pos = this.controls.getObject().position;
        const playerX = (pos.x + this.roomWidth / 2) * scaleX;
        const playerZ = (pos.z + this.roomDepth / 2) * scaleZ;
        
        // Player direction
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        const angle = Math.atan2(dir.x, dir.z);
        
        ctx.save();
        ctx.translate(playerX, playerZ);
        ctx.rotate(-angle);
        
        // Player arrow
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-6, 6);
        ctx.lineTo(0, 3);
        ctx.lineTo(6, 6);
        ctx.closePath();
        ctx.fill();
        
        // Glow
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 10;
        ctx.fill();
        
        ctx.restore();
    }
    
    checkArtworkProximity() {
        if (!this.controls) return;
        
        const cameraPos = this.controls.getObject().position;
        const cameraDir = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDir);
        
        let closestArtwork = null;
        let closestDistance = this.artworkProximityDistance;
        
        this.artworkMeshes.forEach(mesh => {
            const worldPos = new THREE.Vector3();
            mesh.getWorldPosition(worldPos);
            const distance = cameraPos.distanceTo(worldPos);
            
            if (distance < closestDistance) {
                // Check if we're facing the artwork
                const toArtwork = worldPos.clone().sub(cameraPos).normalize();
                const dot = cameraDir.dot(toArtwork);
                
                if (dot > 0.5) { // Within ~60 degree cone
                    closestDistance = distance;
                    closestArtwork = mesh.userData.artwork;
                }
            }
        });
        
        const hint = this.container.querySelector('.museum-artwork-hint');
        const crosshair = this.container.querySelector('.museum-crosshair');
        
        if (closestArtwork && closestArtwork !== this.nearbyArtwork) {
            this.nearbyArtwork = closestArtwork;
            if (hint) {
                hint.querySelector('.hint-text').textContent = closestArtwork.title;
                hint.classList.remove('hidden');
            }
            if (crosshair) {
                crosshair.classList.add('active');
            }
        } else if (!closestArtwork && this.nearbyArtwork) {
            this.nearbyArtwork = null;
            if (hint) hint.classList.add('hidden');
            if (crosshair) crosshair.classList.remove('active');
        }
    }
    
    onResize() {
        if (!this.camera || !this.renderer) return;
        const wrapper = this.container.querySelector('.museum-canvas-wrapper');
        this.camera.aspect = wrapper.clientWidth / wrapper.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    }
    
    // ═══════════════════════════════════════════════════════════
    // TACTILE MODE ON REGULAR PORTFOLIO CARDS
    // ═══════════════════════════════════════════════════════════
    
    setupTactileOnCards() {
        document.addEventListener('DOMContentLoaded', () => this.attachToCards());
        window.addEventListener('hashchange', () => setTimeout(() => this.attachToCards(), 500));
    }
    
    attachToCards() {
        const cards = document.querySelectorAll('.portfolio-card, .artwork-card, [data-tactile]');
        cards.forEach(card => {
            if (card.dataset.unifiedProcessed) return;
            card.dataset.unifiedProcessed = 'true';
            
            let pressTimer;
            card.addEventListener('mousedown', () => {
                pressTimer = setTimeout(() => {
                    const img = card.querySelector('img');
                    const title = card.querySelector('h3, .card-title')?.textContent || 'Obra';
                    if (img) {
                        this.openTactile({
                            title,
                            technique: 'Técnica mixta',
                            year: '2024',
                            description: 'Obra de Naroa Gutiérrez Gil',
                            image: img.src
                        });
                    }
                }, 400);
            });
            card.addEventListener('mouseup', () => clearTimeout(pressTimer));
            card.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        });
    }
    
    // ═══════════════════════════════════════════════════════════
    // STYLES
    // ═══════════════════════════════════════════════════════════
    
    addStyles() {
        if (document.getElementById('unified-gallery-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'unified-gallery-styles';
        style.textContent = `
            /* Toggle Button */
            .unified-gallery-toggle {
                position: fixed;
                bottom: 100px;
                right: 20px;
                z-index: 10001;
            }
            .unified-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 14px 24px;
                background: linear-gradient(135deg, #1a1a1a 0%, #2a2520 100%);
                color: #f4f3f0;
                border: 1px solid rgba(184, 134, 11, 0.3);
                border-radius: 30px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.4s ease;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
            }
            .unified-btn:hover {
                transform: scale(1.05) translateY(-2px);
                border-color: rgba(184, 134, 11, 0.6);
                box-shadow: 0 8px 30px rgba(184, 134, 11, 0.2);
            }
            .unified-icon { font-size: 22px; }
            
            /* Museum Container */
            .unified-museum {
                position: fixed;
                inset: 0;
                z-index: 100000;
                background: #0a0a0a;
                display: flex;
                flex-direction: column;
            }
            .unified-museum.hidden { display: none; }
            
            .museum-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1rem 2rem;
                background: rgba(0, 0, 0, 0.9);
                border-bottom: 1px solid rgba(184, 134, 11, 0.2);
            }
            .museum-branding {
                display: flex;
                align-items: center;
                gap: 1rem;
                color: #f4f3f0;
            }
            .museum-branding span { font-size: 2rem; }
            .museum-branding h2 { font-size: 1.3rem; margin: 0; }
            .museum-branding p { font-size: 0.85rem; opacity: 0.5; margin: 0; }
            .museum-controls {
                display: flex;
                gap: 1rem;
                color: rgba(255,255,255,0.5);
                font-size: 0.8rem;
            }
            .museum-controls kbd {
                background: rgba(255,255,255,0.1);
                padding: 4px 8px;
                border-radius: 4px;
            }
            .museum-close {
                background: transparent;
                border: 1px solid rgba(255,255,255,0.2);
                color: #f4f3f0;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
            }
            
            .museum-canvas-wrapper {
                flex: 1;
                position: relative;
                overflow: hidden;
            }
            .museum-canvas {
                width: 100%;
                height: 100%;
                display: block;
            }
            .museum-crosshair {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: rgba(255,255,255,0.3);
                font-size: 24px;
                pointer-events: none;
                transition: all 0.3s ease;
            }
            .museum-crosshair.active {
                color: rgba(184, 134, 11, 0.9);
                text-shadow: 0 0 20px rgba(184, 134, 11, 0.5);
                transform: translate(-50%, -50%) scale(1.3);
            }
            
            /* Minimap */
            .museum-minimap {
                position: absolute;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.85);
                border: 1px solid rgba(184, 134, 11, 0.3);
                border-radius: 12px;
                padding: 12px;
                box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
            }
            .minimap-canvas {
                border-radius: 8px;
                display: block;
            }
            .minimap-label {
                text-align: center;
                color: rgba(255, 255, 255, 0.4);
                font-size: 10px;
                margin-top: 8px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            /* Artwork Proximity Hint */
            .museum-artwork-hint {
                position: absolute;
                bottom: 120px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                border: 1px solid rgba(184, 134, 11, 0.5);
                border-radius: 30px;
                padding: 12px 24px;
                display: flex;
                align-items: center;
                gap: 10px;
                color: #f4f3f0;
                font-size: 14px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 20px rgba(184, 134, 11, 0.2);
            }
            .museum-artwork-hint.hidden {
                opacity: 0;
                pointer-events: none;
                transform: translateX(-50%) translateY(20px);
            }
            .hint-icon { font-size: 20px; }
            .hint-text { font-weight: 500; }
            
            /* Speed Indicator */
            .museum-speed-indicator {
                position: absolute;
                bottom: 20px;
                left: 20px;
                font-size: 28px;
                opacity: 0.5;
                transition: all 0.3s ease;
            }
            .museum-speed-indicator.sprinting {
                opacity: 1;
                transform: scale(1.2);
                animation: runPulse 0.5s ease infinite;
            }
            @keyframes runPulse {
                0%, 100% { transform: scale(1.2); }
                50% { transform: scale(1.3); }
            }
            
            .museum-loading {
                position: absolute;
                inset: 0;
                display: none;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: #0a0a0a;
            }
            .museum-loading.active { display: flex; }
            .museum-spinner {
                width: 60px;
                height: 60px;
                border: 3px solid rgba(255,255,255,0.1);
                border-top-color: #b8860b;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            .museum-loading p { color: rgba(255,255,255,0.6); margin-top: 1.5rem; }
            
            .museum-instructions {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                cursor: pointer;
            }
            .museum-instructions.hidden { display: none; }
            .museum-instructions-content {
                background: rgba(0,0,0,0.9);
                padding: 3rem 4rem;
                border-radius: 16px;
                border: 1px solid rgba(184,134,11,0.3);
                text-align: center;
                color: #f4f3f0;
            }
            .instructions-icon { font-size: 3rem; margin-bottom: 1rem; }
            .museum-instructions-content p { font-size: 1.3rem; margin: 0 0 0.5rem; }
            .museum-instructions-content span { opacity: 0.4; font-size: 0.9rem; }
            
            /* Tactile Overlay */
            .tactile-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.95);
                z-index: 100001;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.4s ease;
                backdrop-filter: blur(20px);
            }
            .tactile-overlay.active {
                opacity: 1;
                pointer-events: all;
            }
            .tactile-workspace {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .tactile-card-container {
                width: 60vmin;
                height: 60vmin;
                max-width: 500px;
                max-height: 500px;
            }
            .tactile-card {
                width: 100%;
                height: 100%;
                perspective: 1200px;
            }
            .tactile-inner {
                width: 100%;
                height: 100%;
                position: relative;
                transform-style: preserve-3d;
                border-radius: 16px;
                box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            }
            .tactile-front, .tactile-back {
                position: absolute;
                width: 100%;
                height: 100%;
                backface-visibility: hidden;
                border-radius: 16px;
                overflow: hidden;
            }
            .tactile-front img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .tactile-back {
                transform: rotateY(180deg);
                background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 2rem;
                text-align: center;
                color: #f4f3f0;
            }
            .tactile-back h3 { font-size: 1.5rem; margin: 0 0 0.5rem; }
            .tactile-tech { opacity: 0.7; font-size: 0.9rem; margin: 0 0 1rem; }
            .tactile-desc { opacity: 0.6; line-height: 1.6; margin: 0 0 1.5rem; }
            .tactile-flip-hint { opacity: 0.4; font-size: 0.85rem; }
            
            .tactile-instructions {
                position: absolute;
                bottom: 2rem;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 2rem;
                color: rgba(255,255,255,0.6);
                font-size: 0.85rem;
            }
            .tactile-close {
                position: absolute;
                top: 2rem;
                right: 2rem;
                width: 48px;
                height: 48px;
                background: rgba(255,255,255,0.1);
                border: none;
                border-radius: 50%;
                color: white;
                font-size: 2rem;
                cursor: pointer;
            }
            .tactile-back-to-museum {
                position: absolute;
                top: 2rem;
                left: 2rem;
                background: rgba(255,255,255,0.1);
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                cursor: pointer;
            }
            
            @media (max-width: 768px) {
                .unified-text { display: none; }
                .unified-btn { padding: 14px; }
                .museum-controls { display: none; }
                .tactile-card-container { width: 85vmin; height: 85vmin; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.unifiedGallery = new UnifiedGallery();
        window.unifiedGallery.init();
    });
} else {
    window.unifiedGallery = new UnifiedGallery();
    window.unifiedGallery.init();
}
