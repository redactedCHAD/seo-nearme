/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Renderer, Program, Mesh, Triangle, Color } from 'https://cdn.skypack.dev/ogl';

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Scrolled Header Logic ---
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // --- 2. Smooth Scroll Logic ---
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href) {
        const targetElement = document.querySelector<HTMLElement>(href);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // --- 3. FAQ Accordion Logic ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionButton = item.querySelector<HTMLButtonElement>('.faq-question');
    const answerPanel = item.querySelector<HTMLElement>('.faq-answer');

    if (questionButton && answerPanel) {
      questionButton.addEventListener('click', () => {
        const isExpanded = questionButton.getAttribute('aria-expanded') === 'true';

        questionButton.setAttribute('aria-expanded', String(!isExpanded));
        if (!isExpanded) {
          answerPanel.style.maxHeight = answerPanel.scrollHeight + 'px';
        } else {
          answerPanel.style.maxHeight = '0px';
        }
      });
    }
  });


  // --- 4. Scroll Animation Logic ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  revealElements.forEach(element => {
    observer.observe(element);
  });

  // --- 5. Interactive Tilt Effect ---
  const cardsToTilt = document.querySelectorAll<HTMLElement>('.card.clickable');

  cardsToTilt.forEach(card => {
    const initialTransform = 'perspective(1000px) scale(1)';

    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { width, height } = rect;

      const rotateX = (y / height - 0.5) * -20;
      const rotateY = (x / width - 0.5) * 20;
      const hoverBase = 'scale(1.03)';
      const hoverTransform = `translateY(-8px) ${hoverBase}`;

      card.style.transition = 'transform 0.1s linear';
      card.style.transform = `perspective(1000px) ${hoverTransform} rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      card.style.transform = initialTransform;
    });
  });

  // --- 6. Active Nav Link on Scroll Logic ---
  const sections = document.querySelectorAll<HTMLElement>('section[id]');
  const allNavLinks = document.querySelectorAll<HTMLAnchorElement>('nav a');

  const observerOptions = {
    root: null,
    rootMargin: '-70px 0px -50% 0px', // Adjusts the "trigger zone" to be the top part of the viewport
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        allNavLinks.forEach(link => {
          link.classList.remove('active-link');
          const href = link.getAttribute('href');
          if (href && href.includes(id)) {
            link.classList.add('active-link');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // --- 7. Aurora Background ---
  initAuroraBackground();
});


function initAuroraBackground() {
    const container = document.querySelector<HTMLDivElement>('.prismatic-burst-background');
    if (!container) return;

    // --- Config based on user request ---
    const config = {
        colorStops: ["#3A29FF", "#FF94B4", "#FF3232"],
        blend: 0.5,
        amplitude: 1.0,
        speed: 0.5
    };

    // --- Shaders ---
    const vertexShader = `#version 300 es
      in vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShader = `#version 300 es
      precision highp float;

      uniform float uTime;
      uniform float uAmplitude;
      uniform vec3 uColorStops[3];
      uniform vec2 uResolution;
      uniform float uBlend;

      out vec4 fragColor;

      vec3 permute(vec3 x) {
        return mod(((x * 34.0) + 1.0) * x, 289.0);
      }

      float snoise(vec2 v){
        const vec4 C = vec4(
            0.211324865405187, 0.366025403784439,
            -0.577350269189626, 0.024390243902439
        );
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);

        vec3 p = permute(
            permute(i.y + vec3(0.0, i1.y, 1.0))
          + i.x + vec3(0.0, i1.x, 1.0)
        );

        vec3 m = max(
            0.5 - vec3(
                dot(x0, x0),
                dot(x12.xy, x12.xy),
                dot(x12.zw, x12.zw)
            ), 
            0.0
        );
        m = m * m;
        m = m * m;

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

      struct ColorStop {
        vec3 color;
        float position;
      };

      #define COLOR_RAMP(colors, factor, finalColor) {              \
        int index = 0;                                            \
        for (int i = 0; i < 2; i++) {                               \
           ColorStop currentColor = colors[i];                    \
           bool isInBetween = currentColor.position <= factor;    \
           index = int(mix(float(index), float(i), float(isInBetween))); \
        }                                                         \
        ColorStop currentColor = colors[index];                   \
        ColorStop nextColor = colors[index + 1];                  \
        float range = nextColor.position - currentColor.position; \
        float lerpFactor = (factor - currentColor.position) / range; \
        finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        
        ColorStop colors[3];
        colors[0] = ColorStop(uColorStops[0], 0.0);
        colors[1] = ColorStop(uColorStops[1], 0.5);
        colors[2] = ColorStop(uColorStops[2], 1.0);
        
        vec3 rampColor;
        COLOR_RAMP(colors, uv.x, rampColor);
        
        float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
        height = exp(height);
        height = (uv.y * 2.0 - height + 0.2);
        float intensity = 0.6 * height;
        
        float midPoint = 0.20;
        float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
        
        vec3 auroraColor = intensity * rampColor;
        
        fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
      }
    `;

    // --- OGL Setup ---
    const renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: true
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.inset = '0';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    if ((geometry.attributes as any).uv) {
        delete (geometry.attributes as any).uv;
    }

    const colorStopsArray = config.colorStops.map(hex => {
        const c = new Color(hex);
        return [c.r, c.g, c.b];
    });

    const program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            uAmplitude: { value: config.amplitude },
            uColorStops: { value: colorStopsArray },
            uResolution: { value: [gl.canvas.width, gl.canvas.height] },
            uBlend: { value: config.blend }
        }
    });

    const mesh = new Mesh(gl, { geometry, program });

    // --- Event Listeners & Observers ---
    const resize = () => {
        const w = container.clientWidth || 1;
        const h = container.clientHeight || 1;
        renderer.setSize(w, h);
        program.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    // --- Animation Loop ---
    const update = (t: number) => {
        // time in seconds, scaled by speed
        program.uniforms.uTime.value = (t * 0.001) * config.speed;
        renderer.render({ scene: mesh });
        requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
}
