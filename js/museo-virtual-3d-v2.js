/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MUSEO VIRTUAL 3D v2.0 — Galería Inmersiva Premium
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MEJORAS v2.0:
 * ✅ Audio ambiente procedural (pasos, ecos, murmullos)
 * ✅ Zoom dramático al hacer click en obra
 * ✅ Múltiples salas temáticas
 * ✅ Tour guiado automático
 * ✅ Suelo reflectante mejorado
 * ✅ Partículas de polvo atmosféricas
 * 
 * v2.0.0 - 2026-01-24
 */

class MuseoVirtual3DV2 {
    constructor(containerId = 'museo-3d-container') {
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = null;
        this.mouse = new THREE.Vector2();
        
        // Colección de obras
        this.artworks = [];
        this.artworkMeshes = [];
        this.selectedArtwork = null;
        
        // Estado del museo
        this.isLoading = true;
        this.currentRoom = 'main';
        this.moveSpeed = 0.15;
        this.lookSpeed = 0.003;
        
        // Iluminación
        this.lights = [];
        this.spotlights = [];
        
        // Animación
        this.clock = new THREE.Clock();
        this.animationId = null;
        
        // Audio system
        this.audioSystem = null;
        this.audioEnabled = true;
        
        // Zoom state
        this.isZooming = false;
        this.originalCameraPos = null;
        this.zoomTarget = null;
        
        // Particles
        this.dustParticles = null;
        
        // Configuración de salas temáticas
        this.rooms = {
            main: { 
                width: 30, depth: 40, height: 8,
                name: 'Sala Principal',
                description: 'Obras destacadas de la colección',
                wallColor: 0xf5f5f5,
                floorColor: 0x1a1a1a
            },
            divinos: { 
                width: 25, depth: 30, height: 7,
                name: 'DiviNos VaiVenes',
                description: 'Serie de iconos contemporáneos',
                wallColor: 0xfaf8f5,
                floorColor: 0x2a1a10
            },
            retratos: { 
                width: 20, depth: 25, height: 6,
                name: 'Retratos',
                description: 'Estudios del alma humana',
                wallColor: 0xf0f0f0,
                floorColor: 0x1a1a2e
            },
            walking: { 
                width: 35, depth: 20, height: 6,
                name: 'Walking Gallery',
                description: 'Arte urbano y callejero',
                wallColor: 0xe8e8e8,
                floorColor: 0x252525
            }
        };
        
        // Tour guiado
        this.tourActive = false;
        this.tourPoints = [];
        this.currentTourIndex = 0;
        
        console.log('🏛️ Museo Virtual 3D v2.0 initialized');
    }

    async init() {
        console.log('🏛️ Inicializando Museo Virtual 3D v2.0...');
        
        // Verificar Three.js
        if (typeof THREE === 'undefined') {
            await this.loadThreeJS();
        }
        
        this.createContainer();
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.setupControls();
        this.setupRaycaster();
        
        await this.buildMuseum();
        await this.loadArtworks();
        
        // Create atmospheric effects
        this.createDustParticles();
        
        // Initialize audio
        await this.initAudio();
        
        this.bindEvents();
        this.animate();
        
        this.isLoading = false;
        this.hideLoadingScreen();
        
        console.log('🏛️ Museo Virtual 3D v2.0 listo!');
    }

