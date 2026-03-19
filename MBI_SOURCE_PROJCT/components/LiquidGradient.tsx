'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// TouchTexture class
class TouchTexture {
  size: number
  width: number
  height: number
  maxAge: number
  radius: number
  speed: number
  trail: Array<{x: number, y: number, age: number, force: number, vx: number, vy: number}>
  last: {x: number, y: number} | null
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  texture: THREE.Texture

  constructor() {
    this.size = 64
    this.width = this.height = this.size
    this.maxAge = 64
    this.radius = 0.25 * this.size
    this.speed = 1 / this.maxAge
    this.trail = []
    this.last = null
    this.initTexture()
  }

  initTexture() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.ctx = this.canvas.getContext('2d')!
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.texture = new THREE.Texture(this.canvas)
  }

  update() {
    this.clear()
    let speed = this.speed
    // Use reverse iteration to safely remove items
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const point = this.trail[i]
      let f = point.force * speed * (1 - point.age / this.maxAge)
      point.x += point.vx * f
      point.y += point.vy * f
      point.age++
      if (point.age > this.maxAge) {
        this.trail.splice(i, 1)
      } else {
        this.drawPoint(point)
      }
    }
    this.texture.needsUpdate = true
  }

  clear() {
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  addTouch(point: {x: number, y: number}) {
    let force = 0
    let vx = 0
    let vy = 0
    const last = this.last
    if (last) {
      const dx = point.x - last.x
      const dy = point.y - last.y
      if (dx === 0 && dy === 0) return
      const dd = dx * dx + dy * dy
      let d = Math.sqrt(dd)
      vx = dx / d
      vy = dy / d
      force = Math.min(dd * 20000, 2.0)
    }
    this.last = { x: point.x, y: point.y }
    this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy })
  }

  drawPoint(point: {x: number, y: number, age: number, force: number, vx: number, vy: number}) {
    const pos = {
      x: point.x * this.width,
      y: (1 - point.y) * this.height
    }

    let intensity = 1
    if (point.age < this.maxAge * 0.3) {
      intensity = Math.sin((point.age / (this.maxAge * 0.3)) * (Math.PI / 2))
    } else {
      const t = 1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7)
      intensity = -t * (t - 2)
    }
    intensity *= point.force

    const radius = this.radius
    let color = `${((point.vx + 1) / 2) * 255}, ${
      ((point.vy + 1) / 2) * 255
    }, ${intensity * 255}`
    let offset = this.size * 5
    this.ctx.shadowOffsetX = offset
    this.ctx.shadowOffsetY = offset
    this.ctx.shadowBlur = radius * 1
    this.ctx.shadowColor = `rgba(${color},${0.2 * intensity})`

    this.ctx.beginPath()
    this.ctx.fillStyle = 'rgba(255,0,0,1)'
    this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2)
    this.ctx.fill()
  }
}

// GradientBackground class
class GradientBackground {
  sceneManager: any
  mesh: THREE.Mesh | null
  uniforms: {
    uTime: { value: number }
    uResolution: { value: THREE.Vector2 }
    uColor1: { value: THREE.Vector3 }
    uColor2: { value: THREE.Vector3 }
    uColor3: { value: THREE.Vector3 }
    uColor4: { value: THREE.Vector3 }
    uColor5: { value: THREE.Vector3 }
    uColor6: { value: THREE.Vector3 }
    uSpeed: { value: number }
    uIntensity: { value: number }
    uTouchTexture: { value: THREE.Texture | null }
    uGrainIntensity: { value: number }
    uZoom: { value: number }
    uDarkNavy: { value: THREE.Vector3 }
    uGradientSize: { value: number }
    uGradientCount: { value: number }
    uColor1Weight: { value: number }
    uColor2Weight: { value: number }
  }

