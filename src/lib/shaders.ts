// Aurora Veil Shader - Inspired by 21st.dev @isaiahbjork/shader-aurora-veil
export const auroraVeilVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const auroraVeilFragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  varying vec2 vUv;

  // Simplex noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 6; i++) {
      value += amplitude * snoise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    float time = uTime * 0.3;
    
    // Create flowing aurora-like patterns
    float n1 = fbm(uv * 3.0 + vec2(time * 0.1, time * 0.05));
    float n2 = fbm(uv * 5.0 - vec2(time * 0.08, time * 0.12));
    float n3 = fbm(uv * 7.0 + vec2(time * 0.15, -time * 0.07));
    
    float pattern = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    
    // Create vertical gradient bands
    float bands = sin(uv.y * 10.0 + time * 2.0 + pattern * 5.0) * 0.5 + 0.5;
    bands = smoothstep(0.3, 0.7, bands);
    
    // Color mixing
    vec3 color = mix(uColor1, uColor2, bands);
    color = mix(color, uColor3, pattern * 0.5);
    
    // Add glow effect
    float glow = smoothstep(0.5, 0.0, abs(uv.y - 0.5 + pattern * 0.3)) * 0.3;
    color += vec3(glow) * uColor2;
    
    // Vignette
    float vignette = 1.0 - length(uv - 0.5) * 1.2;
    color *= vignette;
    
    gl_FragColor = vec4(color, bands * 0.8);
  }
