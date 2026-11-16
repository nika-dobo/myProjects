/**
 * SoundShift Stage 3 & 4 - AAA Three.js 3D Engine & Graphics Core
 * Features ACESFilmic Tone Mapping, Volumetric Space Particles, Deep Space Nebulae,
 * Multi-part Astronaut Meshes with Reflective Visors, Spinning Reactor Core, and Pulsing 3D Wave Auras.
 */

class SoundShift3DWorld {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.localPlayerMesh = null;
    this.localAuraMesh = null;
    this.remotePlayers = new Map(); // socketId => { mesh, aura, textSprite, targetPos: {x,y,z}, targetRotY }

    this.isInitialized = false;
    this.animationFrameId = null;

    // Spherical Camera Orbit Parameters
    this.cameraRadius = 12.0;       // Camera distance from player
    this.cameraYaw = 0;             // Horizontal rotation angle (radians)
    this.cameraPitch = 0.65;        // Vertical pitch angle (radians, ~37 degrees)
    this.isRightMouseDown = false;
    this.prevMousePos = { x: 0, y: 0 };

    this.mySocketId = null;
    this.myRole = null;
  }

  /**
   * Initialize Three.js Scene, ACES Tone Mapping, Lighting, and Environment
   */
  init(mySocketId, myRole) {
    if (!this.container) return;
    this.mySocketId = mySocketId;
    this.myRole = myRole;

    this.container.innerHTML = '';

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene setup with deep space atmosphere and fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x040711);
    this.scene.fog = new THREE.FogExp2(0x040711, 0.02);

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    this.camera.position.set(0, 10, 12);

    // 3. AAA WebGL Renderer with ACESFilmic Tone Mapping and Soft Shadows
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting Setup
    this.setupLighting();

    // 5. Build 3D Station & Deep Space Background
    this.buildStationEnvironment();
    this.buildSpaceBackground();
    this.buildVolumetricParticles();

    // 6. Setup Mouse Drag Camera Controls
    this.setupCameraControls();

    window.addEventListener('resize', () => this.onWindowResize());

    this.isInitialized = true;
    console.log('[3DWorld] AAA Graphics Three.js Station World initialized.');

    this.animate();
  }

  /**
   * Setup Sci-Fi Dynamic Lighting
   */
  setupLighting() {
    const ambient = new THREE.AmbientLight(0x0f172a, 1.4);
    this.scene.add(ambient);

    // Main Overhead Station Spotlight
    const mainLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    mainLight.position.set(18, 30, 18);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 70;
    mainLight.shadow.camera.left = -30;
    mainLight.shadow.camera.right = 30;
    mainLight.shadow.camera.top = 30;
    mainLight.shadow.camera.bottom = -30;
    mainLight.shadow.bias = -0.0005;
    this.scene.add(mainLight);

    // Secondary Cyan Fill Light
    const fillLight = new THREE.PointLight(0x06b6d4, 4, 30);
    fillLight.position.set(-15, 8, -15);
    this.scene.add(fillLight);

    // Magenta Accent Light
    const accentLight = new THREE.PointLight(0xd946ef, 3, 25);
    accentLight.position.set(15, 6, -15);
    this.scene.add(accentLight);

    // Central Core Point Light
    this.coreLight = new THREE.PointLight(0x06b6d4, 5, 22);
    this.coreLight.position.set(0, 3.5, 0);
    this.scene.add(this.coreLight);
  }

  /**
   * Build 3D Station Environment (Metallic Floor, Grid, Central Core, Wall Panels)
   */
  buildStationEnvironment() {
    // 1. Metallic Floor with specular reflections
    const floorGeo = new THREE.PlaneGeometry(64, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.25,
      metalness: 0.85
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Neon Floor Grid
    const grid = new THREE.GridHelper(64, 32, 0x06b6d4, 0x1e293b);
    grid.position.y = 0.01;
    this.scene.add(grid);

    // 2. Central Reactor Core Structure
    const coreGroup = new THREE.Group();

    // Metallic Base Pedestal
    const baseGeo = new THREE.CylinderGeometry(3.2, 4.0, 1.0, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.5;
    base.castShadow = true;
    base.receiveShadow = true;
    coreGroup.add(base);

    // Energy Core Glass Cylinder
    const coreGeo = new THREE.CylinderGeometry(1.4, 1.4, 4.0, 32);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 2.5;
    coreGroup.add(coreMesh);

    // Rotating Outer Neon Plasma Rings
    const ring1Geo = new THREE.TorusGeometry(2.5, 0.1, 16, 64);
    const ringMat1 = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.5 });
    this.ring1 = new THREE.Mesh(ring1Geo, ringMat1);
    this.ring1.position.y = 2.5;
    this.ring1.rotation.x = Math.PI / 3;
    coreGroup.add(this.ring1);

    const ring2Geo = new THREE.TorusGeometry(2.5, 0.1, 16, 64);
    const ringMat2 = new THREE.MeshStandardMaterial({ color: 0xd946ef, emissive: 0xd946ef, emissiveIntensity: 1.5 });
    this.ring2 = new THREE.Mesh(ring2Geo, ringMat2);
    this.ring2.position.y = 2.5;
    this.ring2.rotation.x = -Math.PI / 3;
    coreGroup.add(this.ring2);

    this.scene.add(coreGroup);

    this.buildStationWalls();
  }

  /**
   * Build Sci-Fi Perimeter Walls & Neon Strips
   */
  buildStationWalls() {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
    const stripMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 1.2 });

    const wallHeight = 5;
    const size = 64;

    const wallsData = [
      { x: 0, z: -size / 2, w: size, d: 1 },
      { x: 0, z: size / 2, w: size, d: 1 },
      { x: -size / 2, z: 0, w: 1, d: size },
      { x: size / 2, z: 0, w: 1, d: size }
    ];

    wallsData.forEach(data => {
      const geo = new THREE.BoxGeometry(data.w, wallHeight, data.d);
      const wall = new THREE.Mesh(geo, wallMat);
      wall.position.set(data.x, wallHeight / 2, data.z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.scene.add(wall);

      const stripGeo = new THREE.BoxGeometry(data.w, 0.15, data.d);
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(data.x, wallHeight + 0.08, data.z);
      this.scene.add(strip);
    });
  }

  /**
   * Build Deep Space Background (Distant Stars)
   */
  buildSpaceBackground() {
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 800;
    const positions = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 200;
      positions[i + 1] = Math.random() * 80 + 10;
      positions[i + 2] = (Math.random() - 0.5) * 200;
    }

    starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0.8 });
    const starField = new THREE.Points(starsGeo, starsMat);
    this.scene.add(starField);
  }

  /**
   * Build Volumetric Dust/Spark Particles inside Station
   */
  buildVolumetricParticles() {
    const particleGeo = new THREE.BufferGeometry();
    const count = 300;
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 50;
      pos[i + 1] = Math.random() * 6;
      pos[i + 2] = (Math.random() - 0.5) * 50;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.35,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    this.particles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.particles);
  }

  /**
   * Setup Mouse Drag Camera Rotation and Scroll Zoom
   */
  setupCameraControls() {
    this.container.addEventListener('contextmenu', (e) => e.preventDefault());

    this.container.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        this.isRightMouseDown = true;
        this.prevMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.isRightMouseDown = false;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isRightMouseDown) {
        const deltaX = e.clientX - this.prevMousePos.x;
        const deltaY = e.clientY - this.prevMousePos.y;
        this.prevMousePos = { x: e.clientX, y: e.clientY };

        this.cameraYaw += deltaX * 0.005;
        this.cameraPitch = Math.max(0.15, Math.min(Math.PI / 2.1, this.cameraPitch - deltaY * 0.005));
      }
    });

    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.cameraRadius = Math.max(4.0, Math.min(25.0, this.cameraRadius + e.deltaY * 0.01));
    }, { passive: false });
  }

  /**
   * Create High-Detail 3D Astronaut Player Mesh
   */
  createPlayerMesh(nickname, role, isLocal = false) {
    const playerGroup = new THREE.Group();

    const isTraitor = (role === 'NOISE');
    const primaryColor = isTraitor ? 0xef4444 : 0x06b6d4;

    // 1. Astronaut Suit Body
    const bodyGeo = new THREE.CylinderGeometry(0.55, 0.6, 1.4, 24);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: isLocal ? 0x2563eb : 0x334155,
      metalness: 0.7,
      roughness: 0.25
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.7;
    body.castShadow = true;
    body.receiveShadow = true;
    playerGroup.add(body);

    // Oxygen Tank Backpack
    const tankGeo = new THREE.BoxGeometry(0.6, 0.8, 0.4);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(0, 0.8, -0.45);
    tank.castShadow = true;
    playerGroup.add(tank);

    // 2. Helmet with Curved Reflective Visor
    const headGeo = new THREE.SphereGeometry(0.45, 24, 24);
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: primaryColor,
      emissive: primaryColor,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.95,
      clearcoat: 1.0
    });
    const head = new THREE.Mesh(headGeo, visorMat);
    head.position.set(0, 1.45, 0.08);
    playerGroup.add(head);

    // Direction Nose Cone Pointer
    const noseGeo = new THREE.ConeGeometry(0.12, 0.35, 12);
    const nose = new THREE.Mesh(noseGeo, visorMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 1.45, 0.52);
    playerGroup.add(nose);

    // 3. Dynamic Pulsing Sound Wave Aura Sphere
    const auraGeo = new THREE.SphereGeometry(1.3, 20, 20);
    const auraMat = new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    auraMesh.position.y = 1.0;
    playerGroup.add(auraMesh);

    // 4. Overhead Name Badge Sprite
    const textSprite = this.createNicknameSprite(nickname, primaryColor);
    textSprite.position.set(0, 2.3, 0);
    playerGroup.add(textSprite);

    this.scene.add(playerGroup);

    return {
      group: playerGroup,
      aura: auraMesh,
      textSprite: textSprite
    };
  }

  /**
   * Create 2D Canvas Text Sprite floating above player head
   */
  createNicknameSprite(nickname, textColorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect ? ctx.roundRect(8, 8, 240, 48, 12) : ctx.fillRect(8, 8, 240, 48);
    ctx.fill();

    ctx.strokeStyle = `#${textColorHex.toString(16).padStart(6, '0')}`;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 22px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nickname, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.4, 0.6, 1.0);
    return sprite;
  }

  /**
   * Spawn Local Player Mesh
   */
  spawnLocalPlayer(x, y, z, rotationY, nickname, role) {
    const spawned = this.createPlayerMesh(nickname, role, true);
    this.localPlayerMesh = spawned.group;
    this.localAuraMesh = spawned.aura;
    this.localPlayerMesh.position.set(x, 0, z);
    this.localPlayerMesh.rotation.y = rotationY;
  }

  /**
   * Spawn or Update Remote Player Mesh
   */
  updateRemotePlayer(socketId, x, y, z, rotationY, nickname, role) {
    if (socketId === this.mySocketId) return;

    if (!this.remotePlayers.has(socketId)) {
      const spawned = this.createPlayerMesh(nickname || 'Operator', role || 'OPERATOR', false);
      spawned.group.position.set(x, 0, z);
      spawned.group.rotation.y = rotationY;

      this.remotePlayers.set(socketId, {
        mesh: spawned.group,
        aura: spawned.aura,
        textSprite: spawned.textSprite,
        targetPos: { x, y: 0, z },
        targetRotY: rotationY,
        nickname,
        role
      });
    } else {
      const remote = this.remotePlayers.get(socketId);
      remote.targetPos = { x, y: 0, z };
      remote.targetRotY = rotationY;
    }
  }

  /**
   * Update Local Player Position & Spherical Camera Orbit
   */
  updateLocalPlayerPosition(x, y, z, rotationY) {
    if (!this.localPlayerMesh) return;

    this.localPlayerMesh.position.set(x, 0, z);
    this.localPlayerMesh.rotation.y = rotationY;

    const camX = this.cameraRadius * Math.sin(this.cameraPitch) * Math.sin(this.cameraYaw);
    const camY = this.cameraRadius * Math.cos(this.cameraPitch);
    const camZ = this.cameraRadius * Math.sin(this.cameraPitch) * Math.cos(this.cameraYaw);

    const targetCamPos = new THREE.Vector3(x + camX, (y || 1.6) + camY, z + camZ);
    this.camera.position.lerp(targetCamPos, 0.2);

    const targetLookAt = new THREE.Vector3(x, (y || 1.6), z);
    this.camera.lookAt(targetLookAt);
  }

  /**
   * Main Render and Animation Loop
   */
  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    if (!this.isInitialized || !this.renderer || !this.scene || !this.camera) return;

    if (this.ring1) this.ring1.rotation.z += 0.01;
    if (this.ring2) this.ring2.rotation.z -= 0.015;

    // Slowly drift volumetric particles
    if (this.particles) {
      this.particles.rotation.y += 0.0008;
    }

    if (this.localAuraMesh && window.soundShiftAudio) {
      const micLevel = window.soundShiftAudio.getMicLevel();
      const scale = 1.0 + (micLevel / 100) * 1.8;
      this.localAuraMesh.scale.set(scale, scale, scale);
      this.localAuraMesh.material.opacity = 0.2 + (micLevel / 100) * 0.5;
    }

    this.remotePlayers.forEach((remote) => {
      if (remote.mesh) {
        remote.mesh.position.x += (remote.targetPos.x - remote.mesh.position.x) * 0.2;
        remote.mesh.position.z += (remote.targetPos.z - remote.mesh.position.z) * 0.2;
        remote.mesh.rotation.y += (remote.targetRotY - remote.mesh.rotation.y) * 0.2;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Handle Window / Viewport Resize for Fullscreen Mode
   */
  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

// Global 3D World Instance
window.soundShift3D = new SoundShift3DWorld('game-canvas-container');
