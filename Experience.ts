import * as THREE from 'three';
import { AudioEngine } from './AudioEngine';

export class Experience {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private material: THREE.ShaderMaterial;
  private audioEngine: AudioEngine;
  private reqId: number;
  private currentTransition: number = 0;
  private targetTransition: number = 0;

  constructor(canvas: HTMLCanvasElement, audioEngine: AudioEngine) {
    this.canvas = canvas;
    this.audioEngine = audioEngine;

    // 1. Scene Initialization - Pure Primordial Black
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // 2. Cosmic Scale PerspectiveCamera
    // Large FOV (75) and deep far clipping plane for vastness
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
    this.camera.position.set(0, 15, 60);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Strict Chiaroscuro Lighting (No AmbientLight)
    // Primary Key Light with harsh deep shadow casting
    const keyLight = new THREE.DirectionalLight(0xffffff, 5.0);
    keyLight.position.set(200, 300, 150);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 4096;
    keyLight.shadow.mapSize.height = 4096;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 1000;
    // Tighter orthographic camera bounds for sharper shadow map focus on the center
    keyLight.shadow.camera.left = -200;
    keyLight.shadow.camera.right = 200;
    keyLight.shadow.camera.top = 200;
    keyLight.shadow.camera.bottom = -200;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Subtle, cool Rim Light for architectural edges in the void
    const rimLight = new THREE.DirectionalLight(0x5588ff, 1.5);
    rimLight.position.set(-200, 50, -100);
    rimLight.castShadow = true;
    this.scene.add(rimLight);

    // 5. Abstract Geometric Setup: Vast Plane Topology
    // Creating a high-density plane for the displacement shader.
    // 400x400 units with 400x400 segments = 1 unit per segment. Very high res.
    const geometry = new THREE.PlaneGeometry(400, 400, 400, 400);
    geometry.rotateX(-Math.PI / 2);

    // Master GLSL Shader Material: Chaos to Mathematical Order
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_audioData: { value: 0 },
        u_transition: { value: 0 },
        u_cameraPos: { value: new THREE.Vector3() },
        u_keyLightDir: { value: keyLight.position.clone().normalize() },
        u_keyLightColor: { value: new THREE.Vector3(1.0, 0.95, 0.9) },
        u_rimLightDir: { value: rimLight.position.clone().normalize() },
        u_rimLightColor: { value: new THREE.Vector3(0.3, 0.5, 1.0) }
      },
      vertexShader: `
        uniform float u_time;
        uniform float u_audioData;
        uniform float u_transition;

        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        // --- Simplex 3D Noise -- Ashima Arts ---
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2  C = vec2(1.0/6.0, 1.0/3.0);
          const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);

          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;

          i = mod289(i);
          vec4 p = permute(permute(permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0));

          float n_ = 0.142857142857;
          vec3  ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_ );

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        vec3 getDisplacedPosition(vec3 p) {
            // --- 1. Chaos State (Primordial Plasma/Liquid Metal) ---
            float scale = 0.015;
            // Base organic structure moving with time
            float noiseVal = snoise(vec3(p.x * scale, p.z * scale, u_time * 0.15));
            
            // Higher frequency detail for turbulence
            float noiseHigh = snoise(vec3(p.x * 0.05, p.z * 0.05, u_time * 0.3));
            
            // Modulation based on audio (Synesthesia effect!)
            float amplitude = 12.0 + (u_audioData * 20.0);
            vec3 chaosPos = p;
            chaosPos.y += noiseVal * amplitude;
            chaosPos.y += noiseHigh * (u_audioData * 10.0);

            // --- 2. Order State (Brutalist Mathematical Grid) ---
            float gridSize = 6.0;
            vec3 orderPos = p;
            
            // Snap X and Z to strict grid tiles
            orderPos.x = floor(p.x / gridSize) * gridSize + (gridSize * 0.5);
            orderPos.z = floor(p.z / gridSize) * gridSize + (gridSize * 0.5);
            
            // Create geometric pillars based on deterministic spatial noise
            float pillarNoise = snoise(vec3(orderPos.x * 0.02, orderPos.z * 0.02, 0.0));
            // Step the pillar heights strictly
            float pillarHeight = floor((pillarNoise * 24.0) / 4.0) * 4.0;
            
            // Apply a secondary geometric checkerboard pattern 
            float checker = mod(floor(orderPos.x / gridSize) + floor(orderPos.z / gridSize), 2.0);
            orderPos.y = pillarHeight + (checker * 2.5);

            // --- 3. Interpolation between Chaos and Order ---
            // A cubic hermite interpolation for the snap
            float t = smoothstep(0.0, 1.0, u_transition);
            
            // By doing the mix, the organic waves literally snap into brutalist pillars!
            return mix(chaosPos, orderPos, t);
        }

        void main() {
            vec3 pos = position;
            
            // Dynamically calculate normals using central difference on the displaced surface
            float eps = 0.5; // Sampling distance for normal derivation
            vec3 currentPos = getDisplacedPosition(pos);
            vec3 posDX = getDisplacedPosition(pos + vec3(eps, 0.0, 0.0));
            vec3 posDZ = getDisplacedPosition(pos + vec3(0.0, 0.0, eps));
            
            vec3 tangentX = posDX - currentPos;
            vec3 tangentZ = posDZ - currentPos;
            
            // Normal vector perpendicular to the surface at this vertex
            vec3 localNormal = normalize(cross(tangentZ, tangentX));

            // World-space transforms
            vec4 worldPos = modelMatrix * vec4(currentPos, 1.0);
            
            vWorldPosition = worldPos.xyz;
            // Transform normal to world space natively to react with our directional lights
            vNormal = normalize(mat3(modelMatrix) * localNormal);
            
            gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 u_cameraPos;
        uniform vec3 u_keyLightDir;
        uniform vec3 u_keyLightColor;
        uniform vec3 u_rimLightDir;
        uniform vec3 u_rimLightColor;
        uniform float u_transition;

        varying vec3 vNormal;
        varying vec3 vWorldPosition;

        void main() {
            vec3 normal = normalize(vNormal);
            // Recompute view vector fragment-side for high precision reflections
            vec3 viewDir = normalize(u_cameraPos - vWorldPosition);
            
            // Material Properties: Deep Obsidian / Liquid Metal
            vec3 baseColorChaos = vec3(0.01, 0.01, 0.015); // Almost pure void, slight cool tint
            vec3 baseColorOrder = vec3(0.02, 0.02, 0.02); // Cold brutalist grey
            vec3 albedo = mix(baseColorChaos, baseColorOrder, u_transition);
            
            float metallic = 1.0;
            // Order state is highly polished (sharper specular), Chaos is slightly rougher
            float baseGloss = mix(64.0, 256.0, u_transition); 
            
            // --- FRESNEL EFFECT ---
            // High reflection at grazing angles for that liquid metal/obsidian edge
            vec3 f0 = vec3(0.04); 
            f0 = mix(f0, albedo, metallic);
            float cosTheta = max(dot(normal, viewDir), 0.0);
            vec3 fresnel = f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0);

            // --- KEY LIGHT (Harsh Incident Lighting) ---
            vec3 keyDir = normalize(u_keyLightDir);
            float diffKey = max(dot(normal, keyDir), 0.0);
            
            // Stylized brutalist shading: amplify contrast, crush mid-tones
            diffKey = smoothstep(0.05, 0.8, diffKey);
            
            vec3 halfKey = normalize(keyDir + viewDir);
            float specKey = pow(max(dot(normal, halfKey), 0.0), baseGloss);
            
            // --- RIM LIGHT (Cool ambient architectural definition) ---
            vec3 rimDir = normalize(u_rimLightDir);
            float diffRim = max(dot(normal, rimDir), 0.0);
            vec3 halfRim = normalize(rimDir + viewDir);
            float specRim = pow(max(dot(normal, halfRim), 0.0), baseGloss * 0.5);
            
            // Combine lighting (Strict Chiaroscuro: 0 Ambient Light)
            vec3 finalLight = vec3(0.0);
            
            // Key light contribution (diffuse + harsh specular + fresnel)
            finalLight += u_keyLightColor * diffKey * albedo;
            finalLight += u_keyLightColor * specKey * fresnel * 6.0; 
            
            // Rim light contribution
            finalLight += u_rimLightColor * diffRim * albedo * 0.3;
            // The rim light hits the edges intensely due to fresnel
            finalLight += u_rimLightColor * specRim * fresnel * 3.0;
            
            // Final tone mapping (Exposure & Gamma)
            vec3 color = vec3(1.0) - exp(-finalLight * 2.0); // exposure boost
            color = pow(color, vec3(1.0 / 2.2));
            
            gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide
    });

    const plane = new THREE.Mesh(geometry, this.material);
    // Standard three shadow maps wouldn't apply precisely to vertex displacement
    // unless mapped specifically, but our Chiaroscuro implementation fakes it.
    this.scene.add(plane);

    // Bind event handlers properly
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    // Initialize bounds once
    this.onResize();

    // Start render loop
    this.reqId = requestAnimationFrame(this.tick.bind(this));
  }

  public setTransition(progress: number) {
    this.targetTransition = Math.max(0, Math.min(1, progress));
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private tick(time: number) {
    const clockTime = time * 0.001; // Seconds

    // Update Web Audio sync data
    const freqs = this.audioEngine.getFrequencies();

    // Lerp transition for smooth visual interpolation
    this.currentTransition += (this.targetTransition - this.currentTransition) * 0.05;

    // Inject data into custom master shader uniforms
    this.material.uniforms.u_time.value = clockTime;
    this.material.uniforms.u_audioData.value = freqs.bass;
    this.material.uniforms.u_transition.value = this.currentTransition;
    this.material.uniforms.u_cameraPos.value.copy(this.camera.position);

    // Slowly rotate camera around the core to emphasize scale and chiaroscuro reflections
    const radius = 90;
    this.camera.position.x = Math.sin(clockTime * 0.1) * radius;
    this.camera.position.z = Math.cos(clockTime * 0.1) * radius;
    this.camera.position.y = 35 + (Math.sin(clockTime * 0.05) * 15);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Render Cosmic Architecture Scene
    this.renderer.render(this.scene, this.camera);

    this.reqId = requestAnimationFrame(this.tick.bind(this));
  }

  public dispose() {
    cancelAnimationFrame(this.reqId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    this.scene.clear();
  }
}
