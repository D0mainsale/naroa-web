/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MUSEO VIRTUAL 3D - Galería Inmersiva Three.js
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Experiencia de museo virtual donde el usuario puede:
 * - Caminar en primera persona por salas de exposición
 * - Ver las obras de arte en paredes con iluminación dramática
 * - Interactuar con cuadros para ver detalles
 * - Navegar entre diferentes salas temáticas
 * 
 * Inspirado en: MoMA Virtual, Louvre Online, Google Arts & Culture
 * ═══════════════════════════════════════════════════════════════════════════════
 */

class MuseoVirtual3D {
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
        
        // Configuración de salas
        this.rooms = {
            main: { width: 30, depth: 40, height: 8 },
            retratos: { width: 20, depth: 25, height: 6 },
            abstracto: { width: 25, depth: 25, height: 7 }
        };
    }

    async init() {
        console.log('🏛️ Inicializando Museo Virtual 3D...');
        
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
        
        this.bindEvents();
        this.animate();
        
        this.isLoading = false;
        this.hideLoadingScreen();
        
        console.log('🏛️ Museo Virtual 3D listo!');
    }

    async loadThreeJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = () => {
                console.log('✅ Three.js cargado');
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    createContainer() {
        // Crear contenedor principal
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
        
        // Loading screen
        this.container.innerHTML = `
            <div id="museo-loading" class="museo-loading">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <h2>Entrando al Museo Virtual</h2>
                    <p>Cargando obras de arte...</p>
                </div>
            </div>
            <div id="museo-hud" class="museo-hud hidden">
                <button id="museo-close" class="museo-btn-close">✕</button>
                <div class="museo-controls-hint">
                    <span>WASD / Flechas para moverte</span>
                    <span>Mouse para mirar</span>
                    <span>Click en obra para detalles</span>
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
        `;
        
        this.injectStyles();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.015);
    }

    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);
        this.camera.position.set(0, 1.7, 15); // Altura de ojos humanos
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
        // Luz ambiente muy tenue
        const ambient = new THREE.AmbientLight(0xffffff, 0.1);
        this.scene.add(ambient);
        
        // Luz hemisférica para ambiente general
        const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
        hemi.position.set(0, 20, 0);
        this.scene.add(hemi);
        
        // Luz principal desde arriba (simula claraboya)
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
        // Control manual de primera persona
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
        
        // Materiales premium
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.1,
            metalness: 0.3
        });
        
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5f5f5,
            roughness: 0.9,
            metalness: 0
        });
        
        // Suelo reflectante
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(room.width, room.depth),
            floorMaterial
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Techo
        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(room.width, room.depth),
            new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 1 })
        );
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = room.height;
        this.scene.add(ceiling);
        
        // Paredes
        this.createWalls(room, wallMaterial);
        
        // Claraboya decorativa
        this.createSkylight(room);
        
        // Bancos del museo
        this.createBenches();
    }

    createWalls(room, material) {
        const wallHeight = room.height;
        
        // Pared trasera
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(room.width, wallHeight),
            material
        );
        backWall.position.set(0, wallHeight / 2, -room.depth / 2);
        backWall.receiveShadow = true;
        this.scene.add(backWall);
        
        // Pared frontal (con entrada)
        const frontWall = new THREE.Mesh(
            new THREE.PlaneGeometry(room.width, wallHeight),
            material
        );
        frontWall.position.set(0, wallHeight / 2, room.depth / 2);
        frontWall.rotation.y = Math.PI;
        this.scene.add(frontWall);
        
        // Paredes laterales
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(room.depth, wallHeight),
            material
        );
        leftWall.position.set(-room.width / 2, wallHeight / 2, 0);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);
        
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(room.depth, wallHeight),
            material
        );
        rightWall.position.set(room.width / 2, wallHeight / 2, 0);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);
    }

    createSkylight(room) {
        // Marco de claraboya
        const skylightGeometry = new THREE.BoxGeometry(8, 0.3, 8);
        const skylightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const skylight = new THREE.Mesh(skylightGeometry, skylightMaterial);
        skylight.position.set(0, room.height - 0.15, 0);
        this.scene.add(skylight);
        
        // Luz del skylight
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
        
        // Banco central
        const bench = new THREE.Mesh(benchGeometry, benchMaterial);
        bench.position.set(0, 0.25, 5);
        bench.castShadow = true;
        bench.receiveShadow = true;
        this.scene.add(bench);
    }

    async loadArtworks() {
        try {
            // Cargar índice de imágenes
            const response = await fetch('/data/images-index.json');
            const images = await response.json();
            
            // Seleccionar obras para el museo (máximo 20)
            this.artworks = images.slice(0, 20);
            
            // Distribuir obras en las paredes
            await this.placeArtworksOnWalls();
            
        } catch (error) {
            console.error('Error cargando obras:', error);
            // Usar obras de ejemplo
            this.createPlaceholderArtworks();
        }
    }

    async placeArtworksOnWalls() {
        const room = this.rooms[this.currentRoom];
        const wallSpacing = 4; // Espacio entre obras
        const artworkHeight = 1.6; // Altura del centro de la obra
        
        // Distribuir en pared trasera
        const backWallCount = Math.floor(room.width / wallSpacing) - 1;
        for (let i = 0; i < Math.min(backWallCount, this.artworks.length); i++) {
            const x = -room.width / 2 + wallSpacing + i * wallSpacing;
            const z = -room.depth / 2 + 0.1;
            await this.createArtworkFrame(this.artworks[i], x, artworkHeight, z, 0);
        }
        
        // Distribuir en paredes laterales
        let artIndex = backWallCount;
        const sideWallCount = Math.floor(room.depth / wallSpacing) - 2;
        
        // Pared izquierda
        for (let i = 0; i < Math.min(sideWallCount, this.artworks.length - artIndex); i++) {
            const x = -room.width / 2 + 0.1;
            const z = -room.depth / 2 + wallSpacing * 2 + i * wallSpacing;
            await this.createArtworkFrame(this.artworks[artIndex + i], x, artworkHeight, z, Math.PI / 2);
        }
        
        artIndex += sideWallCount;
        
        // Pared derecha
        for (let i = 0; i < Math.min(sideWallCount, this.artworks.length - artIndex); i++) {
            const x = room.width / 2 - 0.1;
            const z = -room.depth / 2 + wallSpacing * 2 + i * wallSpacing;
            await this.createArtworkFrame(this.artworks[artIndex + i], x, artworkHeight, z, -Math.PI / 2);
        }
    }

    async createArtworkFrame(artwork, x, y, z, rotation) {
        // Cargar textura de la imagen
        const textureLoader = new THREE.TextureLoader();
        
        return new Promise((resolve) => {
            textureLoader.load(
                artwork.path,
                (texture) => {
                    // Calcular aspecto
                    const aspect = texture.image.width / texture.image.height;
                    const height = 1.5;
                    const width = height * aspect;
                    
                    // Marco
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
                    
                    // Lienzo con la obra
                    const canvasGeometry = new THREE.PlaneGeometry(width, height);
                    const canvasMaterial = new THREE.MeshStandardMaterial({
                        map: texture,
                        roughness: 0.8,
                        metalness: 0
                    });
                    const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
                    canvas.position.z = frameDepth / 2 + 0.001;
                    
                    // Grupo
                    const artworkGroup = new THREE.Group();
                    artworkGroup.add(frame);
                    artworkGroup.add(canvas);
                    artworkGroup.position.set(x, y, z);
                    artworkGroup.rotation.y = rotation;
                    
                    // Metadata
                    artworkGroup.userData = {
                        type: 'artwork',
                        data: artwork,
                        interactive: true
                    };
                    
                    // Spotlight para esta obra
                    this.createSpotlightForArtwork(
                        new THREE.Vector3(x, y, z),
                        new THREE.Vector3(x, y, z)
                    );
                    
                    this.scene.add(artworkGroup);
                    this.artworkMeshes.push(artworkGroup);
                    
                    resolve(artworkGroup);
                },
                undefined,
                () => {
                    // Error - crear placeholder
                    resolve(null);
                }
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
        // Resize
        window.addEventListener('resize', () => this.onResize());
        
        // Keyboard
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mouse
        this.renderer.domElement.addEventListener('click', (e) => this.onClick(e));
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // Lock pointer for camera control
        this.renderer.domElement.addEventListener('click', () => {
            if (!this.selectedArtwork) {
                this.renderer.domElement.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === this.renderer.domElement;
        });
        
        // Close button
        document.getElementById('museo-close')?.addEventListener('click', () => this.close());
        
        // Panel close
        document.querySelector('.panel-close')?.addEventListener('click', () => this.closeInfoPanel());
    }

    onKeyDown(e) {
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
        if (this.pointerLocked) {
            this.euler.setFromQuaternion(this.camera.quaternion);
            this.euler.y -= e.movementX * this.lookSpeed;
            this.euler.x -= e.movementY * this.lookSpeed;
            this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
            this.camera.quaternion.setFromEuler(this.euler);
        }
        
        // Update mouse for raycaster
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    onClick(e) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.artworkMeshes, true);
        
        if (intersects.length > 0) {
            let target = intersects[0].object;
            
            // Buscar el grupo padre con userData
            while (target && !target.userData?.type) {
                target = target.parent;
            }
            
            if (target?.userData?.type === 'artwork') {
                this.showArtworkInfo(target.userData.data);
            }
        }
    }

    showArtworkInfo(artwork) {
        const panel = document.getElementById('museo-info-panel');
        document.getElementById('panel-image').src = artwork.path;
        document.getElementById('panel-title').textContent = artwork.albumName || 'Sin título';
        document.getElementById('panel-description').textContent = artwork.description || 'Técnica mixta sobre lienzo';
        document.getElementById('panel-year').textContent = artwork.year || '2024';
        
        panel.classList.remove('hidden');
        this.selectedArtwork = artwork;
        document.exitPointerLock();
    }

    closeInfoPanel() {
        document.getElementById('museo-info-panel').classList.add('hidden');
        this.selectedArtwork = null;
    }

    updateMovement() {
        const direction = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        this.camera.getWorldDirection(direction);
        direction.y = 0;
        direction.normalize();
        
        right.crossVectors(direction, new THREE.Vector3(0, 1, 0));
        
        if (this.controls.moveForward) {
            this.camera.position.addScaledVector(direction, this.moveSpeed);
        }
        if (this.controls.moveBackward) {
            this.camera.position.addScaledVector(direction, -this.moveSpeed);
        }
        if (this.controls.moveLeft) {
            this.camera.position.addScaledVector(right, -this.moveSpeed);
        }
        if (this.controls.moveRight) {
            this.camera.position.addScaledVector(right, this.moveSpeed);
        }
        
        // Limitar a los límites del museo
        const room = this.rooms[this.currentRoom];
        const padding = 1;
        this.camera.position.x = Math.max(-room.width / 2 + padding, Math.min(room.width / 2 - padding, this.camera.position.x));
        this.camera.position.z = Math.max(-room.depth / 2 + padding, Math.min(room.depth / 2 - padding, this.camera.position.z));
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        this.updateMovement();
        
        // Hover effect en obras
        this.updateHoverEffects();
        
        this.renderer.render(this.scene, this.camera);
    }

    updateHoverEffects() {
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
            
            .museo-btn-close {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border: none;
                border-radius: 50%;
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                color: white;
                font-size: 24px;
                cursor: pointer;
                pointer-events: all;
                transition: all 0.3s ease;
            }
            
            .museo-btn-close:hover {
                background: rgba(255,255,255,0.2);
                transform: scale(1.1);
            }
            
            .museo-controls-hint {
                position: absolute;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 20px;
                background: rgba(0,0,0,0.6);
                backdrop-filter: blur(10px);
                padding: 12px 24px;
                border-radius: 30px;
                color: white;
                font-size: 0.85rem;
                pointer-events: all;
            }
            
            .museo-controls-hint span {
                opacity: 0.8;
            }
            
            .museo-info-panel {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 500px;
                background: rgba(20,20,20,0.95);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                overflow: hidden;
                color: white;
                box-shadow: 0 25px 80px rgba(0,0,0,0.5);
                pointer-events: all;
                animation: panelSlideIn 0.4s ease;
            }
            
            .museo-info-panel.hidden {
                display: none;
            }
            
            @keyframes panelSlideIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -45%);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }
            
            .museo-info-panel .panel-close {
                position: absolute;
                top: 15px;
                right: 15px;
                width: 36px;
                height: 36px;
                border: none;
                border-radius: 50%;
                background: rgba(255,255,255,0.1);
                color: white;
                font-size: 18px;
                cursor: pointer;
                z-index: 10;
                transition: all 0.3s ease;
            }
            
            .museo-info-panel .panel-close:hover {
                background: rgba(255,255,255,0.2);
            }
            
            .museo-info-panel img {
                width: 100%;
                height: 300px;
                object-fit: cover;
            }
            
            .museo-info-panel .panel-content {
                padding: 25px;
            }
            
            .museo-info-panel h2 {
                font-size: 1.5rem;
                font-weight: 500;
                margin-bottom: 10px;
                color: #D4AF37;
            }
            
            .museo-info-panel p {
                font-size: 1rem;
                line-height: 1.6;
                opacity: 0.8;
                margin-bottom: 15px;
            }
            
            .museo-info-panel span {
                font-size: 0.85rem;
                opacity: 0.6;
            }
            
            #museo-3d-container.closing {
                animation: fadeOut 0.5s ease forwards;
            }
            
            @keyframes fadeOut {
                to {
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Factory function para iniciar el museo
function openMuseoVirtual() {
    const museo = new MuseoVirtual3D();
    museo.init();
    return museo;
}

// Exponer globalmente
window.MuseoVirtual3D = MuseoVirtual3D;
window.openMuseoVirtual = openMuseoVirtual;

console.log('🏛️ Museo Virtual 3D module loaded. Use openMuseoVirtual() to start.');
