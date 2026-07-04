import { gsap } from 'gsap';
import LetterRevealAnimation from './LetterRevealAnimation.js';
import PhotoRevealAnimation from './PhotoRevealAnimation.js';
import AudioManager from '../audio/AudioManager.js';

const NARRATIVE_PAUSE = "+=2.5"; 
const CLIMAX_PAUSE = "+=3.5"; 
const SILENCE_BEFORE_FEATURED = "+=3.0"; 
const CONTEMPLATION_PAUSE = "+=4.0";     

const CLIMAX_ANIMATION = {
  scrollDuration: 2.8, 
  fadeDuration: 2.5,   
  yOffset: 45          
};

export default class EnvelopeAnimation {
  constructor(container, atmosphere) {
    this.container = container;
    this.flapTop = container.querySelector('.flap-top');
    this.letter = container.querySelector('.letter');
    this.letterContent = container.querySelector('.letter-content');
    this.glow = container.querySelector('.inner-glow');
    this.atmosphere = atmosphere;
    
    if (!this.letter || !this.letterContent) console.error("🚨 ALERTA: Faltan contenedores");

    this.letter.style.height = 'max-content';
    this.letter.style.minHeight = '100%';
    this.letter.style.paddingBottom = '25vh'; 

    this.letterReveal = new LetterRevealAnimation(this.letterContent, this.letter);
    this.photoRevealGroup1 = new PhotoRevealAnimation(this.letterContent, 1, this.letter);
    this.photoRevealGroup2 = new PhotoRevealAnimation(this.letterContent, 2, this.letter);
    this.photoRevealGroup3 = new PhotoRevealAnimation(this.letterContent, 3, this.letter, { variant: 'featured' });

    this.timeline = gsap.timeline({ paused: true });
    this.buildSequence();
  }

  getHeartOffsets(index, target) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const vmin = Math.min(vw, vh);

    const targetCenterX = vw * 0.5;
    const targetCenterY = vh * 0.42; 

    const offsets = [
      { x: -vmin * 0.16, y: -vmin * 0.12, rot: -12 },
      { x: vmin * 0.16,  y: -vmin * 0.12, rot: 12 },
      { x: -vmin * 0.19, y: vmin * 0.05,  rot: -6 },
      { x: vmin * 0.19,  y: vmin * 0.05,  rot: 6 },
      { x: 0,            y: vmin * 0.22,  rot: 0 }
    ];

    const rect = target.getBoundingClientRect();
    const currentCenterX = rect.left + rect.width / 2;
    const currentCenterY = rect.top + rect.height / 2;

    const finalX = targetCenterX + offsets[index].x;
    const finalY = targetCenterY + offsets[index].y;

    const currentTransformX = parseFloat(gsap.getProperty(target, "x")) || 0;
    const currentTransformY = parseFloat(gsap.getProperty(target, "y")) || 0;