  constructor(sceneManager: any) {
    this.sceneManager = sceneManager
    this.mesh = null
    this.uniforms = {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight)
      },
      uColor1: { value: new THREE.Vector3(0.945, 0.353, 0.133) }, // F15A22 - Orange
      uColor2: { value: new THREE.Vector3(0.039, 0.055, 0.153) }, // 0a0e27 - Navy Blue
      uColor3: { value: new THREE.Vector3(0.945, 0.353, 0.133) }, // F15A22 - Orange
      uColor4: { value: new THREE.Vector3(0.039, 0.055, 0.153) }, // 0a0e27 - Navy Blue
      uColor5: { value: new THREE.Vector3(0.945, 0.353, 0.133) }, // F15A22 - Orange
      uColor6: { value: new THREE.Vector3(0.039, 0.055, 0.153) }, // 0a0e27 - Navy Blue
      uSpeed: { value: 1.2 },
      uIntensity: { value: 1.8 },
      uTouchTexture: { value: null },
      uGrainIntensity: { value: 0.08 },
      uZoom: { value: 1.0 },
      uDarkNavy: { value: new THREE.Vector3(0.039, 0.055, 0.153) },
      uGradientSize: { value: 1.0 },
      uGradientCount: { value: 6.0 },
      uColor1Weight: { value: 1.0 },
      uColor2Weight: { value: 1.0 }
    }
  }

  init() {
    const viewSize = this.sceneManager.getViewSize()
    const geometry = new THREE.PlaneGeometry(
      viewSize.width,
      viewSize.height,
      1,
      1
    )

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vec3 pos = position.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
          vUv = uv;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec3 uColor4;
        uniform vec3 uColor5;
        uniform vec3 uColor6;
        uniform float uSpeed;
        uniform float uIntensity;
        uniform sampler2D uTouchTexture;
        uniform float uGrainIntensity;
        uniform float uZoom;
        uniform vec3 uDarkNavy;
        uniform float uGradientSize;
        uniform float uGradientCount;
        uniform float uColor1Weight;
        uniform float uColor2Weight;
        
        varying vec2 vUv;
        
        #define PI 3.14159265359
        
        float grain(vec2 uv, float time) {
          vec2 grainUv = uv * uResolution * 0.5;
          float grainValue = fract(sin(dot(grainUv + time, vec2(12.9898, 78.233))) * 43758.5453);
          return grainValue * 2.0 - 1.0;
        }
        
        vec3 getGradientColor(vec2 uv, float time) {
          float gradientRadius = uGradientSize;
          
          vec2 center1 = vec2(
            0.5 + sin(time * uSpeed * 0.4) * 0.4,
            0.5 + cos(time * uSpeed * 0.5) * 0.4
          );
          vec2 center2 = vec2(
            0.5 + cos(time * uSpeed * 0.6) * 0.5,
            0.5 + sin(time * uSpeed * 0.45) * 0.5
          );
          vec2 center3 = vec2(
            0.5 + sin(time * uSpeed * 0.35) * 0.45,
            0.5 + cos(time * uSpeed * 0.55) * 0.45
          );
          vec2 center4 = vec2(
            0.5 + cos(time * uSpeed * 0.5) * 0.4,
            0.5 + sin(time * uSpeed * 0.4) * 0.4
          );
          vec2 center5 = vec2(
            0.5 + sin(time * uSpeed * 0.7) * 0.35,
            0.5 + cos(time * uSpeed * 0.6) * 0.35
          );
          vec2 center6 = vec2(
            0.5 + cos(time * uSpeed * 0.45) * 0.5,
            0.5 + sin(time * uSpeed * 0.65) * 0.5
          );
          
          vec2 center7 = vec2(
            0.5 + sin(time * uSpeed * 0.55) * 0.38,
            0.5 + cos(time * uSpeed * 0.48) * 0.42
          );
          vec2 center8 = vec2(
            0.5 + cos(time * uSpeed * 0.65) * 0.36,
            0.5 + sin(time * uSpeed * 0.52) * 0.44
          );
          vec2 center9 = vec2(
            0.5 + sin(time * uSpeed * 0.42) * 0.41,
            0.5 + cos(time * uSpeed * 0.58) * 0.39
          );
          vec2 center10 = vec2(
            0.5 + cos(time * uSpeed * 0.48) * 0.37,
            0.5 + sin(time * uSpeed * 0.62) * 0.43
          );
          vec2 center11 = vec2(
            0.5 + sin(time * uSpeed * 0.68) * 0.33,
            0.5 + cos(time * uSpeed * 0.44) * 0.46
          );
          vec2 center12 = vec2(
            0.5 + cos(time * uSpeed * 0.38) * 0.39,
            0.5 + sin(time * uSpeed * 0.56) * 0.41
          );
          
          float dist1 = length(uv - center1);
          float dist2 = length(uv - center2);
          float dist3 = length(uv - center3);
          float dist4 = length(uv - center4);
          float dist5 = length(uv - center5);
          float dist6 = length(uv - center6);
          float dist7 = length(uv - center7);
          float dist8 = length(uv - center8);
          float dist9 = length(uv - center9);
          float dist10 = length(uv - center10);
          float dist11 = length(uv - center11);
          float dist12 = length(uv - center12);
          
          float influence1 = 1.0 - smoothstep(0.0, gradientRadius, dist1);
          float influence2 = 1.0 - smoothstep(0.0, gradientRadius, dist2);
          float influence3 = 1.0 - smoothstep(0.0, gradientRadius, dist3);
          float influence4 = 1.0 - smoothstep(0.0, gradientRadius, dist4);
          float influence5 = 1.0 - smoothstep(0.0, gradientRadius, dist5);
          float influence6 = 1.0 - smoothstep(0.0, gradientRadius, dist6);
          float influence7 = 1.0 - smoothstep(0.0, gradientRadius, dist7);
          float influence8 = 1.0 - smoothstep(0.0, gradientRadius, dist8);
          float influence9 = 1.0 - smoothstep(0.0, gradientRadius, dist9);
          float influence10 = 1.0 - smoothstep(0.0, gradientRadius, dist10);
          float influence11 = 1.0 - smoothstep(0.0, gradientRadius, dist11);
          float influence12 = 1.0 - smoothstep(0.0, gradientRadius, dist12);
          
          vec2 rotatedUv1 = uv - 0.5;
          float angle1 = time * uSpeed * 0.15;
          rotatedUv1 = vec2(
            rotatedUv1.x * cos(angle1) - rotatedUv1.y * sin(angle1),
            rotatedUv1.x * sin(angle1) + rotatedUv1.y * cos(angle1)
          );
          rotatedUv1 += 0.5;
          
          vec2 rotatedUv2 = uv - 0.5;
          float angle2 = -time * uSpeed * 0.12;
          rotatedUv2 = vec2(
            rotatedUv2.x * cos(angle2) - rotatedUv2.y * sin(angle2),
            rotatedUv2.x * sin(angle2) + rotatedUv2.y * cos(angle2)
          );
          rotatedUv2 += 0.5;
          
          float radialGradient1 = length(rotatedUv1 - 0.5);
          float radialGradient2 = length(rotatedUv2 - 0.5);
          float radialInfluence1 = 1.0 - smoothstep(0.0, 0.8, radialGradient1);
          float radialInfluence2 = 1.0 - smoothstep(0.0, 0.8, radialGradient2);
          
          vec3 color = vec3(0.0);
          color += uColor1 * influence1 * (0.55 + 0.45 * sin(time * uSpeed)) * uColor1Weight;
          color += uColor2 * influence2 * (0.55 + 0.45 * cos(time * uSpeed * 1.2)) * uColor2Weight;
          color += uColor3 * influence3 * (0.55 + 0.45 * sin(time * uSpeed * 0.8)) * uColor1Weight;
          color += uColor4 * influence4 * (0.55 + 0.45 * cos(time * uSpeed * 1.3)) * uColor2Weight;
          color += uColor5 * influence5 * (0.55 + 0.45 * sin(time * uSpeed * 1.1)) * uColor1Weight;
          color += uColor6 * influence6 * (0.55 + 0.45 * cos(time * uSpeed * 0.9)) * uColor2Weight;
          
          if (uGradientCount > 6.0) {
            color += uColor1 * influence7 * (0.55 + 0.45 * sin(time * uSpeed * 1.4)) * uColor1Weight;
            color += uColor2 * influence8 * (0.55 + 0.45 * cos(time * uSpeed * 1.5)) * uColor2Weight;
            color += uColor3 * influence9 * (0.55 + 0.45 * sin(time * uSpeed * 1.6)) * uColor1Weight;
            color += uColor4 * influence10 * (0.55 + 0.45 * cos(time * uSpeed * 1.7)) * uColor2Weight;
          }
          if (uGradientCount > 10.0) {
            color += uColor5 * influence11 * (0.55 + 0.45 * sin(time * uSpeed * 1.8)) * uColor1Weight;
            color += uColor6 * influence12 * (0.55 + 0.45 * cos(time * uSpeed * 1.9)) * uColor2Weight;
          }
          
          color += mix(uColor1, uColor3, radialInfluence1) * 0.45 * uColor1Weight;
          color += mix(uColor2, uColor4, radialInfluence2) * 0.4 * uColor2Weight;
          
          color = clamp(color, vec3(0.0), vec3(1.0)) * uIntensity;
          
          float luminance = dot(color, vec3(0.299, 0.587, 0.114));
          color = mix(vec3(luminance), color, 1.35);
          
          color = pow(color, vec3(0.92));
          
          float brightness1 = length(color);
          float mixFactor1 = max(brightness1 * 1.2, 0.15);
          color = mix(uDarkNavy, color, mixFactor1);
          
          float maxBrightness = 1.0;
          float brightness = length(color);
          if (brightness > maxBrightness) {
            color = color * (maxBrightness / brightness);
          }
          
          return color;
        }
        
        void main() {
          vec2 uv = vUv;
          
          vec4 touchTex = texture2D(uTouchTexture, uv);
          float vx = -(touchTex.r * 2.0 - 1.0);
          float vy = -(touchTex.g * 2.0 - 1.0);
          float intensity = touchTex.b;
          uv.x += vx * 0.8 * intensity;
          uv.y += vy * 0.8 * intensity;
          
          vec2 center = vec2(0.5);
          float dist = length(uv - center);
          float ripple = sin(dist * 20.0 - uTime * 3.0) * 0.04 * intensity;
          float wave = sin(dist * 15.0 - uTime * 2.0) * 0.03 * intensity;
          uv += vec2(ripple + wave);
          
          vec3 color = getGradientColor(uv, uTime);
          
          float grainValue = grain(uv, uTime);
          color += grainValue * uGrainIntensity;
          
          float timeShift = uTime * 0.5;
          color.r += sin(timeShift) * 0.02;
          color.g += cos(timeShift * 1.4) * 0.02;
          color.b += sin(timeShift * 1.2) * 0.02;
          
          float brightness2 = length(color);
          float mixFactor2 = max(brightness2 * 1.2, 0.15);
          color = mix(uDarkNavy, color, mixFactor2);
          
          color = clamp(color, vec3(0.0), vec3(1.0));
          
          float maxBrightness = 1.0;
          float brightness = length(color);
          if (brightness > maxBrightness) {
            color = color * (maxBrightness / brightness);
          }
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.z = 0
    this.sceneManager.scene.add(this.mesh)
  }

  update(delta: number) {
    if (this.uniforms.uTime) {
      this.uniforms.uTime.value += delta
    }
  }

  onResize(width: number, height: number) {
    const viewSize = this.sceneManager.getViewSize()
    if (this.mesh) {
      this.mesh.geometry.dispose()
      this.mesh.geometry = new THREE.PlaneGeometry(
        viewSize.width,
        viewSize.height,
        1,
        1
      )
    }
    if (this.uniforms.uResolution) {
      this.uniforms.uResolution.value.set(width, height)
    }
  }
}