`;

// Cosmic Nebula Shader - Inspired by 21st.dev @dhileepkumargm/cosmic-nebula
export const cosmicNebulaVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const cosmicNebulaFragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;
  varying vec3 vPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  vec3 renderOrb(vec2 uv, vec2 center, float radius, vec3 color, float time) {
    float dist = length(uv - center);
    float pulse = sin(time * 2.0 + dist * 10.0) * 0.1 + 1.0;
    float orb = smoothstep(radius * pulse, radius * pulse - 0.1, dist);
    return color * orb * (1.0 - dist * 2.0);
  }

  void main() {
    vec2 uv = vUv;
    float time = uTime * 0.5;
    
    // Base starfield
    vec3 color = vec3(0.01, 0.01, 0.03);
    
    // Stars
    for (int i = 0; i < 5; i++) {
      vec2 starUv = uv * 50.0 + float(i) * 100.0;
      float star = pow(noise(floor(starUv)), 20.0) * step(noise(starUv + 1.0), 0.99);
      color += vec3(star) * vec3(1.0, 0.9, 0.8);
    }
    
    // Nebula clouds
    vec2 nebulaUv = uv * 2.0;
    float n1 = fbm(nebulaUv + vec2(time * 0.05, time * 0.03));
    float n2 = fbm(nebulaUv * 2.0 - vec2(time * 0.04, time * 0.06));
    float n3 = fbm(nebulaUv * 4.0 + vec2(time * 0.07, -time * 0.02));
    
    float nebula = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    nebula = smoothstep(0.3, 0.7, nebula);
    
    // Nebula colors - purple/blue/pink theme
    vec3 nebulaColor1 = vec3(0.4, 0.1, 0.6);  // Purple
    vec3 nebulaColor2 = vec3(0.1, 0.3, 0.8);  // Blue
    vec3 nebulaColor3 = vec3(0.8, 0.2, 0.5);  // Pink
    
    vec3 nebulaColor = mix(nebulaColor1, nebulaColor2, n1);
    nebulaColor = mix(nebulaColor, nebulaColor3, n2);
    
    color += nebulaColor * nebula * 0.8;
    
    // Glowing orbs
    vec2 orb1 = vec2(0.3 + sin(time * 0.3) * 0.2, 0.4 + cos(time * 0.2) * 0.15);
    vec2 orb2 = vec2(0.7 + cos(time * 0.25) * 0.15, 0.6 + sin(time * 0.35) * 0.2);
    vec2 orb3 = vec2(0.5 + sin(time * 0.4) * 0.3, 0.3 + cos(time * 0.3) * 0.1);
    
    color += renderOrb(uv, orb1, 0.15, vec3(0.6, 0.3, 0.9), time);
    color += renderOrb(uv, orb2, 0.12, vec3(0.3, 0.6, 1.0), time);
    color += renderOrb(uv, orb3, 0.18, vec3(1.0, 0.4, 0.7), time);
    
    // Vignette
    float vignette = 1.0 - pow(length(uv - 0.5) * 1.5, 2.0);
    color *= vignette;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Cloud Shader - Inspired by 21st.dev @manuarora700/cloud-shader
export const cloudShaderVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const cloudShaderFragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uSkyColor1;
  uniform vec3 uSkyColor2;
  uniform vec3 uCloudColor;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  float fbm(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      value += amplitude * noise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  float clouds(vec2 uv, float time) {
    vec2 p = uv * 3.0;
    p.x += time * 0.02;
    p.y += time * 0.01;
    
    float n = fbm(p, 5);
    n = smoothstep(0.4, 0.6, n);
    return n;
  }

  void main() {
    vec2 uv = vUv;
    float time = uTime * 0.1;
    
    // Sky gradient
    float skyGradient = uv.y;
    vec3 skyColor = mix(uSkyColor1, uSkyColor2, skyGradient);
    
    // Clouds
    float cloudLayer1 = clouds(uv, time);
    float cloudLayer2 = clouds(uv * 2.0 + vec2(100.0), time * 1.5) * 0.5;
    float cloudLayer3 = clouds(uv * 0.5 - vec2(50.0), time * 0.5) * 0.3;
    
    float cloudsTotal = max(cloudLayer1, max(cloudLayer2, cloudLayer3));
    
    // Cloud color with subtle variation
    vec3 cloudCol = uCloudColor * (0.8 + 0.2 * sin(uv.x * 10.0 + time));
    
    vec3 finalColor = mix(skyColor, cloudCol, cloudsTotal);
    
    // Sun glow
    vec2 sunPos = vec2(0.8, 0.2);
    float sunDist = length(uv - sunPos);
    float sunGlow = smoothstep(0.3, 0.0, sunDist) * 0.4;
    finalColor += vec3(1.0, 0.8, 0.5) * sunGlow;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Particle Wave Shader - For interactive particle backgrounds
export const particleWaveVertexShader = `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vPhase;
  uniform float uTime;
  uniform float uPixelRatio;
  
  void main() {
    vColor = aColor;
    vPhase = aPhase;
    
    vec3 pos = position;
    float wave = sin(uTime * 2.0 + aPhase + position.x * 5.0 + position.y * 3.0) * 0.3;
    pos.z += wave;
    pos.y += sin(uTime + aPhase + position.x * 2.0) * 0.2;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uPixelRatio * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const particleWaveFragmentShader = `
  varying vec3 vColor;
  varying float vPhase;
  uniform float uTime;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = smoothstep(0.5, 0.0, dist);
    
    // Pulsing effect
    float pulse = sin(uTime * 3.0 + vPhase * 10.0) * 0.3 + 0.7;
    alpha *= pulse;
    
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// Gradient Mesh Shader - For beautiful gradient backgrounds
export const gradientMeshVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const gradientMeshFragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColors[4];
  varying vec2 vUv;

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    float time = uTime * 0.2;
    
    // Create flowing gradient mesh
    vec2 p = uv * 2.0;
    p.x += sin(time + uv.y * 5.0) * 0.3;
    p.y += cos(time + uv.x * 5.0) * 0.3;
    
    float n1 = fbm(p + time * 0.1);
    float n2 = fbm(p * 2.0 - time * 0.15);
    float n3 = fbm(p * 0.5 + time * 0.05);
    
    float pattern = (n1 + n2 * 0.5 + n3 * 0.25) / 1.75;
    
    // Interpolate between 4 colors
    vec3 color1 = mix(uColors[0], uColors[1], pattern);
    vec3 color2 = mix(uColors[2], uColors[3], pattern);
    vec3 finalColor = mix(color1, color2, uv.y);
    
    // Add subtle animation
    finalColor += sin(uv.x * 20.0 + time * 2.0) * 0.02;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// ============================================
// NEW SHADERS FOR ENHANCED HERO SCENES
// ============================================

// Morphing Geometry Shader - 3D noise-based vertex displacement
export const morphingGeometryVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vElevation;
  
  uniform float uTime;
  uniform float uMorphFactor;
  uniform float uNoiseScale;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  
  // Simplex 3D Noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
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
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
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
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    // Morphing animation using noise
    float noise = snoise(position * uNoiseScale + uTime * 0.3);
    float morph = sin(uTime * 0.5 + noise * 3.0) * uMorphFactor;
    
    vec3 morphedPosition = position + normal * morph * (1.0 + noise * 0.5);
    vElevation = noise;
    
    vec4 mvPosition = modelViewMatrix * vec4(morphedPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const morphingGeometryFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vElevation;
  
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uFresnelPower;
  uniform float uFresnelIntensity;
  
  void main() {
    // Fresnel effect
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), uFresnelPower) * uFresnelIntensity;
    
    // Color based on elevation and time
    float colorMix = (vElevation + 1.0) * 0.5;
    colorMix += sin(uTime * 0.8 + vPosition.x * 2.0) * 0.1;
    
    vec3 color = mix(uColorA, uColorB, colorMix);
    color = mix(color, uColorC, smoothstep(0.7, 1.0, colorMix));
    
    // Add fresnel glow
    color += vec3(fresnel) * uColorC;
    
    // Subtle pulsing
    float pulse = sin(uTime * 2.0 + vPosition.y * 3.0) * 0.05 + 0.95;
    color *= pulse;
    
    gl_FragColor = vec4(color, 0.95);
  }
`;

// Metaball / Fluid Simulation Shader
export const metaballVertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const metaballFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  
  // Metaball field function
  float metaball(vec3 p, vec3 center, float radius) {
    return radius * radius / dot(p - center, p - center);
  }
  
  void main() {
    vec3 pos = vWorldPosition;
    
    // Animated metaball centers
    vec3 c1 = vec3(sin(uTime * 0.7) * 1.5, sin(uTime * 0.5) * 1.0, cos(uTime * 0.3) * 1.5);
    vec3 c2 = vec3(cos(uTime * 0.6) * 1.5, cos(uTime * 0.8) * 1.0, sin(uTime * 0.4) * 1.5);
    vec3 c3 = vec3(sin(uTime * 0.9) * 1.0, sin(uTime * 1.1) * 1.5, cos(uTime * 0.5) * 1.0);
    vec3 c4 = vec3(0.0, sin(uTime * 0.4) * 2.0, 0.0);
    
    float field = 0.0;
    field += metaball(pos, c1, 1.8);
    field += metaball(pos, c2, 1.5);
    field += metaball(pos, c3, 1.3);
    field += metaball(pos, c4, 2.0);
    
    // Smooth threshold
    float iso = smoothstep(0.9, 1.1, field);
    
    // Color based on which metaball influences most
    float d1 = metaball(pos, c1, 1.8);
    float d2 = metaball(pos, c2, 1.5);
    float d3 = metaball(pos, c3, 1.3);
    float d4 = metaball(pos, c4, 2.0);
    
    vec3 color = mix(uColorA, uColorB, d2 / (d1 + d2 + d3 + d4 + 0.001));
    color = mix(color, uColorC, d3 / (d1 + d2 + d3 + d4 + 0.001));
    color = mix(color, uColorA, d4 / (d1 + d2 + d3 + d4 + 0.001));
    
    // Fresnel
    float fresnel = pow(1.0 - abs(dot(vNormal, normalize(pos))), 2.5) * 0.5;
    color += vec3(fresnel) * uColorC;
    
    gl_FragColor = vec4(color, iso * 0.9);
    
    // Discard invisible parts
    if (iso < 0.05) discard;
  }
`;

// Holographic Shader - Iridescent, futuristic look
export const holographicVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  uniform float uTime;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    
    // Subtle vertex animation
    vec3 pos = position + normal * sin(uTime * 2.0 + position.x * 10.0 + position.y * 10.0) * 0.02;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const holographicFragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uHighlightColor;
  uniform float uScanlineIntensity;
  uniform float uGlitchIntensity;
  
  // Rainbow/iridescent function
  vec3 iridescence(float n) {
    float r = sin(n * 6.2831);
    float g = sin(n * 6.2831 + 2.094);
    float b = sin(n * 6.2831 + 4.188);
    return vec3(r, g, b) * 0.5 + 0.5;
  }
  
  void main() {
    vec3 viewDir = normalize(-vWorldPosition);
    float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.0);
    
    // Base holographic color
    float hue = fract(vWorldPosition.x * 0.5 + vWorldPosition.y * 0.3 + uTime * 0.1);
    vec3 color = mix(uBaseColor, uHighlightColor, fresnel);
    color = mix(color, iridescence(hue), fresnel * 0.5);
    
    // Scanline effect
    float scanlines = sin(vWorldPosition.y * 50.0 + uTime * 10.0) * uScanlineIntensity;
    color += vec3(scanlines) * 0.1;
    
    // Glitch effect
    float glitch = step(0.98, fract(uTime * 10.0 + vWorldPosition.x * 5.0)) * uGlitchIntensity;
    color = mix(color, vec3(1.0, 0.0, 1.0), glitch);
    
    // Alpha based on fresnel
    float alpha = 0.3 + fresnel * 0.7;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Plasma/Volumetric Shader
export const plasmaVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const plasmaFragmentShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uColorD;
  
  float plasma(vec2 uv, float time) {
    float value = 0.0;
    value += sin(uv.x * 10.0 + time) * 0.5;
    value += sin(uv.y * 10.0 + time * 1.3) * 0.5;
    value += sin((uv.x + uv.y) * 8.0 + time * 0.7) * 0.5;
    value += sin(sqrt(uv.x * uv.x + uv.y * uv.y) * 15.0 + time * 1.5) * 0.5;
    return value * 0.5 + 0.5;
  }
  
  void main() {
    vec2 uv = vPosition.xz * 2.0;
    float time = uTime * 0.5;
    
    float p = plasma(uv, time);
    float p2 = plasma(uv * 2.0 + time * 0.3, time * 1.7);
    float p3 = plasma(uv * 0.5 - time * 0.2, time * 0.8);
    
    float combined = (p + p2 * 0.5 + p3 * 0.25) / 1.75;
    
    // Four-color gradient
    vec3 color1 = mix(uColorA, uColorB, combined);
    vec3 color2 = mix(uColorC, uColorD, combined);
    vec3 finalColor = mix(color1, color2, vPosition.y * 0.5 + 0.5);
    
    // Add vertical gradient
    finalColor *= (vPosition.y * 0.3 + 0.7);
    
    // Fresnel glow
    float fresnel = pow(1.0 - abs(vNormal.y), 3.0);
    finalColor += vec3(fresnel) * uColorD * 0.5;
    
    gl_FragColor = vec4(finalColor, 0.85);
  }
`;