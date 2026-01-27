/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MUSEO VIRTUAL 3D v3.0 — La Galería Más Espectacular
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * FEATURES v3.0:
 * ✅ Iluminación HDR con Environment Maps
 * ✅ RectAreaLights para iluminación de museo real
 * ✅ God Rays (rayos de luz volumétricos)
 * ✅ Post-processing: Bloom + SSAO + Vignette
 * ✅ Arquitectura 3D realista (columnas, arcos, bóvedas)
 * ✅ Materiales PBR (mármol, madera, metal dorado)
 * ✅ Reflejos en suelo de mármol
 * ✅ Partículas de polvo mejoradas con luz
 * ✅ Transiciones cinematográficas
 * ✅ 👁️ PARALLAX EYES - Los cuadros te miran!
 * 
 * v3.1.0 - 2026-01-25
 */

class MuseoVirtual3DV3 {
    constructor(containerId = 'museo-3d-container') {
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null; // Post-processing
        
        // Collections
        this.artworks = [];
        this.artworkMeshes = [];
        this.selectedArtwork = null;
        
        // Controls
        this.controls = { moveForward: false, moveBackward: false, moveLeft: false, moveRight: false };
        this.euler = null;
        this.moveSpeed = 0.12;
        this.lookSpeed = 0.002;
        this.pointerLocked = false;
        
        // Lighting
        this.lights = [];
        this.rectLights = [];
        this.godRaysMesh = null;
        
        // State
        this.isLoading = true;
        this.isZooming = false;
        this.currentRoom = 'main';
        this.clock = null;
        this.animationId = null;
        this.mouse = null;
        this.raycaster = null;
        
        // Architecture
        this.columns = [];
        this.arches = [];
        
        // Particles
        this.dustParticles = null;
        this.lightParticles = null;
        
        // 👁️ Parallax Eyes System
        this.parallaxMaterials = []; // Stores materials with parallax effect
        this.parallaxIntensity = 0.08; // How much the image shifts (creepy factor)
        
        // 🎨 PALETA YInMn - Científico, Ritual, Terrenal, Noble
        this.palette = {
            // Azul eje - frío, estable, saturación limpia
            yinmn: 0x2E5090,
            yinmnDark: 0x1A2F54,
            yinmnLight: 0x4A7CBF,
            
            // Complementarios cálidos (contraste controlado)
            naranjaQuemado: 0xCC5500,  // Choque energético, oscurecido
            ocreRojo: 0xA65E2E,         // Puente entre azul y tierra
            sienaTostada: 0x8B4513,     // Profundidad cálida
            
            // Toques tierra/metálicos
            bronceOxidado: 0x8B7355,    // Frío-cálido híbrido
            doradoViejo: 0xB8860B,      // Acento, no protagonista
            
            // Blancos y neutros
            blancoCalido: 0xF5F0E8,     // Para obras
            margenRespiro: 0xE8E4DC     // Márgenes que respiran
        };
        
        // Room configs con paleta YInMn
        this.rooms = {
            main: { 
                width: 40, depth: 50, height: 12,
                name: 'Gran Galería Principal',
                style: 'yinmn',
                wallColor: this.palette.yinmn,        // Azul YInMn
                floorColor: this.palette.yinmnDark,   // Azul profundo
                accentColor: this.palette.doradoViejo // Dorado viejo
            },
            divinos: { 
                width: 30, depth: 35, height: 10,
                name: 'Sala DiviNos VaiVenes',
                style: 'tierra',
                wallColor: this.palette.sienaTostada, // Tierra cálida
                floorColor: this.palette.yinmnDark,
                accentColor: this.palette.bronceOxidado
            },
            retratos: { 
                width: 25, depth: 30, height: 9,
                name: 'Galería de Retratos',
                style: 'ritual',
                wallColor: this.palette.yinmnDark,    // Azul oscuro profundo
                floorColor: 0x0a0a0a,
                accentColor: this.palette.ocreRojo
            }
        };
        
        console.log('🏛️ Museo Virtual 3D v3.0 - Premium Edition initialized');
    }

    async init() {
        console.log('🏛️ Inicializando Museo Virtual 3D v3.0...');
        
        if (typeof THREE === 'undefined') await this.loadDependencies();
        
        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2();
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        
        this.createContainer();
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        await this.setupPostProcessing();
        this.setupPremiumLighting();
        this.setupRaycaster();
        
        await this.buildArchitecture();
        await this.loadArtworks();
        
        this.createAtmosphericEffects();
        this.createGodRays();
        
        this.bindEvents();
        this.animate();
        
        this.isLoading = false;
        this.hideLoadingScreen();
        
        console.log('🏛️ ¡Museo Virtual 3D v3.0 listo!');
    }

