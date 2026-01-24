/**
 * GALLERY 3D PREMIUM — Museo Virtual Inmersivo
 * Experiencia museística completa con Three.js
 * v2.0.0 - 2026-01-24 — Major Upgrade
 */

class Gallery3DPremium {
    constructor() {
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.artworks = [];
        this.artworkMeshes = [];
        this.isActive = false;
        this.clock = null;
        this.raycaster = null;
        this.mouse = new THREE.Vector2();
        this.spotLights = [];
        
        // Movement
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.moveSpeed = 80;
        
        // Gallery settings
        this.roomWidth = 50;
        this.roomHeight = 10;
        this.roomDepth = 80;
        
        // Atmosphere
        this.dustParticles = null;
        this.ambientSound = null;
        
        console.log('🏛️ Gallery 3D Premium loaded');
    }
    
    async init() {
        if (typeof THREE === 'undefined') {
            await this.loadThreeJS();
        }
        this.createUI();
        this.addStyles();
    }
    
    async loadThreeJS() {
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
        console.log('✅ Three.js + Controls loaded');
    }
    
    createUI() {
        // Toggle button
        const btn = document.createElement('div');
        btn.className = 'gallery3d-toggle';
        btn.innerHTML = `
            <button class="gallery3d-btn" title="Museo Virtual 3D">
                <span class="gallery3d-icon">🏛️</span>
                <span class="gallery3d-text">Museo 3D</span>
            </button>
        `;
        document.body.appendChild(btn);
        btn.querySelector('.gallery3d-btn').addEventListener('click', () => this.open());
        
        // Full container
        this.container = document.createElement('div');
        this.container.className = 'gallery3d-container hidden';
        this.container.innerHTML = `
            <div class="gallery3d-header">
                <div class="gallery3d-branding">
                    <span class="gallery3d-logo">🏛️</span>
                    <div>
                        <h2>Museo Virtual</h2>
                        <p class="gallery3d-artist">Naroa Gutiérrez Gil</p>
                    </div>
                </div>
                <div class="gallery3d-controls-info">
                    <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Mover
                    <span class="separator">|</span>
                    <kbd>Mouse</kbd> Mirar
                    <span class="separator">|</span>
                    <kbd>Click</kbd> Ver obra
                    <span class="separator">|</span>
                    <kbd>ESC</kbd> Salir
                </div>
                <button class="gallery3d-close">✕</button>
            </div>
            <div class="gallery3d-canvas-wrapper">
                <canvas class="gallery3d-canvas"></canvas>
                <div class="gallery3d-crosshair">+</div>
            </div>
            <div class="gallery3d-loading">
                <div class="gallery3d-spinner"></div>
                <p>Construyendo museo...</p>
                <div class="gallery3d-progress"><div class="gallery3d-progress-bar"></div></div>
            </div>
            <div class="gallery3d-instructions">
                <div class="gallery3d-instructions-content">
                    <div class="gallery3d-instructions-icon">👆</div>
                    <p>Haz click para explorar el museo</p>
                    <span class="gallery3d-instructions-hint">Usa las teclas WASD para moverte</span>
                </div>
            </div>
            <div class="gallery3d-artwork-panel hidden">
                <button class="artwork-panel-close">✕</button>
                <div class="artwork-panel-image"></div>
                <div class="artwork-panel-info">
                    <h3 class="artwork-panel-title"></h3>
                    <p class="artwork-panel-technique"></p>
                    <p class="artwork-panel-description"></p>
                </div>
            </div>
            <div class="gallery3d-minimap">
                <canvas class="minimap-canvas" width="150" height="200"></canvas>
                <div class="minimap-player"></div>
            </div>
        `;
        document.body.appendChild(this.container);
        
        // Events
        this.container.querySelector('.gallery3d-close').addEventListener('click', () => this.close());
        this.container.querySelector('.gallery3d-instructions').addEventListener('click', () => this.lockPointer());
        this.container.querySelector('.artwork-panel-close').addEventListener('click', () => this.hideArtworkPanel());
    }
    