    return {
      x: currentTransformX + (finalX - currentCenterX),
      y: currentTransformY + (finalY - currentCenterY),
      rotation: offsets[index].rot,
      scale: vw < 768 ? 0.38 : 0.45 
    };
  }

  buildSequence() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const audioManager = new AudioManager();

    if (reducedMotion) {
      this.timeline
         // RESET ESTADO INICIAL
         .set(this.container, { clearProps: "all" })
         .set(this.flapTop, { rotateX: 0 })
         .set(this.letter, { clearProps: "all" })
         
         .to(this.flapTop, { rotateX: 180, duration: 0.5 })
         .set(this.letter, { zIndex: 50 })
         .to(this.letter, { y: '-30vh', scale: 1, duration: 0.8 })
         .call(() => { audioManager.playWithFadeIn(); }, null, "<0.2")
         .add(this.letterReveal.getRevealTimeline(), "+=0.2")
         .add(this.photoRevealGroup1.getRevealTimeline(), "+=0.5")
         .add(this.letterReveal.appendNarrativeSection('body-1'), "+=0.5")
         .add(this.photoRevealGroup2.getRevealTimeline(), "+=0.5")
         .add(this.letterReveal.appendNarrativeSection('closing', CLIMAX_ANIMATION), "+=0.5")
         .add(this.photoRevealGroup3.getRevealTimeline(), "+=1.0")
         .to([this.container, this.letter, this.glow], { opacity: 0.15, duration: 2.0 }, "+=2.0")
         .call(() => { this.buildFinaleSequence(true); }, null, "+=1.0");
      return;
    }

    this.timeline
      // ==========================================
      // CORRECCIÓN 2: RESET AGRESIVO DE ESTADOS
      // ==========================================
      // Destruimos cualquier estado previo (CSS o hover) y forzamos el estado base limpio
      .set(this.container, { clearProps: "all" })
      .set(this.container, { scale: 1, y: 0, opacity: 1 })
      .set(this.flapTop, { rotateX: 0 })
      // Hacemos lo mismo para la carta para garantizar que arranca de scale 0.95
      .set(this.letter, { clearProps: "all" })
      .set(this.letter, { y: 0, scale: 0.95, rotationX: 0, rotationY: 0, rotationZ: 0 })
      
      // Comienza la animación original
      .to(this.container, { scale: 0.98, duration: 0.2, ease: 'power2.out' })
      .to(this.flapTop, { rotateX: 180, duration: 1.4, ease: 'power2.inOut' }, "+=0.2")
      .set(this.letter, { zIndex: 50 }, "-=0.7")
      .to(this.glow, { opacity: 1, duration: 1.0, ease: 'power1.inOut' }, "-=0.7")
      
      .to(this.letter, { y: '-15vh', duration: 1.8, ease: 'power3.inOut' }, "-=0.5")
      .call(() => { audioManager.playWithFadeIn(); }, null, "<0.8")
      .to(this.container, { scale: 1.05, duration: 2.5, ease: 'sine.inOut' }, "<")
      .call(() => { if (this.atmosphere) this.atmosphere.burstHearts(); }, null, "-=1.5")
      
      .to(this.letter, { y: '-45vh', duration: 1.5, ease: 'power2.inOut' }, "-=0.2")
      .to(this.letter, { rotationX: 12, rotationY: -4, rotationZ: 1.5, duration: 1.2, ease: 'sine.inOut' }, "+=0.4")
      .to(this.container, { y: '25vh', scale: 0.85, opacity: 0.6, duration: 2.5, ease: 'power3.inOut' }, "+=0.2")
      
      .to(this.letter, {
        y: '-35vh', scale: 1, rotationX: 0, rotationY: 0, rotationZ: 0,
        boxShadow: "0 30px 60px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.05)",
        duration: 2.5, ease: 'power3.inOut'
      }, "<")
      
      .add(this.letterReveal.getRevealTimeline(), "+=1.0")
      .add(this.photoRevealGroup1.getRevealTimeline(), "+=1.5")
      .add(this.letterReveal.appendNarrativeSection('body-1'), NARRATIVE_PAUSE)
      .add(this.photoRevealGroup2.getRevealTimeline(), "+=1.5")
      .add(this.letterReveal.appendNarrativeSection('closing', CLIMAX_ANIMATION), CLIMAX_PAUSE)
      .add(this.photoRevealGroup3.getRevealTimeline(), SILENCE_BEFORE_FEATURED)

      .addLabel("sceneOpening", CONTEMPLATION_PAUSE)
      // ESTA ANIMACIÓN ES LA QUE SE ROMPÍA
      .to(this.container, { scale: 0.96, y: '+=2vh', duration: 5.0, ease: 'sine.inOut' }, "sceneOpening")
      .to(this.letter, {
        boxShadow: "0 10px 25px rgba(0,0,0,0.15), 0 0 10px rgba(255,255,255,0.01)", 
        filter: "brightness(0.95) contrast(0.96)", duration: 5.0, ease: 'sine.inOut'
      }, "sceneOpening")
      .to(this.glow, { opacity: 0.3, duration: 5.0, ease: 'sine.inOut' }, "sceneOpening")

      // ==========================================
      // CORRECCIÓN 1: LIBERACIÓN ABSOLUTA AL BODY (Ya funcionaba)
      // ==========================================
      .addLabel("finaleRelease", "+=2.5")
      .call(() => {
        const photos = document.querySelectorAll('.photo-print');
        
        photos.forEach((photo, index) => {
          const rect = photo.getBoundingClientRect();
          const currentRot = parseFloat(gsap.getProperty(photo, "rotationZ")) || 0;
          const currentScale = parseFloat(gsap.getProperty(photo, "scale")) || 1;

          document.body.appendChild(photo);

          gsap.set(photo, {
            position: 'fixed',
            top: 0,
            left: 0,
            x: rect.left, 
            y: rect.top,  
            width: rect.width,
            height: rect.height,
            margin: 0,
            zIndex: 1000 + index,
            rotationZ: currentRot,
            scale: currentScale,
            transformOrigin: "center center",
            '--x': '0px',
            '--y': '0px',
            '--rot': '0deg',
            '--scale': 1
          });
        });
      }, null, "finaleRelease") 

      .addLabel("finaleStart", "+=3.0")
      
      .to([this.letter, this.glow], { opacity: 0.05, duration: 4.0, ease: 'power2.inOut' }, "finaleStart")
      .call(() => { if (this.atmosphere && typeof this.atmosphere.startFinale === 'function') { this.atmosphere.startFinale(); } }, null, "finaleStart")

      .call(() => { this.buildFinaleSequence(false); }, null, "finaleStart+=1.0");
  }

  buildFinaleSequence(isReducedMotion) {
    const photos = document.querySelectorAll('.photo-print');
    const phrases = document.querySelectorAll('.finale-phrase');
    const audioManager = new AudioManager();
    
    const finalTl = gsap.timeline();

    if (photos.length === 5) {
      finalTl.to(photos, {
        x: (index, target) => this.getHeartOffsets(index, target).x,
        y: (index, target) => this.getHeartOffsets(index, target).y,
        rotationZ: (index, target) => this.getHeartOffsets(index, target).rotation,
        scale: (index, target) => this.getHeartOffsets(index, target).scale,
        boxShadow: "0 15px 35px rgba(0,0,0,0.4)",
        duration: isReducedMotion ? 2.0 : 6.0,
        ease: 'sine.inOut',
        stagger: isReducedMotion ? 0 : 0.3
      });
    }

    if (phrases.length > 0) {
      finalTl.addLabel("phrasesStart", isReducedMotion ? "+=1" : "+=2");
      phrases.forEach((phrase, i) => {
        const isLast = i === phrases.length - 1;
        finalTl.to(phrase, { opacity: 1, y: 0, duration: 3.0, ease: 'power2.out' }, isLast ? "+=2.0" : "+=1.5");
        if (!isLast) { finalTl.to(phrase, { opacity: 0, y: -10, duration: 2.5, ease: 'power2.in' }, "+=3.5"); }
      });
    }

    finalTl.addLabel("preHeartbeat", "+=3.5");

    if (photos.length === 5 && !isReducedMotion) {
      finalTl.to(photos, {
        scale: "+=0.015", rotationZ: "+=0.3", boxShadow: "0 20px 45px rgba(0,0,0,0.5)",
        duration: 0.35, ease: 'power1.inOut', yoyo: true, repeat: 1
      }, "preHeartbeat");
    }

    finalTl.addLabel("fadeAudio", "+=2.0");
    finalTl.call(() => { audioManager.fadeOut(9); }, null, "fadeAudio");
  }

  play() {
    if (this.timeline.isActive() || this.timeline.progress() > 0) return;
    
    // ==============================================================
    // ELIMINACIÓN DE INTERFERENCIAS EXTERNAS ("EL BUG DE LOS POPS")
    // ==============================================================
    
    // 1. Matamos los eventos del ratón para que ningún hover o mousemove 
    // externo pueda seguir afectando el contenedor mientras se anima.
    this.container.style.pointerEvents = 'none';
    
    // 2. Destruimos cualquier 'transition' de CSS nativo. 
    // Si CSS intenta hacer una transición al mismo tiempo que GSAP, se rompe la escala.
    this.container.style.transition = 'none';
    this.letter.style.transition = 'none';
    this.flapTop.style.transition = 'none';
    
    // 3. (Opcional pero recomendado) Si tienes un wrapper superior, también lo bloqueamos
    const wrapper = this.container.closest('.envelope-wrapper');
    if (wrapper) {
      wrapper.style.pointerEvents = 'none';
      wrapper.style.transition = 'none';
    }

    // Forzamos un reflow del navegador para aplicar los bloqueos al instante
    void this.container.offsetWidth; 
    
    // Ahora sí, arrancamos la línea de tiempo limpia
    this.timeline.play();
  }
}