// Main Three.js App
class App {
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  scene: THREE.Scene
  clock: THREE.Clock
  touchTexture: TouchTexture
  gradientBackground: GradientBackground
  colorSchemes: any
  currentScheme: number
  mouse: {x: number, y: number} | null

  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
      depth: false
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setAnimationLoop(null)
    
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    )
    this.camera.position.z = 50
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0a0e27)
    this.clock = new THREE.Clock()

    this.touchTexture = new TouchTexture()
    this.gradientBackground = new GradientBackground(this)
    this.gradientBackground.uniforms.uTouchTexture.value = this.touchTexture.texture

    this.colorSchemes = {
      1: {
        color1: new THREE.Vector3(0.945, 0.353, 0.133), // F15A22 - Orange
        color2: new THREE.Vector3(0.039, 0.055, 0.153) // 0a0e27 - Navy Blue
      },
      2: {
        color1: new THREE.Vector3(1.0, 0.424, 0.314), // FF6C50 - Coral Red-Orange
        color2: new THREE.Vector3(0.251, 0.878, 0.816) // 40E0D0 - Turquoise
      },
      3: {
        color1: new THREE.Vector3(0.945, 0.353, 0.133),
        color2: new THREE.Vector3(0.039, 0.055, 0.153),
        color3: new THREE.Vector3(0.251, 0.878, 0.816)
      },
      4: {
        color1: new THREE.Vector3(0.949, 0.4, 0.2), // F26633 - Orange/Coral
        color2: new THREE.Vector3(0.176, 0.42, 0.427), // 2D6B6D - Teal/Blue-Green
        color3: new THREE.Vector3(0.82, 0.686, 0.612) // D1AF9C - Beige/Peach
      },
      5: {
        color1: new THREE.Vector3(0.945, 0.353, 0.133),
        color2: new THREE.Vector3(0.0, 0.259, 0.22), // 004238 - Dark Teal
        color3: new THREE.Vector3(0.945, 0.353, 0.133),
        color4: new THREE.Vector3(0.0, 0.0, 0.0), // 000000 - Black
        color5: new THREE.Vector3(0.945, 0.353, 0.133),
        color6: new THREE.Vector3(0.0, 0.0, 0.0)
      }
    }
    this.currentScheme = 1
    this.mouse = null
  }

  init(container: HTMLDivElement) {
    container.appendChild(this.renderer.domElement)
    this.gradientBackground.init()
    this.setColorScheme(1)
    
    this.render()
    this.tick()
  }

  setColorScheme(scheme: number) {
    if (!this.colorSchemes[scheme]) return
    this.currentScheme = scheme
    const colors = this.colorSchemes[scheme]
    const uniforms = this.gradientBackground.uniforms

    if (scheme === 3) {
      uniforms.uColor1.value.copy(colors.color1)
      uniforms.uColor2.value.copy(colors.color2)
      uniforms.uColor3.value.copy(colors.color3)
      uniforms.uColor4.value.copy(colors.color1)
      uniforms.uColor5.value.copy(colors.color2)
      uniforms.uColor6.value.copy(colors.color3)
    } else if (scheme === 4) {
      uniforms.uColor1.value.copy(colors.color1)
      uniforms.uColor2.value.copy(colors.color2)
      uniforms.uColor3.value.copy(colors.color3)
      uniforms.uColor4.value.copy(colors.color1)
      uniforms.uColor5.value.copy(colors.color2)
      uniforms.uColor6.value.copy(colors.color3)
    } else if (scheme === 5) {
      uniforms.uColor1.value.copy(colors.color1)
      uniforms.uColor2.value.copy(colors.color2)
      uniforms.uColor3.value.copy(colors.color3)
      uniforms.uColor4.value.copy(colors.color4)
      uniforms.uColor5.value.copy(colors.color5)
      uniforms.uColor6.value.copy(colors.color6)
    } else {
      uniforms.uColor1.value.copy(colors.color1)
      uniforms.uColor2.value.copy(colors.color2)
      uniforms.uColor3.value.copy(colors.color1)
      uniforms.uColor4.value.copy(colors.color2)
      uniforms.uColor5.value.copy(colors.color1)
      uniforms.uColor6.value.copy(colors.color2)
    }

    if (scheme === 1) {
      this.scene.background = new THREE.Color(0x0a0e27)
      uniforms.uDarkNavy.value.set(0.039, 0.055, 0.153)
      uniforms.uGradientSize.value = 0.45
      uniforms.uGradientCount.value = 12.0
      uniforms.uSpeed.value = 1.5
      uniforms.uColor1Weight.value = 0.5
      uniforms.uColor2Weight.value = 1.8
    } else if (scheme === 4) {
      this.scene.background = new THREE.Color(0xffffff)
      uniforms.uDarkNavy.value.set(0, 0, 0)
    } else if (scheme === 2) {
      this.scene.background = new THREE.Color(0x0a0e27)
      uniforms.uDarkNavy.value.set(0.039, 0.055, 0.153)
      uniforms.uGradientSize.value = 1.0
      uniforms.uGradientCount.value = 6.0
      uniforms.uSpeed.value = 1.2
      uniforms.uColor1Weight.value = 1.0
      uniforms.uColor2Weight.value = 1.0
    } else {
      this.scene.background = new THREE.Color(0x0a0e27)
      uniforms.uDarkNavy.value.set(0.039, 0.055, 0.153)
      uniforms.uGradientSize.value = 1.0
      uniforms.uGradientCount.value = 6.0
      uniforms.uSpeed.value = 1.2
      uniforms.uColor1Weight.value = 1.0
      uniforms.uColor2Weight.value = 1.0
    }
  }

  onMouseMove(clientX: number, clientY: number) {
    this.mouse = {
      x: clientX / window.innerWidth,
      y: 1 - clientY / window.innerHeight
    }
    this.touchTexture.addTouch(this.mouse)
  }

  getViewSize() {
    const fovInRadians = (this.camera.fov * Math.PI) / 180
    const height = Math.abs(
      this.camera.position.z * Math.tan(fovInRadians / 2) * 2
    )
    return { width: height * this.camera.aspect, height }
  }

  update(delta: number) {
    this.touchTexture.update()
    this.gradientBackground.update(delta)
  }

  render() {
    const delta = this.clock.getDelta()
    const clampedDelta = Math.min(delta, 0.1)
    this.renderer.render(this.scene, this.camera)
    this.update(clampedDelta)
  }

  tick() {
    this.render()
    requestAnimationFrame(() => this.tick())
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.gradientBackground.onResize(window.innerWidth, window.innerHeight)
  }

  cleanup(container: HTMLDivElement) {
    if (container.contains(this.renderer.domElement)) {
      container.removeChild(this.renderer.domElement)
    }
    this.renderer.dispose()
  }
}

