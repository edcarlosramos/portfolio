import React, { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { MOTION_OK } from '../constants'
import { heroPrepare, introDone, markHeroReady } from '../utils/intro'

// Texto em liquid glass renderizado em WebGL.
//
// O texto real continua no DOM (transparente) para layout e acessibilidade;
// um canvas por cima desenha o vidro. A forma das letras vira uma textura:
//   R = máscara nítida, G = máscara levemente desfocada (bisel das bordas),
//   B = máscara bem desfocada (curvatura do corpo).
// O shader reconstrói o fundo do card do hero (degradê + luz) e, dentro das
// letras, mostra esse fundo refratado (com aberração cromática), um reflexo
// especular anisotrópico que se estica na direção do movimento da luz, brilho
// de Fresnel nas bordas viradas para ela e uma cáustica suave do lado oposto.

// Cores do card e das luzes (Meshgradientbackground / index.css).
const COLORS = {
  top: '#00417B',
  bottom: '#000C17',
  blue: '#005AAF',
  lightCenter: '#7FBBD0',
  lightEdge: '#A3E6FF',
}

// Folga do canvas em volta do texto (em em), para glifos que passam da caixa
// (leading < 1) e para o brilho das bordas.
const PAD_EM = 0.3
const MAX_DPR = 2

const VERTEX = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAGMENT = `
precision highp float;

uniform sampler2D uMask;
uniform vec2 uRes;
uniform vec2 uLight;
uniform float uLightR;
uniform float uBlur;
uniform vec2 uVel;
uniform float uFs;
uniform float uCardTop;
uniform float uCardH;
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uBlue;
uniform vec3 uLightCenter;
uniform vec3 uLightEdge;

vec3 mask(vec2 p) { return texture2D(uMask, p / uRes).rgb; }

float height(vec2 p) {
  vec3 m = mask(p);
  return m.g * 0.6 + m.b * 0.4;
}

// Fundo do card: degradê vertical + luz azul + luz clara por cima.
vec3 background(vec2 p) {
  float t = clamp((p.y - uCardTop) / uCardH, 0.0, 1.0);
  vec3 col = mix(uTop, uBottom, t);
  float d = distance(p, uLight);
  float rBlue = uLightR * 1.133;
  col = mix(col, uBlue, 1.0 - smoothstep(rBlue - uBlur, rBlue + uBlur, d));
  vec3 lightCol = mix(uLightCenter, uLightEdge, clamp(d / (uLightR * 0.92), 0.0, 1.0));
  col = mix(col, lightCol, 1.0 - smoothstep(uLightR - uBlur, uLightR + uBlur, d));
  return col;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec3 m = mask(p);
  float alpha = m.r;
  if (alpha < 0.003) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // Normal a partir do relevo.
  float e = 1.5;
  float hs = uFs * 0.07;
  float hx = height(p + vec2(e, 0.0)) - height(p - vec2(e, 0.0));
  float hy = height(p + vec2(0.0, e)) - height(p - vec2(0.0, e));
  vec3 n = normalize(vec3(-hx / (2.0 * e) * hs, -hy / (2.0 * e) * hs, 1.0));
  vec2 n2 = n.xy / max(length(n.xy), 1e-4);

  // Refração com aberração cromática (lente convexa: amplia o fundo).
  vec2 off = n.xy * uFs * 0.1;
  vec3 col;
  col.r = background(p - off * 1.00).r;
  col.g = background(p - off * 1.06).g;
  col.b = background(p - off * 1.12).b;
  col *= 1.06;

  // Luz em 3D: abaixo do texto e um pouco à frente.
  vec3 P = vec3(p, height(p) * hs);
  vec3 L = normalize(vec3(uLight, uFs * 0.9) - P);
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float ndh = max(dot(n, H), 0.0);

  // Reflexo anisotrópico: alonga na direção do movimento da luz.
  float speed = clamp(length(uVel) / 0.8, 0.0, 1.0);
  vec3 T = length(uVel) > 1e-4 ? normalize(vec3(uVel, 0.0)) : vec3(1.0, 0.0, 0.0);
  T = normalize(T - n * dot(n, T));
  vec3 B = cross(n, T);
  float ax = mix(0.16, 0.5, speed);
  float ay = 0.07;
  float th = dot(H, T) / ax;
  float bh = dot(H, B) / ay;
  float spec = exp(-(th * th + bh * bh) / max(ndh * ndh, 1e-3));

  float dist = distance(p, uLight);
  float att = 1.0 / (1.0 + pow(dist / (uFs * 3.0), 2.0));
  vec2 l2 = normalize(uLight - p);
  float facing = max(dot(n2, l2), 0.0);
  float fres = pow(1.0 - clamp(n.z, 0.0, 1.0), 3.5);

  // Corpo do vidro: leve tom claro, mais forte no alto (luz ambiente).
  float vertical = 1.0 - clamp(p.y / uRes.y, 0.0, 1.0);
  col += vec3(0.035, 0.065, 0.1) + vec3(0.25, 0.4, 0.55) * vertical * 0.06;

  // Brilhos somados à parte e comprimidos no fim (glow / (1 + glow)), para
  // ficarem suaves e translúcidos em vez de estourar em branco.
  vec3 glow = vec3(0.0);
  glow += uLightEdge * spec * att * (0.55 + 0.35 * speed);
  glow += uLightEdge * fres * facing * (0.08 + 0.25 * att);
  glow += uLightEdge * max(dot(n2, -l2), 0.0) * fres * att * 0.06;
  col += glow / (1.0 + glow);

  gl_FragColor = vec4(col * alpha, alpha);
}
`

const hexToRgb = (hex) => {
  const v = parseInt(hex.slice(1), 16)
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255]
}