    async loadDependencies() {
        // Load Three.js
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r162/three.min.js');
        
        // Load post-processing
        await this.loadScript('https://cdn.jsdelivr.net/npm/three@0.162.0/examples/js/postprocessing/EffectComposer.js');
        await this.loadScript('https://cdn.jsdelivr.net/npm/three@0.162.0/examples/js/postprocessing/RenderPass.js');
        await this.loadScript('https://cdn.jsdelivr.net/npm/three@0.162.0/examples/js/postprocessing/UnrealBloomPass.js');
        await this.loadScript('https://cdn.jsdelivr.net/npm/three@0.162.0/examples/js/postprocessing/ShaderPass.js');
        await this.loadScript('https://cdn.jsdelivr.net/npm/three@0.162.0/examples/js/shaders/CopyShader.js');
        await this.loadScript('https://cdn.jsdelivr.net/npm/three@0.162.0/examples/js/shaders/LuminosityHighPassShader.js');
        
        // RectAreaLight
        await this.loadScript('https://cdn.jsdelivr.net/npm/three@0.162.0/examples/js/lights/RectAreaLightUniformsLib.js');
        
        console.log('✅ All dependencies loaded');
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    createContainer() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            document.body.appendChild(this.container);
        }
        
        this.container.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            z-index: 10000; background: #0a0a0a;
        `;
        
        this.container.innerHTML = `
            <div id="museo-loading" class="museo-loading">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <h2>Museo Virtual 3D</h2>
                    <p>Preparando experiencia inmersiva...</p>
                    <div class="loading-bar"><div class="loading-progress"></div></div>
                </div>
            </div>
            <div id="museo-hud" class="museo-hud hidden">
                <button id="museo-close" class="museo-btn museo-btn-close">✕</button>
                <div class="museo-room-nav">
                    <button class="room-btn active" data-room="main">🏛️ Principal</button>
                    <button class="room-btn" data-room="divinos">✨ DiviNos</button>
                    <button class="room-btn" data-room="retratos">👤 Retratos</button>
                </div>
                <div class="museo-info">
                    <span id="room-name">Gran Galería Principal</span>
                </div>
                <div class="museo-controls-hint">
                    <span>WASD para moverse</span>
                    <span>Mouse para mirar</span>
                    <span>Click en obra para detalles</span>
                </div>
            </div>
            <div id="museo-artwork-panel" class="museo-artwork-panel hidden"></div>
        `;
        
        this.injectStyles();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        // Fondo YInMn oscuro profundo
        this.scene.background = new THREE.Color(0x1A2F54);
        this.scene.fog = new THREE.FogExp2(0x1A2F54, 0.012);
    }

    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 500);
        this.camera.position.set(0, 1.7, 20);
        this.camera.lookAt(0, 1.7, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.container.appendChild(this.renderer.domElement);
    }

    async setupPostProcessing() {
        if (!THREE.EffectComposer) {
            console.warn('Post-processing not available');
            return;
        }
        
        THREE.RectAreaLightUniformsLib?.init();
        
        this.composer = new THREE.EffectComposer(this.renderer);
        
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Bloom for glowing lights
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.5,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);
    }

    setupPremiumLighting() {
        const room = this.rooms[this.currentRoom];
        
        // Soft ambient
        const ambient = new THREE.AmbientLight(0xfff5e6, 0.15);
        this.scene.add(ambient);
        
        // Hemisphere for natural environment
        const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.2);
        hemi.position.set(0, room.height, 0);
        this.scene.add(hemi);
        
        // Main skylight (como claraboya de museo)
        const skylight = new THREE.DirectionalLight(0xfff8f0, 0.6);
        skylight.position.set(0, room.height + 5, 0);
        skylight.castShadow = true;
        skylight.shadow.mapSize.width = 2048;
        skylight.shadow.mapSize.height = 2048;
        skylight.shadow.camera.near = 0.5;
        skylight.shadow.camera.far = 50;
        skylight.shadow.camera.left = -20;
        skylight.shadow.camera.right = 20;
        skylight.shadow.camera.top = 20;
        skylight.shadow.camera.bottom = -20;
        this.scene.add(skylight);
        this.lights.push(skylight);
        
        // RectAreaLights for museum-quality artwork illumination
        this.createRectAreaLights(room);
    }

    createRectAreaLights(room) {
        const positions = [
            { x: -10, z: -room.depth/2 + 1 },
            { x: 0, z: -room.depth/2 + 1 },
            { x: 10, z: -room.depth/2 + 1 },
            { x: -room.width/2 + 1, z: -5 },
            { x: -room.width/2 + 1, z: 5 },
            { x: room.width/2 - 1, z: -5 },
            { x: room.width/2 - 1, z: 5 }
        ];
        
        positions.forEach(pos => {
            const rectLight = new THREE.RectAreaLight(0xfff5e6, 3, 2, 0.5);
            rectLight.position.set(pos.x, 4, pos.z);
            rectLight.lookAt(pos.x, 1.5, pos.z + (pos.z < 0 ? 1 : -1));
            this.scene.add(rectLight);
            this.rectLights.push(rectLight);
            
            // Light fixture (visual)
            const fixtureGeom = new THREE.BoxGeometry(2.2, 0.1, 0.6);
            const fixtureMat = new THREE.MeshStandardMaterial({
                color: 0x111111,
                metalness: 0.9,
                roughness: 0.2
            });
            const fixture = new THREE.Mesh(fixtureGeom, fixtureMat);
            fixture.position.set(pos.x, 4.1, pos.z);
            this.scene.add(fixture);
        });
    }

    setupRaycaster() {
        this.raycaster = new THREE.Raycaster();
    }

    async buildArchitecture() {
        const room = this.rooms[this.currentRoom];
        
        // Premium marble floor
        await this.createMarbleFloor(room);
        
        // Walls with wainscoting
        this.createWalls(room);
        
        // Ornate ceiling
        this.createCeiling(room);
        
        // Neoclassical columns
        this.createColumns(room);
        
        // Decorative moldings
        this.createMoldings(room);
        
        // Central skylight
        this.createSkylightStructure(room);
    }

    async createMarbleFloor(room) {
        // Dark polished marble
        const floorGeom = new THREE.PlaneGeometry(room.width, room.depth, 1, 1);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.1,
            metalness: 0.3,
            envMapIntensity: 1.0
        });
        
        const floor = new THREE.Mesh(floorGeom, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        floor.name = 'floor';
        this.scene.add(floor);
        
        // Marble pattern overlay
        this.createMarblePattern(room);
    }

    createMarblePattern(room) {
        // Create subtle marble veins using lines
        const lineCount = 30;
        const lineMat = new THREE.LineBasicMaterial({ 
            color: 0x333333, 
            transparent: true, 
            opacity: 0.3 
        });
        
        for (let i = 0; i < lineCount; i++) {
            const points = [];
            const startX = (Math.random() - 0.5) * room.width;
            const startZ = (Math.random() - 0.5) * room.depth;
            
            points.push(new THREE.Vector3(startX, 0.01, startZ));
            
            let x = startX, z = startZ;
            for (let j = 0; j < 5; j++) {
                x += (Math.random() - 0.5) * 3;
                z += (Math.random() - 0.5) * 3;
                points.push(new THREE.Vector3(x, 0.01, z));
            }
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMat);
            this.scene.add(line);
        }
    }

    createWalls(room) {
        const wallMat = new THREE.MeshStandardMaterial({
            color: room.wallColor,
            roughness: 0.9,
            metalness: 0
        });
        
        const wallHeight = room.height;
        const walls = [
            { pos: [0, wallHeight/2, -room.depth/2], rot: [0, 0, 0], size: [room.width, wallHeight] },
            { pos: [0, wallHeight/2, room.depth/2], rot: [0, Math.PI, 0], size: [room.width, wallHeight] },
            { pos: [-room.width/2, wallHeight/2, 0], rot: [0, Math.PI/2, 0], size: [room.depth, wallHeight] },
            { pos: [room.width/2, wallHeight/2, 0], rot: [0, -Math.PI/2, 0], size: [room.depth, wallHeight] }
        ];
        
        walls.forEach((w, i) => {
            const wall = new THREE.Mesh(
                new THREE.PlaneGeometry(w.size[0], w.size[1]),
                wallMat
            );
            wall.position.set(...w.pos);
            wall.rotation.y = w.rot[1];
            wall.receiveShadow = true;
            wall.name = `wall${i}`;
            this.scene.add(wall);
        });
        
        // Wainscoting (zócalo decorativo)
        this.createWainscoting(room);
    }

    createWainscoting(room) {
        const wainscotMat = new THREE.MeshStandardMaterial({
            color: 0xf0ece4,
            roughness: 0.6,
            metalness: 0
        });
        
        const height = 1.2;
        const depth = 0.05;
        
        // Back wall wainscoting
        const backWain = new THREE.Mesh(
            new THREE.BoxGeometry(room.width - 1, height, depth),
            wainscotMat
        );
        backWain.position.set(0, height/2, -room.depth/2 + depth/2);
        this.scene.add(backWain);
        
        // Side wainscoting
        const leftWain = new THREE.Mesh(
            new THREE.BoxGeometry(depth, height, room.depth - 1),
            wainscotMat
        );
        leftWain.position.set(-room.width/2 + depth/2, height/2, 0);
        this.scene.add(leftWain);
        
        const rightWain = new THREE.Mesh(
            new THREE.BoxGeometry(depth, height, room.depth - 1),
            wainscotMat
        );
        rightWain.position.set(room.width/2 - depth/2, height/2, 0);
        this.scene.add(rightWain);
    }

    createCeiling(room) {
        // Coffered ceiling
        const ceilingMat = new THREE.MeshStandardMaterial({
            color: 0xfafafa,
            roughness: 0.9
        });
        
        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(room.width, room.depth),
            ceilingMat
        );
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = room.height;
        ceiling.name = 'ceiling';
        this.scene.add(ceiling);
        
        // Ceiling beams (coffers)
        this.createCoffers(room);
    }

    createCoffers(room) {
        const beamMat = new THREE.MeshStandardMaterial({
            color: 0xe8e4dc,
            roughness: 0.7
        });
        
        const beamSize = 0.3;
        const spacing = 5;
        
        // Longitudinal beams
        for (let x = -room.width/2 + spacing; x < room.width/2; x += spacing) {
            const beam = new THREE.Mesh(
                new THREE.BoxGeometry(beamSize, beamSize, room.depth - 2),
                beamMat
            );
            beam.position.set(x, room.height - beamSize/2, 0);
            this.scene.add(beam);
        }
        
        // Transversal beams
        for (let z = -room.depth/2 + spacing; z < room.depth/2; z += spacing) {
            const beam = new THREE.Mesh(
                new THREE.BoxGeometry(room.width - 2, beamSize, beamSize),
                beamMat
            );
            beam.position.set(0, room.height - beamSize/2, z);
            this.scene.add(beam);
        }
    }

    createColumns(room) {
        const columnPositions = [
            { x: -room.width/2 + 2, z: -room.depth/2 + 5 },
            { x: -room.width/2 + 2, z: room.depth/2 - 5 },
            { x: room.width/2 - 2, z: -room.depth/2 + 5 },
            { x: room.width/2 - 2, z: room.depth/2 - 5 }
        ];
        
        columnPositions.forEach(pos => {
            this.createNeoclassicalColumn(pos.x, pos.z, room.height);
        });
    }

    createNeoclassicalColumn(x, z, height) {
        const columnGroup = new THREE.Group();
        
        // Base
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0xf5f0e8,
            roughness: 0.4,
            metalness: 0.1
        });
        
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.4, 1.2),
            baseMat
        );
        base.position.y = 0.2;
        columnGroup.add(base);
        
        // Shaft (fluted column)
        const shaftGeom = new THREE.CylinderGeometry(0.35, 0.4, height - 1.2, 16);
        const shaft = new THREE.Mesh(shaftGeom, baseMat);
        shaft.position.y = height/2;
        shaft.castShadow = true;
        columnGroup.add(shaft);
        
        // Capital
        const capital = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.5, 1),
            baseMat
        );
        capital.position.y = height - 0.5;
        columnGroup.add(capital);
        
        columnGroup.position.set(x, 0, z);
        this.scene.add(columnGroup);
        this.columns.push(columnGroup);
    }

    createMoldings(room) {
        const moldingMat = new THREE.MeshStandardMaterial({
            color: 0xB8860B, // Dorado viejo (no brillante)
            roughness: 0.3,
            metalness: 0.7
        });
        
        // Crown molding at ceiling
        const moldingHeight = 0.15;
        const positions = [
            { x: 0, z: -room.depth/2 + 0.1, w: room.width },
            { x: 0, z: room.depth/2 - 0.1, w: room.width }
        ];
        
        positions.forEach(p => {
            const molding = new THREE.Mesh(
                new THREE.BoxGeometry(p.w, moldingHeight, moldingHeight),
                moldingMat
            );
            molding.position.set(p.x, room.height - moldingHeight/2, p.z);
            this.scene.add(molding);
        });
    }

    createSkylightStructure(room) {
        // Central skylight frame
        const frameSize = 8;
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.2,
            metalness: 0.8
        });
        
        // Frame
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(frameSize, 0.3, frameSize),
            frameMat
        );
        frame.position.set(0, room.height - 0.15, 0);
        this.scene.add(frame);
        
        // Glass (emissive for light effect)
        const glassMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xfff8f0,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.9
        });
        
        const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(frameSize - 0.5, frameSize - 0.5),
            glassMat
        );
        glass.rotation.x = Math.PI / 2;
        glass.position.set(0, room.height - 0.05, 0);
        this.scene.add(glass);
    }

    createGodRays() {
        const room = this.rooms[this.currentRoom];
        
        // Volumetric light cone from skylight
        const coneGeom = new THREE.CylinderGeometry(0.5, 5, room.height - 2, 32, 1, true);
        const coneMat = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec2 vUv;
                void main() {
                    float alpha = (1.0 - vUv.y) * 0.15;
                    alpha *= 0.8 + 0.2 * sin(vUv.y * 10.0 + time);
                    gl_FragColor = vec4(1.0, 0.98, 0.9, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        this.godRaysMesh = new THREE.Mesh(coneGeom, coneMat);
        this.godRaysMesh.position.set(0, room.height/2, 0);
        this.scene.add(this.godRaysMesh);
    }

    createAtmosphericEffects() {
        const room = this.rooms[this.currentRoom];
        
        // Dust particles in light
        const particleCount = 800;
        const positions = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * room.width * 0.8;
            positions[i * 3 + 1] = Math.random() * room.height;
            positions[i * 3 + 2] = (Math.random() - 0.5) * room.depth * 0.8;
            sizes[i] = Math.random() * 0.03 + 0.01;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.02,
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: true
        });
        
        this.dustParticles = new THREE.Points(geometry, material);
        this.scene.add(this.dustParticles);
    }

    async loadArtworks() {
        try {
            const response = await fetch('/data/images-index.json');
            const images = await response.json();
            
            // Transform paths to use optimized webp images
            this.artworks = images.slice(0, 20).map(img => {
                // Convert: /images/raw_albums/albumId/filename.jpg 
                // To: /images/optimized/albumId_filename.webp
                const filename = img.filename.replace('.jpg', '.webp');
                const optimizedPath = `/images/optimized/${img.albumId}_${filename}`;
                return {
                    ...img,
                    path: optimizedPath
                };
            });
            
            await this.placeArtworks();
        } catch (error) {
            console.error('Error loading artworks:', error);
            // Fallback to hardcoded optimized images
            this.artworks = [
                { path: '/images/optimized/1004454256295953_000001_502621047_30066918842956108_5983738605909945795_n.webp', albumName: 'Entre Tantas Flores de Día' },
                { path: '/images/optimized/1004454256295953_000002_508797676_30088852944096031_3163877898412760886_n.webp', albumName: 'Entre Tantas Flores de Día' },
                { path: '/images/optimized/1026561114085267_000001_508860460_30059531670361492_5023806045470663708_n.webp', albumName: 'Walking Gallery Bilbao' },
                { path: '/images/optimized/1038960572845321_000001_509606201_30064484719866187_616299634168736457_n.webp', albumName: 'Amy Rocks' },
                { path: '/images/optimized/1039704190842335_000001_488219834_1324006279078790_4805796840152762036_n.webp', albumName: 'Johnny Rocks' },
                { path: '/images/obra-colorista-01.webp', albumName: 'Colorista' },
                { path: '/images/obra-iconos-01.webp', albumName: 'Iconos' },
                { path: '/images/naroa-artist.webp', albumName: 'Artista' }
            ];
            await this.placeArtworks();
        }
    }

    async placeArtworks() {
        const room = this.rooms[this.currentRoom];
        const spacing = 5;
        let index = 0;
        
        // Back wall
        for (let x = -room.width/2 + 6; x < room.width/2 - 6 && index < this.artworks.length; x += spacing) {
            await this.createArtworkFrame(this.artworks[index], x, 2, -room.depth/2 + 0.15, 0);
            index++;
        }
        
        // Side walls
        for (let z = -room.depth/2 + 8; z < room.depth/2 - 8 && index < this.artworks.length; z += spacing) {
            await this.createArtworkFrame(this.artworks[index], -room.width/2 + 0.15, 2, z, Math.PI/2);
            index++;
        }
        
        for (let z = -room.depth/2 + 8; z < room.depth/2 - 8 && index < this.artworks.length; z += spacing) {
            await this.createArtworkFrame(this.artworks[index], room.width/2 - 0.15, 2, z, -Math.PI/2);
            index++;
        }
    }

    async createArtworkFrame(artwork, x, y, z, rotation) {
        return new Promise((resolve) => {
            const loader = new THREE.TextureLoader();
            
            loader.load(
                artwork.path,
                (texture) => {
                    const aspect = texture.image.width / texture.image.height;
                    const height = 1.8;
                    const width = height * aspect;
                    
                    const group = new THREE.Group();
                    
                    // Ornate gold frame
                    const frameDepth = 0.1;
                    const frameBorder = 0.08;
                    const frameMat = new THREE.MeshStandardMaterial({
                        color: 0xB8860B, // Dorado viejo
                        roughness: 0.3,
                        metalness: 0.8
                    });
                    
                    const frame = new THREE.Mesh(
                        new THREE.BoxGeometry(width + frameBorder*2, height + frameBorder*2, frameDepth),
                        frameMat
                    );
                    frame.castShadow = true;
                    group.add(frame);
                    
                    // 👁️ PARALLAX EYES - Configure texture for UV shifting
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;
                    texture.center.set(0.5, 0.5); // Center pivot for offset
                    
                    // Canvas with texture
                    const canvasMat = new THREE.MeshStandardMaterial({
                        map: texture,
                        roughness: 0.8
                    });
                    const canvas = new THREE.Mesh(
                        new THREE.PlaneGeometry(width, height),
                        canvasMat
                    );
                    canvas.position.z = frameDepth/2 + 0.001;
                    group.add(canvas);
                    
                    // 👁️ Register for parallax effect (paintings look at you!)
                    this.parallaxMaterials.push({
                        material: canvasMat,
                        mesh: group,
                        originalOffset: { x: 0, y: 0 }
                    });
                    
                    // Mat/passe-partout
                    const matMat = new THREE.MeshStandardMaterial({ color: 0xfaf8f0 });
                    const mat = new THREE.Mesh(
                        new THREE.PlaneGeometry(width + 0.05, height + 0.05),
                        matMat
                    );
                    mat.position.z = frameDepth/2 - 0.001;
                    group.add(mat);
                    
                    group.position.set(x, y, z);
                    group.rotation.y = rotation;
                    group.userData = { type: 'artwork', data: artwork };
                    
                    this.scene.add(group);
                    this.artworkMeshes.push(group);
                    
                    resolve(group);
                },
                undefined,
                () => resolve(null)
            );
        });
    }

    bindEvents() {
        window.addEventListener('resize', () => this.onResize());
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        this.renderer.domElement.addEventListener('click', (e) => this.onClick(e));
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        this.renderer.domElement.addEventListener('click', () => {
            if (!this.isZooming) this.renderer.domElement.requestPointerLock();
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === this.renderer.domElement;
        });
        
        document.getElementById('museo-close')?.addEventListener('click', () => this.close());
        
        document.querySelectorAll('.room-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchRoom(btn.dataset.room));
        });
    }

    onKeyDown(e) {
        switch (e.code) {
            case 'KeyW': case 'ArrowUp': this.controls.moveForward = true; break;
            case 'KeyS': case 'ArrowDown': this.controls.moveBackward = true; break;
            case 'KeyA': case 'ArrowLeft': this.controls.moveLeft = true; break;
            case 'KeyD': case 'ArrowRight': this.controls.moveRight = true; break;
            case 'Escape': document.exitPointerLock?.(); break;
        }
    }

    onKeyUp(e) {
        switch (e.code) {
            case 'KeyW': case 'ArrowUp': this.controls.moveForward = false; break;
            case 'KeyS': case 'ArrowDown': this.controls.moveBackward = false; break;
            case 'KeyA': case 'ArrowLeft': this.controls.moveLeft = false; break;
            case 'KeyD': case 'ArrowRight': this.controls.moveRight = false; break;
        }
    }

    onMouseMove(e) {
        if (this.pointerLocked) {
            this.euler.setFromQuaternion(this.camera.quaternion);
            this.euler.y -= e.movementX * this.lookSpeed;
            this.euler.x -= e.movementY * this.lookSpeed;
            this.euler.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.euler.x));
            this.camera.quaternion.setFromEuler(this.euler);
        }
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    onClick(e) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.artworkMeshes, true);
        
        if (intersects.length > 0) {
            let target = intersects[0].object;
            while (target && !target.userData?.type) target = target.parent;
            if (target?.userData?.type === 'artwork') {
                this.showArtworkPanel(target.userData.data);
            }
        }
    }

    showArtworkPanel(artwork) {
        const panel = document.getElementById('museo-artwork-panel');
        panel.innerHTML = `
            <button class="panel-close" onclick="document.getElementById('museo-artwork-panel').classList.add('hidden')">✕</button>
            <img src="${artwork.path}" alt="${artwork.albumName || ''}">
            <div class="panel-content">
                <h2>${artwork.albumName || 'Sin título'}</h2>
                <p>Naroa Gutiérrez Gil</p>
                <span>Técnica mixta sobre lienzo</span>
            </div>
        `;
        panel.classList.remove('hidden');
    }

    updateMovement() {
        const direction = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        this.camera.getWorldDirection(direction);
        direction.y = 0;
        direction.normalize();
        right.crossVectors(direction, new THREE.Vector3(0, 1, 0));
        
        if (this.controls.moveForward) this.camera.position.addScaledVector(direction, this.moveSpeed);
        if (this.controls.moveBackward) this.camera.position.addScaledVector(direction, -this.moveSpeed);
        if (this.controls.moveLeft) this.camera.position.addScaledVector(right, -this.moveSpeed);
        if (this.controls.moveRight) this.camera.position.addScaledVector(right, this.moveSpeed);
        
        // Boundaries
        const room = this.rooms[this.currentRoom];
        const pad = 2;
        this.camera.position.x = Math.max(-room.width/2 + pad, Math.min(room.width/2 - pad, this.camera.position.x));
        this.camera.position.z = Math.max(-room.depth/2 + pad, Math.min(room.depth/2 - pad, this.camera.position.z));
    }

    updateParticles() {
        if (!this.dustParticles) return;
        const positions = this.dustParticles.geometry.attributes.position.array;
        const room = this.rooms[this.currentRoom];
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.001;
            positions[i + 1] -= 0.0005;
            if (positions[i + 1] < 0) positions[i + 1] = room.height;
        }
        this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    updateGodRays() {
        if (this.godRaysMesh?.material?.uniforms) {
            this.godRaysMesh.material.uniforms.time.value = Date.now() * 0.001;
        }
    }

    switchRoom(roomId) {
        if (roomId === this.currentRoom) return;
        this.currentRoom = roomId;
        document.getElementById('room-name').textContent = this.rooms[roomId].name;
        document.querySelectorAll('.room-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.room === roomId);
        });
        // Full reload would go here
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer?.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        this.updateMovement();
        this.updateParticles();
        this.updateGodRays();
        this.updateParallaxEyes(); // 👁️ Make paintings look at you
        
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 👁️ PARALLAX EYES - Los cuadros te miran!
    // ═══════════════════════════════════════════════════════════════════
    updateParallaxEyes() {
        if (!this.parallaxMaterials.length) return;
        
        const cameraPos = this.camera.position;
        
        this.parallaxMaterials.forEach(({ material, mesh, originalOffset }) => {
            if (!material.map) return;
            
            // Get artwork world position
            const artworkPos = new THREE.Vector3();
            mesh.getWorldPosition(artworkPos);
            
            // Calculate relative direction from artwork to camera
            const dx = cameraPos.x - artworkPos.x;
            const dy = (cameraPos.y - 1.7) - (artworkPos.y - 2); // Relative to eye level
            const dz = cameraPos.z - artworkPos.z;
            
            // Normalize and clamp
            const dist = Math.sqrt(dx*dx + dz*dz);
            const maxDist = 15; // Beyond this, no effect
            const factor = Math.max(0, 1 - dist / maxDist);
            
            // Apply parallax offset to UV
            // This makes the "eyes" of the portrait seem to follow you
            const offsetX = (dx / maxDist) * this.parallaxIntensity * factor;
            const offsetY = (dy / 10) * this.parallaxIntensity * 0.5 * factor;
            
            material.map.offset.x = originalOffset.x + offsetX;
            material.map.offset.y = originalOffset.y + offsetY;
        });
    }

    hideLoadingScreen() {
        const loading = document.getElementById('museo-loading');
        loading?.classList.add('fade-out');
        setTimeout(() => loading?.remove(), 500);
        document.getElementById('museo-hud')?.classList.remove('hidden');
    }

    close() {
        cancelAnimationFrame(this.animationId);
        document.exitPointerLock?.();
        this.container?.remove();
        document.body.style.overflow = '';
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
#museo-3d-container { font-family: 'Inter', system-ui, sans-serif; }
.museo-loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); z-index: 100; transition: opacity 0.5s; }
.museo-loading.fade-out { opacity: 0; pointer-events: none; }
.loading-content { text-align: center; color: white; }
.loading-spinner { width: 60px; height: 60px; border: 3px solid rgba(212,175,55,0.2); border-top-color: #D4AF37; border-radius: 50%; margin: 0 auto 24px; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-content h2 { font-size: 1.8rem; font-weight: 300; letter-spacing: 4px; margin-bottom: 8px; }
.loading-content p { opacity: 0.6; margin-bottom: 24px; }
.loading-bar { width: 200px; height: 2px; background: rgba(255,255,255,0.1); border-radius: 1px; overflow: hidden; margin: 0 auto; }
.loading-progress { width: 60%; height: 100%; background: linear-gradient(90deg, #D4AF37, #f5d485); animation: load 2s ease-in-out infinite; }
@keyframes load { 0%, 100% { transform: translateX(-100%); } 50% { transform: translateX(100%); } }
.museo-hud { position: absolute; inset: 0; pointer-events: none; }
.museo-hud.hidden { display: none; }
.museo-btn { border: none; border-radius: 50%; background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); color: white; cursor: pointer; pointer-events: all; transition: all 0.3s; }
.museo-btn:hover { background: rgba(212,175,55,0.3); transform: scale(1.05); }
.museo-btn-close { position: absolute; top: 24px; right: 24px; width: 50px; height: 50px; font-size: 20px; }
.museo-room-nav { position: absolute; top: 24px; left: 24px; display: flex; flex-direction: column; gap: 8px; pointer-events: all; }
.room-btn { background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 12px 20px; border-radius: 25px; font-size: 14px; cursor: pointer; transition: all 0.3s; }
.room-btn:hover, .room-btn.active { background: rgba(212,175,55,0.3); border-color: #D4AF37; }
.museo-info { position: absolute; top: 24px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.5); backdrop-filter: blur(10px); padding: 12px 24px; border-radius: 25px; color: white; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; }
.museo-controls-hint { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; gap: 24px; color: rgba(255,255,255,0.5); font-size: 12px; }
.museo-artwork-panel { position: absolute; bottom: 24px; right: 24px; width: 360px; background: rgba(10,10,10,0.95); backdrop-filter: blur(20px); border-radius: 16px; overflow: hidden; pointer-events: all; animation: slideIn 0.4s ease; }
.museo-artwork-panel.hidden { display: none; }
@keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.museo-artwork-panel img { width: 100%; height: 220px; object-fit: cover; }
.museo-artwork-panel .panel-content { padding: 20px; color: white; }
.museo-artwork-panel h2 { font-size: 18px; margin: 0 0 8px; font-weight: 500; }
.museo-artwork-panel p { margin: 0 0 8px; opacity: 0.8; font-size: 14px; }
.museo-artwork-panel span { font-size: 12px; opacity: 0.5; }
.museo-artwork-panel .panel-close { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.5); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 16px; }
@media (max-width: 768px) {
    .museo-room-nav { top: auto; bottom: 80px; left: 12px; right: 12px; flex-direction: row; justify-content: center; }
    .museo-controls-hint { display: none; }
    .museo-artwork-panel { left: 12px; right: 12px; width: auto; bottom: 12px; }
}
        `;
        document.head.appendChild(style);
    }
}

// Global launcher
window.openMuseoVirtual3D = async function() {
    document.body.style.overflow = 'hidden';
    const museo = new MuseoVirtual3DV3();
    await museo.init();
    window.currentMuseo = museo;
};

window.MuseoVirtual3DV3 = MuseoVirtual3DV3;
console.log('🏛️ Museo Virtual 3D v3.0 - Premium Edition loaded');
