import { gsap } from 'gsap';

let instance = null;

export default class AudioManager {
  constructor() {
    if (instance) return instance;
    instance = this;

    this.audioElement = document.getElementById('bg-music');
    this.toggleBtn = document.getElementById('music-toggle');
    
    this.targetVolume = 0.38; // Volumen moderado
    this.hasStarted = false;
    
    if (this.audioElement) {
      this.audioElement.volume = 0;
    }

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggle());
    }
  }

  playWithFadeIn() {
    if (!this.audioElement || this.hasStarted) return;
    
    this.hasStarted = true;
    this.audioElement.volume = 0;
    
    if (this.toggleBtn) {
      this.toggleBtn.removeAttribute('hidden');
      this.updateUI(true);
    }

    const playPromise = this.audioElement.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Fade-in controlado por GSAP
        gsap.to(this.audioElement, {
          volume: this.targetVolume,
          duration: 3.5, // Fundido muy progresivo
          ease: "power1.inOut"
        });
      }).catch(err => {
        console.warn("Autoplay bloqueado por el navegador, esperando interacción manual:", err);
        this.updateUI(false);
      });
    }
  }

  toggle() {
    if (!this.audioElement) return;

    if (this.audioElement.paused) {
      // Reanuda manteniendo el volumen actual (no reinicia el fade)
      this.audioElement.play();
      this.updateUI(true);
    } else {
      this.audioElement.pause();
      this.updateUI(false);
    }
  }

  updateUI(isPlaying) {
    if (!this.toggleBtn) return;
    this.toggleBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    this.toggleBtn.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
  }

  // PREPARADO PARA LA FASE 18
  fadeOut(duration = 4.0) {
    if (!this.audioElement || this.audioElement.paused) return;
    
    gsap.killTweensOf(this.audioElement);
    gsap.to(this.audioElement, {
      volume: 0,
      duration: duration,
      ease: "power1.inOut",
      onComplete: () => {
        this.audioElement.pause();
        this.updateUI(false);
      }
    });
  }
}