    async loadThreeJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = () => {
                console.log('✅ Three.js loaded');
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async initAudio() {
        if (window.MuseoAudioSystem) {
            this.audioSystem = new window.MuseoAudioSystem();
            await this.audioSystem.init();
        }
    }

    createContainer() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = this.containerId;
            document.body.appendChild(this.container);
        }
        
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            background: #0a0a0a;
        `;
        
        this.container.innerHTML = `
            <div id="museo-loading" class="museo-loading">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <h2>Entrando al Museo Virtual</h2>
                    <p>Cargando obras de arte...</p>
                </div>
            </div>
            <div id="museo-hud" class="museo-hud hidden">
                <button id="museo-close" class="museo-btn-close" aria-label="Cerrar">✕</button>
                <button id="museo-audio-toggle" class="museo-btn-audio" aria-label="Audio">🔊</button>
                <button id="museo-tour" class="museo-btn-tour" aria-label="Tour">🚶 Tour Guiado</button>
                <div class="museo-room-nav">
                    <button class="room-btn" data-room="main">🏛️ Principal</button>
                    <button class="room-btn" data-room="divinos">✨ DiviNos</button>
                    <button class="room-btn" data-room="retratos">👤 Retratos</button>
                    <button class="room-btn" data-room="walking">🚶 Walking</button>
                </div>
                <div class="museo-controls-hint">
                    <span>WASD / Flechas para moverte</span>
                    <span>Mouse para mirar</span>
                    <span>Click en obra para zoom</span>
                </div>
            </div>
            <div id="museo-info-panel" class="museo-info-panel hidden">
                <button class="panel-close">✕</button>
                <img id="panel-image" src="" alt="">
                <div class="panel-content">
                    <h2 id="panel-title"></h2>
                    <p id="panel-description"></p>
                    <span id="panel-year"></span>
                </div>
            </div>
            <div id="museo-zoom-overlay" class="museo-zoom-overlay hidden">
                <button class="zoom-close">✕ Volver</button>
            </div>
        `;
        
        this.injectStyles();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.012);
    }

    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);
        this.camera.position.set(0, 1.7, 15);
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
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0xffffff, 0.1);
        this.scene.add(ambient);
        
        // Hemisphere light
        const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
        hemi.position.set(0, 20, 0);
        this.scene.add(hemi);
        
        // Main directional light
        const skylight = new THREE.DirectionalLight(0xffffff, 0.4);
        skylight.position.set(0, 15, 5);
        skylight.castShadow = true;
        skylight.shadow.mapSize.width = 2048;
        skylight.shadow.mapSize.height = 2048;
        this.scene.add(skylight);
        this.lights.push(skylight);
    }

    createSpotlightForArtwork(position, target) {
        const spot = new THREE.SpotLight(0xfff5e6, 1.5);
        spot.position.set(position.x, position.y + 3, position.z + 2);
        spot.target.position.copy(target);
        spot.angle = Math.PI / 8;
        spot.penumbra = 0.5;
        spot.decay = 1.5;
        spot.distance = 15;
        spot.castShadow = true;
        
        this.scene.add(spot);
        this.scene.add(spot.target);
        this.spotlights.push(spot);
        
        return spot;
    }

    setupControls() {
        this.controls = {
            moveForward: false,
            moveBackward: false,
            moveLeft: false,
            moveRight: false,
            yaw: 0,
            pitch: 0
        };
        
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    }

    setupRaycaster() {
        this.raycaster = new THREE.Raycaster();
    }

    async buildMuseum() {
        const room = this.rooms[this.currentRoom];
        
        // Premium floor with reflection
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: room.floorColor,
            roughness: 0.1,
            metalness: 0.3
        });
        
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: room.wallColor,
            roughness: 0.9,
            metalness: 0
        });
        
        // Reflective floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(room.width, room.depth),
            floorMaterial
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        floor.name = 'floor';
        this.scene.add(floor);
        
        // Ceiling
        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(room.width, room.depth),
            new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 1 })
        );
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = room.height;
        ceiling.name = 'ceiling';
        this.scene.add(ceiling);
        
        // Walls
        this.createWalls(room, wallMaterial);
        
        // Skylight
        this.createSkylight(room);
        
        // Benches
        this.createBenches();
        
        // Room portal markers
        this.createRoomPortals(room);
    }

    createWalls(room, material) {
        const wallHeight = room.height;
        
        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(room.width, wallHeight),
            material
        );
        backWall.position.set(0, wallHeight / 2, -room.depth / 2);
        backWall.receiveShadow = true;
        backWall.name = 'backWall';
        this.scene.add(backWall);
        
        // Front wall
        const frontWall = new THREE.Mesh(
            new THREE.PlaneGeometry(room.width, wallHeight),
            material
        );
        frontWall.position.set(0, wallHeight / 2, room.depth / 2);
        frontWall.rotation.y = Math.PI;
        frontWall.name = 'frontWall';
        this.scene.add(frontWall);
        
        // Side walls
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(room.depth, wallHeight),
            material
        );
        leftWall.position.set(-room.width / 2, wallHeight / 2, 0);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.receiveShadow = true;
        leftWall.name = 'leftWall';
        this.scene.add(leftWall);
        
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(room.depth, wallHeight),
            material
        );
        rightWall.position.set(room.width / 2, wallHeight / 2, 0);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.receiveShadow = true;
        rightWall.name = 'rightWall';
        this.scene.add(rightWall);
    }

    createSkylight(room) {
        const skylightGeometry = new THREE.BoxGeometry(8, 0.3, 8);
        const skylightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const skylight = new THREE.Mesh(skylightGeometry, skylightMaterial);
        skylight.position.set(0, room.height - 0.15, 0);
        this.scene.add(skylight);
        
        const skylightLight = new THREE.RectAreaLight(0xffffff, 2, 7, 7);
        skylightLight.position.set(0, room.height - 0.5, 0);
        skylightLight.rotation.x = -Math.PI / 2;
        this.scene.add(skylightLight);
    }

    createBenches() {
        const benchGeometry = new THREE.BoxGeometry(3, 0.5, 0.8);
        const benchMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.3,
            metalness: 0.6
        });
        
        const bench = new THREE.Mesh(benchGeometry, benchMaterial);
        bench.position.set(0, 0.25, 5);
        bench.castShadow = true;
        bench.receiveShadow = true;
        this.scene.add(bench);
    }

    createRoomPortals(room) {
        // Create subtle markers at room transitions
        const portalGeometry = new THREE.TorusGeometry(1, 0.05, 8, 24);
        const portalMaterial = new THREE.MeshStandardMaterial({
            color: 0x667eea,
            emissive: 0x667eea,
            emissiveIntensity: 0.3
        });
        
        // Portal to next room (symbolic)
        const portal = new THREE.Mesh(portalGeometry, portalMaterial);
        portal.position.set(room.width / 2 - 2, 1.5, 0);
        portal.rotation.y = Math.PI / 2;
        portal.userData = { type: 'portal', targetRoom: 'divinos' };
        this.scene.add(portal);
    }

    createDustParticles() {
        const particleCount = 500;
        const room = this.rooms[this.currentRoom];
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * room.width;
            positions[i * 3 + 1] = Math.random() * room.height;
            positions[i * 3 + 2] = (Math.random() - 0.5) * room.depth;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.02,
            transparent: true,
            opacity: 0.3
        });
        
        this.dustParticles = new THREE.Points(geometry, material);
        this.scene.add(this.dustParticles);
    }

    async loadArtworks() {
        try {
            const response = await fetch('/data/images-index.json');
            const images = await response.json();
            
            // Filter by current room theme
            this.artworks = this.filterArtworksByRoom(images, this.currentRoom);
            
            await this.placeArtworksOnWalls();
            
        } catch (error) {
            console.error('Error loading artworks:', error);
            this.createPlaceholderArtworks();
        }
    }

    filterArtworksByRoom(images, roomId) {
        if (roomId === 'main') {
            return images.slice(0, 20);
        }
        
        const keywords = {
            divinos: ['divino', 'vaiven', 'icono', 'madonna'],
            retratos: ['retrato', 'portrait', 'cara', 'rostro'],
            walking: ['walking', 'gallery', 'urbano', 'street']
        };
        
        const roomKeywords = keywords[roomId] || [];
        
        return images.filter(img => {
            const name = (img.albumName || '').toLowerCase();
            return roomKeywords.some(kw => name.includes(kw));
        }).slice(0, 15);
    }

    async placeArtworksOnWalls() {
        const room = this.rooms[this.currentRoom];
        const wallSpacing = 4;
        const artworkHeight = 1.6;
        
        // Back wall
        const backWallCount = Math.floor(room.width / wallSpacing) - 1;
        for (let i = 0; i < Math.min(backWallCount, this.artworks.length); i++) {
            const x = -room.width / 2 + wallSpacing + i * wallSpacing;
            const z = -room.depth / 2 + 0.1;
            await this.createArtworkFrame(this.artworks[i], x, artworkHeight, z, 0);
            
            // Add to tour
            this.tourPoints.push({ x, y: 1.7, z: z + 3 });
        }
        
        // Side walls
        let artIndex = backWallCount;
        const sideWallCount = Math.floor(room.depth / wallSpacing) - 2;
        
        // Left wall
        for (let i = 0; i < Math.min(sideWallCount, this.artworks.length - artIndex); i++) {
            const x = -room.width / 2 + 0.1;
            const z = -room.depth / 2 + wallSpacing * 2 + i * wallSpacing;
            await this.createArtworkFrame(this.artworks[artIndex + i], x, artworkHeight, z, Math.PI / 2);
        }
        
        artIndex += sideWallCount;
        
        // Right wall
        for (let i = 0; i < Math.min(sideWallCount, this.artworks.length - artIndex); i++) {
            const x = room.width / 2 - 0.1;
            const z = -room.depth / 2 + wallSpacing * 2 + i * wallSpacing;
            await this.createArtworkFrame(this.artworks[artIndex + i], x, artworkHeight, z, -Math.PI / 2);
        }
    }

    async createArtworkFrame(artwork, x, y, z, rotation) {
        const textureLoader = new THREE.TextureLoader();
        
        return new Promise((resolve) => {
            textureLoader.load(
                artwork.path,
                (texture) => {
                    const aspect = texture.image.width / texture.image.height;
                    const height = 1.5;
                    const width = height * aspect;
                    
                    // Frame
                    const frameDepth = 0.08;
                    const frameBorder = 0.05;
                    const frameGeometry = new THREE.BoxGeometry(
                        width + frameBorder * 2,
                        height + frameBorder * 2,
                        frameDepth
                    );
                    const frameMaterial = new THREE.MeshStandardMaterial({
                        color: 0x1a1a1a,
                        roughness: 0.3,
                        metalness: 0.7
                    });
                    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
                    
                    // Canvas with artwork
                    const canvasGeometry = new THREE.PlaneGeometry(width, height);
                    const canvasMaterial = new THREE.MeshStandardMaterial({
                        map: texture,
                        roughness: 0.8,
                        metalness: 0
                    });
                    const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
                    canvas.position.z = frameDepth / 2 + 0.001;
                    
                    // Group
                    const artworkGroup = new THREE.Group();
                    artworkGroup.add(frame);
                    artworkGroup.add(canvas);
                    artworkGroup.position.set(x, y, z);
                    artworkGroup.rotation.y = rotation;
                    
                    // Metadata
                    artworkGroup.userData = {
                        type: 'artwork',
                        data: artwork,
                        interactive: true,
                        originalPosition: { x, y, z }
                    };
                    
                    // Spotlight
                    this.createSpotlightForArtwork(
                        new THREE.Vector3(x, y, z),
                        new THREE.Vector3(x, y, z)
                    );
                    
                    this.scene.add(artworkGroup);
                    this.artworkMeshes.push(artworkGroup);
                    
                    resolve(artworkGroup);
                },
                undefined,
                () => resolve(null)
            );
        });
    }

    createPlaceholderArtworks() {
        const colors = [0x3498db, 0xe74c3c, 0x2ecc71, 0x9b59b6, 0xf39c12];
        const room = this.rooms[this.currentRoom];
        
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.PlaneGeometry(1.5, 1.2);
            const material = new THREE.MeshStandardMaterial({ color: colors[i] });
            const artwork = new THREE.Mesh(geometry, material);
            
            const x = -room.width / 2 + 4 + i * 5;
            artwork.position.set(x, 1.6, -room.depth / 2 + 0.1);
            
            artwork.userData = {
                type: 'artwork',
                data: { albumName: `Obra ${i + 1}`, path: '' },
                interactive: true
            };
            
            this.scene.add(artwork);
            this.artworkMeshes.push(artwork);
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.onResize());
        
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        this.renderer.domElement.addEventListener('click', (e) => this.onClick(e));
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        this.renderer.domElement.addEventListener('click', () => {
            if (!this.selectedArtwork && !this.isZooming) {
                this.renderer.domElement.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === this.renderer.domElement;
        });
        
        // UI buttons
        document.getElementById('museo-close')?.addEventListener('click', () => this.close());
        document.getElementById('museo-audio-toggle')?.addEventListener('click', () => this.toggleAudio());
        document.getElementById('museo-tour')?.addEventListener('click', () => this.startTour());
        document.querySelector('.panel-close')?.addEventListener('click', () => this.closeInfoPanel());
        document.querySelector('.zoom-close')?.addEventListener('click', () => this.exitZoom());
        
        // Room navigation
        document.querySelectorAll('.room-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchRoom(btn.dataset.room));
        });
    }

    onKeyDown(e) {
        if (this.isZooming) {
            if (e.code === 'Escape') this.exitZoom();
            return;
        }
        
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.controls.moveForward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.controls.moveBackward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.controls.moveLeft = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.controls.moveRight = true;
                break;
            case 'Escape':
                if (document.pointerLockElement) {
                    document.exitPointerLock();
                }
                break;
        }
    }

    onKeyUp(e) {
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.controls.moveForward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.controls.moveBackward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.controls.moveLeft = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.controls.moveRight = false;
                break;
        }
    }

    onMouseMove(e) {
        if (this.isZooming) return;
        
        if (this.pointerLocked) {
            this.euler.setFromQuaternion(this.camera.quaternion);
            this.euler.y -= e.movementX * this.lookSpeed;
            this.euler.x -= e.movementY * this.lookSpeed;
            this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
            this.camera.quaternion.setFromEuler(this.euler);
        }
        
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    onClick(e) {
        if (this.isZooming) return;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.artworkMeshes, true);
        
        if (intersects.length > 0) {
            let target = intersects[0].object;
            
            while (target && !target.userData?.type) {
                target = target.parent;
            }
            
            if (target?.userData?.type === 'artwork') {
                // Play click sound
                this.audioSystem?.playArtworkClick();
                
                // Dramatic zoom
                this.zoomToArtwork(target);
            }
        }
    }

    zoomToArtwork(artworkGroup) {
        this.isZooming = true;
        this.selectedArtwork = artworkGroup;
        this.originalCameraPos = this.camera.position.clone();
        
        document.exitPointerLock();
        document.getElementById('museo-zoom-overlay')?.classList.remove('hidden');
        
        // Calculate target position (in front of artwork)
        const pos = artworkGroup.userData.originalPosition;
        const distance = 2;
        
        // Get the artwork's forward direction based on rotation
        const rotY = artworkGroup.rotation.y;
        const targetX = pos.x + Math.sin(rotY) * distance;
        const targetZ = pos.z + Math.cos(rotY) * distance;
        
        // Animate camera to artwork
        this.zoomTarget = { x: targetX, y: 1.7, z: targetZ };
        this.animateZoom();
        
        // Show info panel after zoom
        setTimeout(() => {
            this.showArtworkInfo(artworkGroup.userData.data);
        }, 800);
    }

    animateZoom() {
        if (!this.isZooming || !this.zoomTarget) return;
        
        const speed = 0.05;
        this.camera.position.x += (this.zoomTarget.x - this.camera.position.x) * speed;
        this.camera.position.y += (this.zoomTarget.y - this.camera.position.y) * speed;
        this.camera.position.z += (this.zoomTarget.z - this.camera.position.z) * speed;
        
        // Look at artwork
        if (this.selectedArtwork) {
            const artPos = this.selectedArtwork.position;
            this.camera.lookAt(artPos.x, artPos.y, artPos.z);
        }
        
        const dist = Math.sqrt(
            Math.pow(this.camera.position.x - this.zoomTarget.x, 2) +
            Math.pow(this.camera.position.z - this.zoomTarget.z, 2)
        );
        
        if (dist > 0.1) {
            requestAnimationFrame(() => this.animateZoom());
        }
    }

    exitZoom() {
        if (!this.isZooming) return;
        
        this.isZooming = false;
        document.getElementById('museo-zoom-overlay')?.classList.add('hidden');
        this.closeInfoPanel();
        
        // Return to original position
        if (this.originalCameraPos) {
            const returnSpeed = 0.08;
            const animateReturn = () => {
                this.camera.position.x += (this.originalCameraPos.x - this.camera.position.x) * returnSpeed;
                this.camera.position.y += (this.originalCameraPos.y - this.camera.position.y) * returnSpeed;
                this.camera.position.z += (this.originalCameraPos.z - this.camera.position.z) * returnSpeed;
                
                const dist = this.camera.position.distanceTo(this.originalCameraPos);
                if (dist > 0.1) {
                    requestAnimationFrame(animateReturn);
                } else {
                    this.originalCameraPos = null;
                    this.selectedArtwork = null;
                    this.zoomTarget = null;
                }
            };
            animateReturn();
        }
    }

    showArtworkInfo(artwork) {
        const panel = document.getElementById('museo-info-panel');
        document.getElementById('panel-image').src = artwork.path;
        document.getElementById('panel-title').textContent = artwork.albumName || 'Sin título';
        document.getElementById('panel-description').textContent = artwork.description || 'Técnica mixta sobre lienzo';
        document.getElementById('panel-year').textContent = artwork.year || '2024';
        
        panel.classList.remove('hidden');
    }

    closeInfoPanel() {
        document.getElementById('museo-info-panel').classList.add('hidden');
    }

    toggleAudio() {
        if (this.audioSystem) {
            const muted = this.audioSystem.toggleMute();
            const btn = document.getElementById('museo-audio-toggle');
            btn.textContent = muted ? '🔇' : '🔊';
        }
    }

    startTour() {
        if (this.tourPoints.length === 0) return;
        
        this.tourActive = true;
        this.currentTourIndex = 0;
        document.getElementById('museo-tour').textContent = '⏹️ Detener Tour';
        
        this.moveCameraToTourPoint();
    }

    moveCameraToTourPoint() {
        if (!this.tourActive || this.currentTourIndex >= this.tourPoints.length) {
            this.stopTour();
            return;
        }
        
        const point = this.tourPoints[this.currentTourIndex];
        const speed = 0.02;
        
        const animateTour = () => {
            if (!this.tourActive) return;
            
            this.camera.position.x += (point.x - this.camera.position.x) * speed;
            this.camera.position.z += (point.z - this.camera.position.z) * speed;
            
            // Look forward
            const lookTarget = new THREE.Vector3(point.x, 1.7, point.z - 5);
            this.camera.lookAt(lookTarget);
            
            const dist = Math.sqrt(
                Math.pow(this.camera.position.x - point.x, 2) +
                Math.pow(this.camera.position.z - point.z, 2)
            );
            
            if (dist > 0.5) {
                requestAnimationFrame(animateTour);
            } else {
                // Move to next point after delay
                setTimeout(() => {
                    this.currentTourIndex++;
                    this.moveCameraToTourPoint();
                }, 3000);
            }
        };
        
        animateTour();
    }

    stopTour() {
        this.tourActive = false;
        document.getElementById('museo-tour').textContent = '🚶 Tour Guiado';
    }

    switchRoom(roomId) {
        if (!this.rooms[roomId] || roomId === this.currentRoom) return;
        
        // Fade out
        this.container.classList.add('room-transition');
        
        setTimeout(() => {
            // Clear current room
            this.clearRoom();
            
            // Switch room
            this.currentRoom = roomId;
            
            // Rebuild
            this.buildMuseum();
            this.loadArtworks();
            
            // Reset camera
            this.camera.position.set(0, 1.7, 15);
            
            // Fade in
            this.container.classList.remove('room-transition');
        }, 500);
        
        // Update UI
        document.querySelectorAll('.room-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.room === roomId);
        });
    }

    clearRoom() {
        // Remove artworks and decorations
        this.artworkMeshes.forEach(mesh => {
            this.scene.remove(mesh);
        });
        this.artworkMeshes = [];
        
        this.spotlights.forEach(spot => {
            this.scene.remove(spot);
            this.scene.remove(spot.target);
        });
        this.spotlights = [];
        
        // Remove structural elements
        ['floor', 'ceiling', 'backWall', 'frontWall', 'leftWall', 'rightWall'].forEach(name => {
            const obj = this.scene.getObjectByName(name);
            if (obj) this.scene.remove(obj);
        });
        
        // Remove dust
        if (this.dustParticles) {
            this.scene.remove(this.dustParticles);
        }
        
        this.tourPoints = [];
    }

    updateMovement() {
        if (this.isZooming || this.tourActive) return;
        
        const direction = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        this.camera.getWorldDirection(direction);
        direction.y = 0;
        direction.normalize();
        
        right.crossVectors(direction, new THREE.Vector3(0, 1, 0));
        
        let isMoving = false;
        
        if (this.controls.moveForward) {
            this.camera.position.addScaledVector(direction, this.moveSpeed);
            isMoving = true;
        }
        if (this.controls.moveBackward) {
            this.camera.position.addScaledVector(direction, -this.moveSpeed);
            isMoving = true;
        }
        if (this.controls.moveLeft) {
            this.camera.position.addScaledVector(right, -this.moveSpeed);
            isMoving = true;
        }
        if (this.controls.moveRight) {
            this.camera.position.addScaledVector(right, this.moveSpeed);
            isMoving = true;
        }
        
        // Play footstep sounds
        if (isMoving && this.audioSystem) {
            this.audioSystem.setWalking(true);
            this.audioSystem.updateWalkingSound();
        } else if (this.audioSystem) {
            this.audioSystem.setWalking(false);
        }
        
        // Room boundaries
        const room = this.rooms[this.currentRoom];
        const padding = 1;
        this.camera.position.x = Math.max(-room.width / 2 + padding, Math.min(room.width / 2 - padding, this.camera.position.x));
        this.camera.position.z = Math.max(-room.depth / 2 + padding, Math.min(room.depth / 2 - padding, this.camera.position.z));
    }

    updateDustParticles() {
        if (!this.dustParticles) return;
        
        const positions = this.dustParticles.geometry.attributes.position.array;
        const room = this.rooms[this.currentRoom];
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] -= 0.001; // Slow fall
            
            if (positions[i + 1] < 0) {
                positions[i + 1] = room.height;
            }
        }
        
        this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        this.updateMovement();
        this.updateHoverEffects();
        this.updateDustParticles();
        
        this.renderer.render(this.scene, this.camera);
    }

    updateHoverEffects() {
        if (this.isZooming) return;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.artworkMeshes, true);
        
        this.artworkMeshes.forEach(mesh => {
            if (mesh.children[0]) {
                mesh.children[0].material.emissive = new THREE.Color(0x000000);
            }
        });
        
        if (intersects.length > 0) {
            let target = intersects[0].object;
            while (target && !target.userData?.type) {
                target = target.parent;
            }
            if (target?.children?.[0]) {
                target.children[0].material.emissive = new THREE.Color(0x222222);
                document.body.style.cursor = 'pointer';
            }
        } else {
            document.body.style.cursor = 'default';
        }
    }

    hideLoadingScreen() {
        const loading = document.getElementById('museo-loading');
        loading?.classList.add('fade-out');
        setTimeout(() => loading?.remove(), 500);
        
        document.getElementById('museo-hud')?.classList.remove('hidden');
    }

    close() {
        cancelAnimationFrame(this.animationId);
        document.exitPointerLock();
        
        // Stop audio
        if (this.audioSystem) {
            this.audioSystem.stop();
        }
        
        this.container.classList.add('closing');
        
        setTimeout(() => {
            this.container.remove();
            document.body.style.overflow = '';
        }, 500);
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #museo-3d-container {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }
            
            #museo-3d-container.room-transition {
                opacity: 0;
                transition: opacity 0.5s ease;
            }
            
            #museo-3d-container.closing {
                opacity: 0;
                transition: opacity 0.5s ease;
            }
            
            .museo-loading {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
                z-index: 100;
                transition: opacity 0.5s ease;
            }
            
            .museo-loading.fade-out {
                opacity: 0;
                pointer-events: none;
            }
            
            .loading-content {
                text-align: center;
                color: white;
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid rgba(255,255,255,0.1);
                border-top-color: #D4AF37;
                border-radius: 50%;
                margin: 0 auto 20px;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .loading-content h2 {
                font-size: 1.5rem;
                font-weight: 300;
                margin-bottom: 10px;
                letter-spacing: 2px;
            }
            
            .loading-content p {
                font-size: 0.9rem;
                opacity: 0.7;
            }
            
            .museo-hud {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            
            .museo-hud.hidden {
                display: none;
            }
            
            .museo-btn-close,
            .museo-btn-audio,
            .museo-btn-tour {
                position: absolute;
                border: none;
                border-radius: 30px;
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                color: white;
                cursor: pointer;
                pointer-events: all;
                transition: all 0.3s ease;
            }
            
            .museo-btn-close {
                top: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                font-size: 24px;
            }
            
            .museo-btn-audio {
                top: 20px;
                right: 80px;
                width: 50px;
                height: 50px;
                font-size: 20px;
            }
            
            .museo-btn-tour {
                top: 20px;
                left: 20px;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: 600;
            }
            
            .museo-btn-close:hover,
            .museo-btn-audio:hover,
            .museo-btn-tour:hover {
                background: rgba(255,255,255,0.2);
                transform: scale(1.05);
            }
            
            .museo-room-nav {
                position: absolute;
                top: 80px;
                left: 20px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                pointer-events: all;
            }
            
            .room-btn {
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border: none;
                color: white;
                padding: 10px 16px;
                border-radius: 20px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: left;
            }
            
            .room-btn:hover,
            .room-btn.active {
                background: rgba(102, 126, 234, 0.5);
            }
            
            .museo-controls-hint {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 20px;
                color: rgba(255,255,255,0.6);
                font-size: 12px;
                pointer-events: none;
            }
            
            .museo-info-panel {
                position: absolute;
                bottom: 80px;
                right: 20px;
                width: 350px;
                background: rgba(20,20,20,0.95);
                backdrop-filter: blur(20px);
                border-radius: 16px;
                overflow: hidden;
                pointer-events: all;
                animation: slideInRight 0.4s ease;
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            .museo-info-panel.hidden {
                display: none;
            }
            
            .museo-info-panel .panel-close {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(255,255,255,0.1);
                border: none;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                z-index: 10;
            }
            
            .museo-info-panel img {
                width: 100%;
                height: 200px;
                object-fit: cover;
            }
            
            .museo-info-panel .panel-content {
                padding: 20px;
                color: white;
            }
            
            .museo-info-panel h2 {
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 10px;
            }
            
            .museo-info-panel p {
                font-size: 14px;
                opacity: 0.8;
                margin: 0 0 10px;
                line-height: 1.5;
            }
            
            .museo-info-panel span {
                font-size: 12px;
                opacity: 0.6;
            }
            
            .museo-zoom-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            
            .museo-zoom-overlay.hidden {
                display: none;
            }
            
            .museo-zoom-overlay .zoom-close {
                position: absolute;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border: none;
                color: white;
                padding: 16px 32px;
                border-radius: 30px;
                font-size: 16px;
                cursor: pointer;
                pointer-events: all;
                transition: all 0.3s ease;
            }
            
            .museo-zoom-overlay .zoom-close:hover {
                background: rgba(255,255,255,0.2);
            }
            
            @media (max-width: 768px) {
                .museo-room-nav {
                    top: auto;
                    bottom: 80px;
                    left: 10px;
                    right: 10px;
                    flex-direction: row;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                .museo-controls-hint {
                    display: none;
                }
                
                .museo-info-panel {
                    width: calc(100% - 40px);
                    left: 20px;
                    right: 20px;
                    bottom: 20px;
                    max-height: 40vh;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Global function to open museum
window.openMuseoVirtual = async function() {
    document.body.style.overflow = 'hidden';
    const museo = new MuseoVirtual3DV2();
    await museo.init();
    window.currentMuseo = museo;
};

// Legacy support
window.MuseoVirtual3D = MuseoVirtual3DV2;

console.log('🏛️ Museo Virtual 3D v2.0 loaded');
// v2.0.1 - 1769300134
// v2.0.1 - 1769300139