const createProgram = (gl) => {
  const compile = (type, source) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader))
    }
    return shader
  }
  const program = gl.createProgram()
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program))
  }
  return program
}

// Alfa de um canvas 2D com o texto, opcionalmente desfocado.
const drawAlpha = (source, width, height, blur) => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.filter = blur ? `blur(${blur}px)` : 'none'
  ctx.drawImage(source, 0, 0)
  return ctx.getImageData(0, 0, width, height).data
}

const GlassTextGL = ({ text, getLight, fallbackClassName = '' }) => {
  const textRef = useRef(null)
  const canvasRef = useRef(null)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    const textEl = textRef.current
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, antialias: false })
    if (!gl) {
      setSupported(false)
      markHeroReady()
      return undefined
    }

    let program
    try {
      program = createProgram(gl)
    } catch (error) {
      console.error(error)
      setSupported(false)
      markHeroReady()
      return undefined
    }

    gl.useProgram(program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    const u = {}
    ;[
      'uMask', 'uRes', 'uLight', 'uLightR', 'uBlur', 'uVel', 'uFs', 'uCardTop', 'uCardH',
      'uTop', 'uBottom', 'uBlue', 'uLightCenter', 'uLightEdge',
    ].forEach((name) => {
      u[name] = gl.getUniformLocation(program, name)
    })
    gl.uniform1i(u.uMask, 0)
    gl.uniform3fv(u.uTop, hexToRgb(COLORS.top))
    gl.uniform3fv(u.uBottom, hexToRgb(COLORS.bottom))
    gl.uniform3fv(u.uBlue, hexToRgb(COLORS.blue))
    gl.uniform3fv(u.uLightCenter, hexToRgb(COLORS.lightCenter))
    gl.uniform3fv(u.uLightEdge, hexToRgb(COLORS.lightEdge))

    const layout = { dpr: 1, fontSize: 0, pad: 0, ready: false }
    const motion = { ready: false, x: 0, y: 0, vx: 0, vy: 0 }

    // Redesenha a máscara do texto (no tamanho atual) e envia como textura.
    const build = () => {
      const style = getComputedStyle(textEl)
      const fontSize = parseFloat(style.fontSize)
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const pad = fontSize * PAD_EM
      const box = textEl.getBoundingClientRect()
      if (!box.width) return

      // Linha de base do texto, medida no próprio DOM.
      const probe = document.createElement('span')
      probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
      textEl.appendChild(probe)
      const baseline = probe.getBoundingClientRect().top - box.top
      probe.remove()

      const cssWidth = box.width + pad * 2
      const cssHeight = box.height + pad * 2
      // O canvas é posicionado em relação ao wrapper, mas a máscara é desenhada
      // a partir da caixa do texto inline (que, com leading < 1, começa acima
      // do wrapper): alinha os dois para o vidro cobrir o texto real.
      const wrapperBox = textEl.parentElement.getBoundingClientRect()
      canvas.style.left = `${box.left - wrapperBox.left - pad}px`
      canvas.style.top = `${box.top - wrapperBox.top - pad}px`
      canvas.style.width = `${cssWidth}px`
      canvas.style.height = `${cssHeight}px`
      const width = Math.round(cssWidth * dpr)
      const height = Math.round(cssHeight * dpr)
      canvas.width = width
      canvas.height = height

      const textCanvas = document.createElement('canvas')
      textCanvas.width = width
      textCanvas.height = height
      const ctx = textCanvas.getContext('2d')
      ctx.font = `${style.fontWeight} ${fontSize * dpr}px ${style.fontFamily}`
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${parseFloat(style.letterSpacing || 0) * dpr}px`
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = '#fff'
      ctx.fillText(text, pad * dpr, (pad + baseline) * dpr)

      const sharp = drawAlpha(textCanvas, width, height, 0)
      const bevel = drawAlpha(textCanvas, width, height, fontSize * dpr * 0.016)
      const body = drawAlpha(textCanvas, width, height, fontSize * dpr * 0.09)
      const data = new Uint8Array(width * height * 4)
      for (let i = 0; i < data.length; i += 4) {
        data[i] = sharp[i + 3]
        data[i + 1] = bevel[i + 3]
        data[i + 2] = body[i + 3]
        data[i + 3] = 255
      }
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)

      gl.viewport(0, 0, width, height)
      gl.uniform2f(u.uRes, width, height)
      gl.uniform1f(u.uFs, fontSize * dpr)
      Object.assign(layout, { dpr, fontSize, pad, ready: true })
    }

    let visible = true
    const render = (ratio = 1) => {
      const light = getLight()
      if (!layout.ready || !light || !visible) return

      const { dpr } = layout
      const canvasBox = canvas.getBoundingClientRect()
      const lightBox = light.getBoundingClientRect()
      const cardBox = light.parentElement.getBoundingClientRect()

      const x = (lightBox.left + lightBox.width / 2 - canvasBox.left) * dpr
      const y = (lightBox.top + lightBox.height / 2 - canvasBox.top) * dpr
      if (!motion.ready) Object.assign(motion, { ready: true, x, y })
      const k = Math.min(1, 0.1 * ratio)
      motion.vx += ((x - motion.x) / ratio - motion.vx) * k
      motion.vy += ((y - motion.y) / ratio - motion.vy) * k
      motion.x = x
      motion.y = y

      gl.uniform2f(u.uLight, x, y)
      gl.uniform1f(u.uLightR, (light.offsetWidth / 2) * dpr)
      gl.uniform1f(u.uBlur, 35 * dpr)
      gl.uniform2f(u.uVel, motion.vx / dpr, motion.vy / dpr)
      gl.uniform1f(u.uCardTop, (cardBox.top - canvasBox.top) * dpr)
      gl.uniform1f(u.uCardH, cardBox.height * dpr)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const rebuild = () => {
      build()
      render()
    }

    let alive = true
    // O ResizeObserver só reconstrói quando o tamanho de fato muda: ele dispara
    // logo ao observar, e a reconstrução (3 canvases desfocados + leitura de
    // pixels) é o passo mais caro do hero.
    let lastSize = ''
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const size = `${Math.round(width)}x${Math.round(height)}`
      if (size === lastSize || !layout.ready) return
      lastSize = size
      rebuild()
    })
    // O ResizeObserver não reage a elementos inline: observa o wrapper.
    observer.observe(textEl.parentElement)

    // Primeira construção com a fonte final já carregada e só quando a tela de
    // carregamento libera (contador parado no 100), para o custo não aparecer
    // como travada na contagem. A tela espera pelo `markHeroReady`.
    Promise.all([document.fonts?.ready, heroPrepare]).then(() => {
      if (!alive) return
      const box = textEl.parentElement.getBoundingClientRect()
      lastSize = `${Math.round(box.width)}x${Math.round(box.height)}`
      rebuild()
      markHeroReady()
    })

    // Só renderiza com o texto na tela.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    io.observe(canvas)

    // O loop por quadro (que lê posições do DOM) só começa depois da tela de
    // carregamento; antes disso ele só competiria com a animação dela.
    const mm = gsap.matchMedia()
    const tick = () => render(gsap.ticker.deltaRatio(60))
    introDone.then(() => {
      if (!alive) return
      mm.add(MOTION_OK, () => {
        gsap.ticker.add(tick)
        return () => gsap.ticker.remove(tick)
      })
    })

    return () => {
      alive = false
      observer.disconnect()
      io.disconnect()
      mm.revert()
      gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [text, getLight])

  return (
    <span className="relative inline-block">
      <span ref={textRef} className={supported ? 'text-transparent' : fallbackClassName}>
        {text}
      </span>
      {supported && (
        <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute" />
      )}
    </span>
  )
}

export default GlassTextGL