// Convert RGB (0-1) to Hex
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return '#' + toHex(r) + toHex(g) + toHex(b)
}

// Convert Hex to RGB (0-1)
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
      }
    : null
}

interface LiquidGradientProps {
  showControls?: boolean
  fullScreen?: boolean
}

export default function LiquidGradient({ 
  showControls = true, 
  fullScreen = false 
}: LiquidGradientProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<App | null>(null)
  const [adjusterOpen, setAdjusterOpen] = useState(false)
  const [activeScheme, setActiveScheme] = useState(1)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Three.js app
    appRef.current = new App()
    appRef.current.init(containerRef.current)

    // Handle mouse events
    const handleMouseMove = (e: MouseEvent) => {
      if (appRef.current) {
        appRef.current.onMouseMove(e.clientX, e.clientY)
      }
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top = e.clientY + 'px'
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (appRef.current) {
        appRef.current.onMouseMove(touch.clientX, touch.clientY)
      }
      if (cursorRef.current) {
        cursorRef.current.style.left = touch.clientX + 'px'
        cursorRef.current.style.top = touch.clientY + 'px'
      }
    }

    const handleResize = () => {
      if (appRef.current) {
        appRef.current.onResize()
      }
    }

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('resize', handleResize)
      if (appRef.current && containerRef.current) {
        appRef.current.cleanup(containerRef.current)
      }
    }
  }, [])

  const handleSchemeChange = (scheme: number) => {
    if (appRef.current) {
      appRef.current.setColorScheme(scheme)
      setActiveScheme(scheme)
    }
  }

  const handleColorChange = (index: number, hex: string) => {
    if (!appRef.current) return
    const rgb = hexToRgb(hex)
    if (rgb) {
      const uniforms = appRef.current.gradientBackground.uniforms
      const colorUniform = uniforms[`uColor${index}` as keyof typeof uniforms]
      if (colorUniform && 'value' in colorUniform && colorUniform.value instanceof THREE.Vector3) {
        colorUniform.value.set(rgb.r, rgb.g, rgb.b)
      }
    }
  }

  const getCurrentColors = () => {
    if (!appRef.current) return []
    const uniforms = appRef.current.gradientBackground.uniforms
    return [
      uniforms.uColor1.value,
      uniforms.uColor2.value,
      uniforms.uColor3.value,
      uniforms.uColor4.value,
      uniforms.uColor5.value,
      uniforms.uColor6.value
    ]
  }

  return (
    <div className={`relative ${fullScreen ? 'h-screen' : 'h-[500px]'} w-full overflow-hidden`}>
      {/* Three.js Canvas */}
      <div ref={containerRef} className="absolute inset-0 z-1" />

      {/* Custom Cursor */}
      {showControls && (
        <div ref={cursorRef} className="custom-cursor" />
      )}

      {/* Color Controls */}
      {showControls && (
        <>
          <div className="color-controls">
            {[1, 2, 3, 4, 5].map((scheme) => (
              <button
                key={scheme}
                className={`color-btn ${activeScheme === scheme ? 'active' : ''}`}
                onClick={() => handleSchemeChange(scheme)}
                data-scheme={scheme}
              >
                Scheme {scheme}
              </button>
            ))}
          </div>

          <button 
            className="toggle-adjuster-btn" 
            onClick={() => setAdjusterOpen(!adjusterOpen)}
          >
            Adjust Colors
          </button>

          {adjusterOpen && (
            <div className="color-adjuster-panel open">
              <div className="color-adjuster-header">
                <h3 className="color-adjuster-title">Color Adjuster</h3>
                <button 
                  className="color-adjuster-close" 
                  onClick={() => setAdjusterOpen(false)}
                >
                  ×
                </button>
              </div>

              {[1, 2, 3, 4, 5, 6].map((index) => {
                const colors = getCurrentColors()
                const color = colors[index - 1]
                const hex = color ? rgbToHex(color.x, color.y, color.z) : '#000000'
                
                return (
                  <div key={index} className="color-picker-group">
                    <div className="color-picker-label">
                      <span>Color {index}</span>
                    </div>
                    <div className="color-picker-wrapper">
                      <input
                        type="color"
                        className="color-picker-input"
                        id={`colorPicker${index}`}
                        value={hex}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                      />
                      <input
                        type="text"
                        className="color-value-display"
                        id={`colorValue${index}`}
                        value={hex.toUpperCase()}
                        readOnly
                      />
                      <button
                        className="copy-btn"
                        onClick={() => navigator.clipboard.writeText(hex.toUpperCase())}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )
              })}

              <div className="color-adjuster-actions">
                <button 
                  className="export-btn"
                  onClick={() => {
                    const colors = getCurrentColors()
                    const hexColors = colors.map(c => rgbToHex(c.x, c.y, c.z).toUpperCase())
                    const exportText = `Color Scheme:\n${hexColors.map((c, i) => `Color ${i + 1}: ${c}`).join('\n')}`
                    navigator.clipboard.writeText(exportText)
                  }}
                >
                  Export All Colors
                </button>
              </div>
            </div>
          )}

          <footer className="footer">
            <a href="https://madebybeings.com" target="_blank" rel="noopener noreferrer">
              Made By Beings
            </a>
          </footer>
        </>
      )}

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        #webGLApp {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        .custom-cursor {
          position: fixed;
          width: 40px;
          height: 40px;
          border: 2px solid white;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1000;
          transform: translate(-50%, -50%);
          transition: width 0.2s ease, height 0.2s ease, border-width 0.2s ease;
          background: transparent;
          will-change: transform;
        }
        .custom-cursor::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        }
        body {
          cursor: none;
        }
        .color-controls {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 10;
          display: flex;
          gap: 1rem;
          pointer-events: auto;
        }
        .color-btn {
          min-width: 48px;
          height: 48px;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 24px;
          color: white;
          font-family: "Syne", sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
        }
        .color-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }
        .color-btn.active {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.6);
        }
        .toggle-adjuster-btn {
          position: fixed;
          top: 2rem;
          left: 2rem;
          z-index: 100;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          font-family: "Syne", sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border-radius: 8px;
          pointer-events: auto;
        }
        .toggle-adjuster-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }
        .color-adjuster-panel {
          position: fixed;
          top: 2rem;
          left: 2rem;
          z-index: 100;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 1.5rem;
          min-width: 320px;
          max-width: 400px;
          pointer-events: auto;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        .color-adjuster-panel.open {
          display: block;
        }
        .color-adjuster-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .color-adjuster-title {
          color: white;
          font-family: "Syne", sans-serif;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .color-adjuster-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s ease;
        }
        .color-adjuster-close:hover {
          opacity: 0.7;
        }
        .color-picker-group {
          margin-bottom: 1.25rem;
        }
        .color-picker-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          color: white;
          font-family: "Inter", sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .color-picker-wrapper {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .color-picker-input {
          width: 60px;
          height: 40px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          cursor: pointer;
          background: none;
          padding: 0;
          -webkit-appearance: none;
          appearance: none;
        }
        .color-picker-input::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        .color-picker-input::-webkit-color-swatch {
          border: none;
          border-radius: 6px;
        }
        .color-value-display {
          flex: 1;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          color: white;
          font-family: "Inter", monospace;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          cursor: text;
          user-select: all;
          transition: all 0.3s ease;
        }
        .color-value-display:hover {
          background: rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.4);
        }
        .color-value-display:focus {
          outline: none;
          background: rgba(0, 0, 0, 0.4);
          border-color: rgba(255, 255, 255, 0.5);
        }
        .copy-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          color: white;
          font-family: "Inter", sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .copy-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }
        .copy-btn.copied {
          background: rgba(76, 175, 80, 0.3);
          border-color: rgba(76, 175, 80, 0.5);
        }
        .color-adjuster-actions {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          gap: 0.75rem;
        }
        .export-btn {
          flex: 1;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          padding: 0.75rem;
          color: white;
          font-family: "Syne", sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .export-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }
        .footer {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          color: white;
          font-family: "Syne", sans-serif;
          font-size: clamp(0.875rem, 1.5vw, 1.125rem);
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          text-align: center;
          pointer-events: auto;
        }
        .footer a {
          color: white;
          text-decoration: none;
          transition: opacity 0.3s ease;
        }
        .footer a:hover {
          opacity: 0.7;
        }
      `}</style>
    </div>
  )
}