    async open() {
        this.container.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        const loading = this.container.querySelector('.gallery3d-loading');
        const progressBar = loading.querySelector('.gallery3d-progress-bar');
        loading.classList.remove('hidden');
        
        // Progress simulation
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            progressBar.style.width = progress + '%';
        }, 100);
        
        await this.initScene();
        await this.loadArtworks();
        this.buildMuseum();
        this.createAtmosphere();
        
        clearInterval(progressInterval);
        progressBar.style.width = '100%';
        
        setTimeout(() => {
            loading.classList.add('hidden');
            this.isActive = true;
            this.animate();
        }, 300);
        
        console.log('🏛️ Museum opened');
    }
    
    close() {
        this.isActive = false;
        this.container.classList.add('hidden');
        document.body.style.overflow = '';
        
        if (this.controls?.isLocked) {
            this.controls.unlock();
        }
        
        // Cleanup
        if (this.ambientSound) {
            this.ambientSound.pause();
            this.ambientSound = null;
        }
        
        console.log('🏛️ Museum closed');
    }
    
    async initScene() {
        const canvas = this.container.querySelector('.gallery3d-canvas');
        const wrapper = this.container.querySelector('.gallery3d-canvas-wrapper');
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.015);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            70,
            wrapper.clientWidth / wrapper.clientHeight,
            0.1,
            500
        );
        this.camera.position.set(0, 4.5, 30);
        
        // Renderer with premium settings
        this.renderer = new THREE.WebGLRenderer({ 
            canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        // Controls
        if (typeof THREE.PointerLockControls !== 'undefined') {
            this.controls = new THREE.PointerLockControls(this.camera, canvas);
            this.scene.add(this.controls.getObject());
            
            this.controls.addEventListener('lock', () => {
                this.container.querySelector('.gallery3d-instructions').classList.add('hidden');
            });
            this.controls.addEventListener('unlock', () => {
                if (this.isActive) {
                    this.container.querySelector('.gallery3d-instructions').classList.remove('hidden');
                }
            });
        }
        
        this.raycaster = new THREE.Raycaster();
        this.clock = new THREE.Clock();
        
        this.addLighting();
        this.bindEvents();
        
        window.addEventListener('resize', () => this.onResize());
    }
    
    addLighting() {
        // Soft ambient
        const ambient = new THREE.AmbientLight(0xfff5e6, 0.15);
        this.scene.add(ambient);
        
        // Warm ceiling lights
        const ceilingLightPositions = [
            [0, this.roomHeight - 0.5, 0],
            [0, this.roomHeight - 0.5, -20],
            [0, this.roomHeight - 0.5, -40]
        ];
        
        ceilingLightPositions.forEach(pos => {
            const light = new THREE.PointLight(0xfff0e0, 0.4, 30);
            light.position.set(...pos);
            light.castShadow = true;
            light.shadow.mapSize.width = 512;
            light.shadow.mapSize.height = 512;
            this.scene.add(light);
            
            // Light fixture geometry
            const fixtureGeo = new THREE.CylinderGeometry(0.3, 0.5, 0.3, 16);
            const fixtureMat = new THREE.MeshStandardMaterial({
                color: 0x222222,
                metalness: 0.8,
                roughness: 0.3
            });
            const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
            fixture.position.set(pos[0], pos[1] + 0.15, pos[2]);
            this.scene.add(fixture);
        });
    }
    
    async loadArtworks() {
        // Load real artworks from the site
        this.artworks = [
            { 
                id: 1, 
                title: 'DiviNos VaiVenes I', 
                technique: 'Grafito y mica sobre papel', 
                year: '2026',
                description: 'Serie que explora los vaivenes emocionales a través de iconos del cine y la música.',
                image: '/images/optimized/853524166127006_000001_485141007_1310753923737359_3104141236670420796_n.webp' 
            },
            { 
                id: 2, 
                title: 'DiviNos VaiVenes II', 
                technique: 'Carbón y mica sobre pizarra', 
                year: '2026',
                description: 'El baile de polaridades complementarias: luz y tiniebla abrazándose.',
                image: '/images/optimized/853524166127006_000002_485142581_1310753963737355_5413431824173292980_n.webp' 
            },
            { 
                id: 3, 
                title: 'Serie del Error I', 
                technique: 'Grafito sobre papel', 
                year: '2024',
                description: 'El error como método creativo, donde los accidentes revelan verdades ocultas.',
                image: '/images/optimized/1111052607040826_000001_488801818_1326493758830042_9047190515717355076_n.webp' 
            },
            { 
                id: 4, 
                title: 'Serie del Error II', 
                technique: 'Técnica mixta', 
                year: '2024',
                description: 'Explorando la belleza de lo imperfecto y lo no planificado.',
                image: '/images/optimized/1111052607040826_000003_488904810_1326493332163418_8036600761455551925_n.webp' 
            },
            { 
                id: 5, 
                title: 'Iconos Pop I', 
                technique: 'Acrílico sobre lienzo', 
                year: '2020',
                description: 'Rostros que trascienden su fama para convertirse en espejos de nosotros mismos.',
                image: '/images/optimized/551743489638410_000002_475668184_1271253591020726_6657980105758186982_n.webp' 
            },
            { 
                id: 6, 
                title: 'Iconos Pop II', 
                technique: 'Acrílico y grafito', 
                year: '2020',
                description: 'La mirada del icono que nos devuelve nuestra propia identidad.',
                image: '/images/optimized/551743489638410_000005_475783569_1271253671020718_8162290046042793177_n.webp' 
            },
            { 
                id: 7, 
                title: 'Vaivenes I', 
                technique: 'Grafito sobre papel', 
                year: '2019',
                description: 'Retratos en pizarra que pendulean entre estados emocionales.',
                image: '/images/optimized/1577827357030013_000001_616035859_1577822453697170_3937842745320602184_n.webp' 
            },
            { 
                id: 8, 
                title: 'Vaivenes II', 
                technique: 'Carbón sobre papel', 
                year: '2019',
                description: 'El retrato como ventana al alma, suspendido entre alegría y melancolía.',
                image: '/images/optimized/1577827357030013_000008_615932964_1577822457030503_2110397705300850911_n.webp' 
            },
            { 
                id: 9, 
                title: 'Retrato Hiperrealista I', 
                technique: 'Grafito', 
                year: '2022',
                description: 'La búsqueda de lo que permanece cuando se va la pose.',
                image: '/images/optimized/1571125317700217_000001_612329591_1571120784367337_8798688892093004057_n.webp' 
            },
            { 
                id: 10, 
                title: 'Retrato Hiperrealista II', 
                technique: 'Grafito y tinta', 
                year: '2022',
                description: 'Capturando la esencia más allá del parecido superficial.',
                image: '/images/optimized/1571125317700217_000007_614639292_1571120764367339_609424517255324890_n.webp' 
            },
            { 
                id: 11, 
                title: 'Espejos del Alma I', 
                technique: 'Acrílico', 
                year: '2015',
                description: 'Todos somos lo mismo con distintas apariencias.',
                image: '/images/optimized/1112397760239644_000001_488633569_1326500505496034_1381147627022751779_n.webp' 
            },
            { 
                id: 12, 
                title: 'Espejos del Alma II', 
                technique: 'Óleo sobre tabla', 
                year: '2015',
                description: 'Formamos parte de una misma inmensa identidad.',
                image: '/images/optimized/1112397760239644_000005_488887780_1326500332162718_7659033577272622277_n.webp' 
            }
        ];
    }
    
    buildMuseum() {
        // FLOOR — Marble-like
        const floorTexture = this.createMarbleTexture();
        const floorMaterial = new THREE.MeshStandardMaterial({
            map: floorTexture,
            roughness: 0.3,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(this.roomWidth, this.roomDepth, 1, 1),
            floorMaterial
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // CEILING
        const ceilingMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1815,
            roughness: 1,
            metalness: 0
        });
        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(this.roomWidth, this.roomDepth),
            ceilingMaterial
        );
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = this.roomHeight;
        this.scene.add(ceiling);
        
        // WALLS
        this.buildWalls();
        
        // PLACE ARTWORKS
        this.placeArtworks();
        
        // DECORATIONS
        this.addBenches();
        this.addPedestals();
        this.addEntranceArch();
    }
    
    createMarbleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Base color
        ctx.fillStyle = '#2a2622';
        ctx.fillRect(0, 0, 512, 512);
        
        // Add veins
        ctx.strokeStyle = 'rgba(60, 55, 50, 0.3)';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 512, Math.random() * 512);
            ctx.bezierCurveTo(
                Math.random() * 512, Math.random() * 512,
                Math.random() * 512, Math.random() * 512,
                Math.random() * 512, Math.random() * 512
            );
            ctx.stroke();
        }
        
        // Tile grid
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        for (let x = 0; x < 512; x += 64) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 512);
            ctx.stroke();
        }
        for (let y = 0; y < 512; y += 64) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(512, y);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 12);
        return texture;
    }
    
    buildWalls() {
        // Wall material — Museum white
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xf8f5f0,
            roughness: 0.9,
            metalness: 0
        });
        
        // Dado/Wainscoting material
        const dadoMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3530,
            roughness: 0.4,
            metalness: 0.2
        });
        
        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.roomWidth, this.roomHeight),
            wallMaterial
        );
        backWall.position.set(0, this.roomHeight / 2, -this.roomDepth / 2);
        backWall.receiveShadow = true;
        this.scene.add(backWall);
        
        // Back wall dado
        const backDado = new THREE.Mesh(
            new THREE.BoxGeometry(this.roomWidth, 1.5, 0.1),
            dadoMaterial
        );
        backDado.position.set(0, 0.75, -this.roomDepth / 2 + 0.05);
        this.scene.add(backDado);
        
        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.roomDepth, this.roomHeight),
            wallMaterial
        );
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-this.roomWidth / 2, this.roomHeight / 2, 0);
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);
        
        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(this.roomDepth, this.roomHeight),
            wallMaterial
        );
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.set(this.roomWidth / 2, this.roomHeight / 2, 0);
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);
        
        // Crown molding
        const moldingGeo = new THREE.BoxGeometry(this.roomWidth + 1, 0.3, 0.3);
        const moldingMat = new THREE.MeshStandardMaterial({
            color: 0xd4c8b8,
            roughness: 0.5,
            metalness: 0.1
        });
        
        const backMolding = new THREE.Mesh(moldingGeo, moldingMat);
        backMolding.position.set(0, this.roomHeight - 0.15, -this.roomDepth / 2 + 0.15);
        this.scene.add(backMolding);
    }
    
    placeArtworks() {
        const loader = new THREE.TextureLoader();
        
        // Distribute artworks on walls
        const leftWallArtworks = this.artworks.slice(0, 4);
        const rightWallArtworks = this.artworks.slice(4, 8);
        const backWallArtworks = this.artworks.slice(8, 12);
        
        // Left wall
        leftWallArtworks.forEach((artwork, i) => {
            const z = -this.roomDepth / 2 + 15 + i * 15;
            this.createArtworkFrame(artwork, {
                x: -this.roomWidth / 2 + 0.3,
                y: 4.5,
                z: z
            }, Math.PI / 2, loader);
        });
        
        // Right wall
        rightWallArtworks.forEach((artwork, i) => {
            const z = -this.roomDepth / 2 + 15 + i * 15;
            this.createArtworkFrame(artwork, {
                x: this.roomWidth / 2 - 0.3,
                y: 4.5,
                z: z
            }, -Math.PI / 2, loader);
        });
        
        // Back wall
        backWallArtworks.forEach((artwork, i) => {
            const x = -12 + i * 8;
            this.createArtworkFrame(artwork, {
                x: x,
                y: 4.5,
                z: -this.roomDepth / 2 + 0.3
            }, 0, loader);
        });
    }
    
    createArtworkFrame(artwork, position, rotation, loader) {
        const frameWidth = 5;
        const frameHeight = 4;
        const frameDepth = 0.15;
        const frameBorder = 0.25;
        
        const group = new THREE.Group();
        
        // Ornate frame
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0xb8860b, // Golden
            roughness: 0.3,
            metalness: 0.7
        });
        
        // Frame pieces
        const topFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameWidth + frameBorder * 2, frameBorder, frameDepth),
            frameMaterial
        );
        topFrame.position.y = frameHeight / 2 + frameBorder / 2;
        topFrame.castShadow = true;
        group.add(topFrame);
        
        const bottomFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameWidth + frameBorder * 2, frameBorder, frameDepth),
            frameMaterial
        );
        bottomFrame.position.y = -frameHeight / 2 - frameBorder / 2;
        bottomFrame.castShadow = true;
        group.add(bottomFrame);
        
        const leftFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameBorder, frameHeight, frameDepth),
            frameMaterial
        );
        leftFrame.position.x = -frameWidth / 2 - frameBorder / 2;
        leftFrame.castShadow = true;
        group.add(leftFrame);
        
        const rightFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameBorder, frameHeight, frameDepth),
            frameMaterial
        );
        rightFrame.position.x = frameWidth / 2 + frameBorder / 2;
        rightFrame.castShadow = true;
        group.add(rightFrame);
        
        // Inner matting
        const mattMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5f5f0,
            roughness: 0.9
        });
        const matt = new THREE.Mesh(
            new THREE.BoxGeometry(frameWidth - 0.2, frameHeight - 0.2, 0.02),
            mattMaterial
        );
        matt.position.z = frameDepth / 2 - 0.02;
        group.add(matt);
        
        // Artwork canvas
        loader.load(artwork.image, (texture) => {
            texture.encoding = THREE.sRGBEncoding;
            texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            
            const artMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.4
            });
            
            const artCanvas = new THREE.Mesh(
                new THREE.PlaneGeometry(frameWidth - 0.6, frameHeight - 0.6),
                artMaterial
            );
            artCanvas.position.z = frameDepth / 2;
            artCanvas.userData = { isArtwork: true, artwork };
            group.add(artCanvas);
            
            this.artworkMeshes.push(artCanvas);
        });
        
        // Position and rotate
        group.position.set(position.x, position.y, position.z);
        group.rotation.y = rotation;
        
        this.scene.add(group);
        
        // Spotlight for this artwork
        this.addArtworkSpotlight(position, rotation);
        
        // Label
        this.addArtworkLabel(artwork, position, rotation);
    }
    
    addArtworkSpotlight(position, rotation) {
        const spotlight = new THREE.SpotLight(0xfff8e8, 1.2);
        
        // Position light above and in front of artwork
        const offsetX = rotation === 0 ? 0 : (rotation > 0 ? 4 : -4);
        const offsetZ = rotation === 0 ? 6 : 0;
        
        spotlight.position.set(
            position.x + offsetX,
            this.roomHeight - 1,
            position.z + offsetZ
        );
        
        const target = new THREE.Object3D();
        target.position.set(position.x, position.y, position.z);
        this.scene.add(target);
        spotlight.target = target;
        
        spotlight.angle = Math.PI / 8;
        spotlight.penumbra = 0.5;
        spotlight.decay = 1.5;
        spotlight.distance = 20;
        spotlight.castShadow = true;
        spotlight.shadow.mapSize.width = 512;
        spotlight.shadow.mapSize.height = 512;
        
        this.scene.add(spotlight);
        this.spotLights.push(spotlight);
    }
    
    addArtworkLabel(artwork, position, rotation) {
        // Create label using canvas
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 256, 64);
        
        ctx.fillStyle = '#f4f3f0';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(artwork.title, 10, 25);
        
        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        ctx.fillText(artwork.technique + ' · ' + artwork.year, 10, 45);
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const label = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 0.5),
            labelMaterial
        );
        
        const labelOffsetX = rotation === 0 ? 0 : (rotation > 0 ? 0.3 : -0.3);
        const labelOffsetZ = rotation === 0 ? 0.3 : 0;
        
        label.position.set(
            position.x + labelOffsetX,
            position.y - 2.8,
            position.z + labelOffsetZ
        );
        label.rotation.y = rotation;
        
        this.scene.add(label);
    }
    
    addBenches() {
        const benchGeo = new THREE.BoxGeometry(4, 0.5, 1.2);
        const benchMat = new THREE.MeshStandardMaterial({
            color: 0x2a2520,
            roughness: 0.6,
            metalness: 0.1
        });
        
        const legGeo = new THREE.BoxGeometry(0.15, 0.4, 1.2);
        
        const positions = [
            [0, 0.65, 5],
            [0, 0.65, -15],
            [0, 0.65, -35]
        ];
        
        positions.forEach(pos => {
            const benchGroup = new THREE.Group();
            
            const seat = new THREE.Mesh(benchGeo, benchMat);
            seat.position.y = 0.25;
            seat.castShadow = true;
            seat.receiveShadow = true;
            benchGroup.add(seat);
            
            // Legs
            [-1.7, 1.7].forEach(xOffset => {
                const leg = new THREE.Mesh(legGeo, benchMat);
                leg.position.set(xOffset, -0.2, 0);
                leg.castShadow = true;
                benchGroup.add(leg);
            });
            
            benchGroup.position.set(...pos);
            this.scene.add(benchGroup);
        });
    }
    
    addPedestals() {
        const pedestalGeo = new THREE.CylinderGeometry(0.4, 0.5, 1, 16);
        const pedestalMat = new THREE.MeshStandardMaterial({
            color: 0xf8f5f0,
            roughness: 0.8
        });
        
        const positions = [
            [-8, 0.5, -20],
            [8, 0.5, -20]
        ];
        
        positions.forEach(pos => {
            const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
            pedestal.position.set(...pos);
            pedestal.castShadow = true;
            pedestal.receiveShadow = true;
            this.scene.add(pedestal);
            
            // Top plate
            const plate = new THREE.Mesh(
                new THREE.CylinderGeometry(0.45, 0.45, 0.05, 16),
                new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.5 })
            );
            plate.position.set(pos[0], pos[1] + 0.525, pos[2]);
            this.scene.add(plate);
        });
    }
    
    addEntranceArch() {
        // Simple arch at entrance
        const archMat = new THREE.MeshStandardMaterial({
            color: 0xd4c8b8,
            roughness: 0.5
        });
        
        // Columns
        const columnGeo = new THREE.CylinderGeometry(0.4, 0.5, 6, 16);
        
        const leftCol = new THREE.Mesh(columnGeo, archMat);
        leftCol.position.set(-4, 3, 35);
        leftCol.castShadow = true;
        this.scene.add(leftCol);
        
        const rightCol = new THREE.Mesh(columnGeo, archMat);
        rightCol.position.set(4, 3, 35);
        rightCol.castShadow = true;
        this.scene.add(rightCol);
        
        // Lintel
        const lintel = new THREE.Mesh(
            new THREE.BoxGeometry(10, 0.6, 1),
            archMat
        );
        lintel.position.set(0, 6.3, 35);
        lintel.castShadow = true;
        this.scene.add(lintel);
    }
    
    createAtmosphere() {
        // Dust particles
        const particleCount = 500;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * this.roomWidth;
            positions[i * 3 + 1] = Math.random() * this.roomHeight;
            positions[i * 3 + 2] = (Math.random() - 0.5) * this.roomDepth;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: true
        });
        
        this.dustParticles = new THREE.Points(geometry, material);
        this.scene.add(this.dustParticles);
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        this.container.addEventListener('click', (e) => this.onClick(e));
    }
    
    lockPointer() {
        if (this.controls && !this.controls.isLocked) {
            this.controls.lock();
        }
    }
    
    onKeyDown(e) {
        if (!this.isActive || !this.controls?.isLocked) return;
        
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = true;
                break;
        }
    }
    
    onKeyUp(e) {
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = false;
                break;
        }
    }
    
    onClick(e) {
        if (!this.isActive) return;
        
        // Check for artwork click
        if (this.controls?.isLocked && this.artworkMeshes.length > 0) {
            this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
            const intersects = this.raycaster.intersectObjects(this.artworkMeshes);
            
            if (intersects.length > 0 && intersects[0].distance < 10) {
                const artwork = intersects[0].object.userData.artwork;
                if (artwork) {
                    this.showArtworkPanel(artwork, intersects[0].object.material.map);
                }
            }
        }
    }
    
    showArtworkPanel(artwork, texture) {
        const panel = this.container.querySelector('.gallery3d-artwork-panel');
        panel.querySelector('.artwork-panel-title').textContent = artwork.title;
        panel.querySelector('.artwork-panel-technique').textContent = `${artwork.technique} · ${artwork.year}`;
        panel.querySelector('.artwork-panel-description').textContent = artwork.description;
        
        // Set image
        const imageDiv = panel.querySelector('.artwork-panel-image');
        imageDiv.innerHTML = `<img src="${artwork.image}" alt="${artwork.title}">`;
        
        panel.classList.remove('hidden');
        
        // Unlock controls temporarily
        if (this.controls?.isLocked) {
            this.controls.unlock();
        }
    }
    
    hideArtworkPanel() {
        this.container.querySelector('.gallery3d-artwork-panel').classList.add('hidden');
    }
    
    onResize() {
        if (!this.camera || !this.renderer) return;
        
        const wrapper = this.container.querySelector('.gallery3d-canvas-wrapper');
        this.camera.aspect = wrapper.clientWidth / wrapper.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    }
    
    animate() {
        if (!this.isActive) return;
        
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // Player movement
        if (this.controls?.isLocked) {
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;
            
            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize();
            
            if (this.moveForward || this.moveBackward) {
                this.velocity.z -= this.direction.z * this.moveSpeed * delta;
            }
            if (this.moveLeft || this.moveRight) {
                this.velocity.x -= this.direction.x * this.moveSpeed * delta;
            }
            
            this.controls.moveRight(-this.velocity.x * delta);
            this.controls.moveForward(-this.velocity.z * delta);
            
            // Keep eye level
            this.controls.getObject().position.y = 4.5;
            
            // Room bounds
            const pos = this.controls.getObject().position;
            pos.x = Math.max(-this.roomWidth / 2 + 2, Math.min(this.roomWidth / 2 - 2, pos.x));
            pos.z = Math.max(-this.roomDepth / 2 + 2, Math.min(this.roomDepth / 2, pos.z));
        }
        
        // Animate dust
        if (this.dustParticles) {
            this.dustParticles.rotation.y += 0.0002;
            const positions = this.dustParticles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.002;
            }
            this.dustParticles.geometry.attributes.position.needsUpdate = true;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    addStyles() {
        if (document.getElementById('gallery3d-premium-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'gallery3d-premium-styles';
        style.textContent = `
            /* Toggle */
            .gallery3d-toggle {
                position: fixed;
                bottom: 100px;
                right: 20px;
                z-index: 10001;
            }
            
            .gallery3d-btn {
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
                font-family: inherit;
                font-weight: 500;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
            }
            
            .gallery3d-btn:hover {
                transform: scale(1.05) translateY(-2px);
                border-color: rgba(184, 134, 11, 0.6);
                box-shadow: 0 8px 30px rgba(184, 134, 11, 0.2);
            }
            
            .gallery3d-icon { font-size: 22px; }
            
            /* Container */
            .gallery3d-container {
                position: fixed;
                inset: 0;
                z-index: 100000;
                background: #0a0a0a;
                display: flex;
                flex-direction: column;
            }
            
            .gallery3d-container.hidden { display: none; }
            
            /* Header */
            .gallery3d-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 1rem 2rem;
                background: rgba(0, 0, 0, 0.9);
                border-bottom: 1px solid rgba(184, 134, 11, 0.2);
            }
            
            .gallery3d-branding {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .gallery3d-logo { font-size: 2rem; }
            
            .gallery3d-branding h2 {
                color: #f4f3f0;
                font-size: 1.3rem;
                font-weight: 400;
                margin: 0;
            }
            
            .gallery3d-artist {
                color: rgba(255, 255, 255, 0.5);
                font-size: 0.85rem;
                margin: 0;
            }
            
            .gallery3d-controls-info {
                display: flex;
                align-items: center;
                gap: 1rem;
                color: rgba(255, 255, 255, 0.5);
                font-size: 0.8rem;
            }
            
            .gallery3d-controls-info kbd {
                background: rgba(255, 255, 255, 0.1);
                padding: 4px 8px;
                border-radius: 4px;
                font-family: monospace;
            }
            
            .gallery3d-controls-info .separator {
                opacity: 0.3;
            }
            
            .gallery3d-close {
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: #f4f3f0;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
                transition: all 0.3s;
            }
            
            .gallery3d-close:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(184, 134, 11, 0.5);
            }
            
            /* Canvas */
            .gallery3d-canvas-wrapper {
                flex: 1;
                position: relative;
                overflow: hidden;
            }
            
            .gallery3d-canvas {
                width: 100%;
                height: 100%;
                display: block;
            }
            
            .gallery3d-crosshair {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: rgba(255, 255, 255, 0.3);
                font-size: 24px;
                pointer-events: none;
                font-weight: 100;
                text-shadow: 0 0 10px rgba(0,0,0,0.5);
            }
            
            /* Loading */
            .gallery3d-loading {
                position: absolute;
                inset: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: #0a0a0a;
                z-index: 10;
            }
            
            .gallery3d-loading.hidden { display: none; }
            
            .gallery3d-spinner {
                width: 60px;
                height: 60px;
                border: 3px solid rgba(255, 255, 255, 0.1);
                border-top-color: #b8860b;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin { to { transform: rotate(360deg); } }
            
            .gallery3d-loading p {
                margin-top: 1.5rem;
                color: rgba(255, 255, 255, 0.6);
                font-size: 1rem;
            }
            
            .gallery3d-progress {
                width: 200px;
                height: 3px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                margin-top: 1rem;
                overflow: hidden;
            }
            
            .gallery3d-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #b8860b, #d4af37);
                width: 0%;
                transition: width 0.1s ease;
            }
            
            /* Instructions */
            .gallery3d-instructions {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 5;
                cursor: pointer;
            }
            
            .gallery3d-instructions.hidden { display: none; }
            
            .gallery3d-instructions-content {
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(20px);
                padding: 3rem 4rem;
                border-radius: 16px;
                border: 1px solid rgba(184, 134, 11, 0.3);
                text-align: center;
                transition: all 0.3s ease;
            }
            
            .gallery3d-instructions-content:hover {
                transform: scale(1.02);
                border-color: rgba(184, 134, 11, 0.6);
                box-shadow: 0 0 40px rgba(184, 134, 11, 0.15);
            }
            
            .gallery3d-instructions-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
                animation: pulse 2s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.8; }
            }
            
            .gallery3d-instructions p {
                color: #f4f3f0;
                font-size: 1.3rem;
                margin: 0 0 0.5rem;
            }
            
            .gallery3d-instructions-hint {
                color: rgba(255, 255, 255, 0.4);
                font-size: 0.9rem;
            }
            
            /* Artwork Panel */
            .gallery3d-artwork-panel {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(10, 10, 10, 0.98);
                backdrop-filter: blur(30px);
                border-radius: 20px;
                border: 1px solid rgba(184, 134, 11, 0.3);
                padding: 2rem;
                max-width: 600px;
                width: 90%;
                z-index: 20;
                animation: fadeIn 0.3s ease;
            }
            
            .gallery3d-artwork-panel.hidden { display: none; }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            
            .artwork-panel-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: #f4f3f0;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
            }
            
            .artwork-panel-image {
                width: 100%;
                aspect-ratio: 4/3;
                background: #1a1a1a;
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: 1.5rem;
            }
            
            .artwork-panel-image img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            
            .artwork-panel-title {
                color: #f4f3f0;
                font-size: 1.5rem;
                font-weight: 500;
                margin: 0 0 0.5rem;
            }
            
            .artwork-panel-technique {
                color: #b8860b;
                font-size: 0.95rem;
                margin: 0 0 1rem;
            }
            
            .artwork-panel-description {
                color: rgba(255, 255, 255, 0.6);
                font-size: 0.95rem;
                line-height: 1.6;
                margin: 0;
            }
            
            /* Minimap */
            .gallery3d-minimap {
                position: absolute;
                bottom: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 8px;
            }
            
            .minimap-canvas {
                display: block;
            }
            
            /* Mobile */
            @media (max-width: 768px) {
                .gallery3d-toggle { bottom: 80px; right: 10px; }
                .gallery3d-text { display: none; }
                .gallery3d-btn { padding: 14px; }
                .gallery3d-controls-info { display: none; }
                .gallery3d-header { padding: 0.8rem 1rem; }
                .gallery3d-branding h2 { font-size: 1rem; }
                .gallery3d-minimap { display: none; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.gallery3D = new Gallery3DPremium();
        window.gallery3D.init();
    });
} else {
    window.gallery3D = new Gallery3DPremium();
    window.gallery3D.init();
}
