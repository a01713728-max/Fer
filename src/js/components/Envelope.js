import EnvelopeAnimation from '../animations/EnvelopeAnimation.js';

export default class Envelope {
  constructor(atmosphere) {
    this.wrapper = document.getElementById('envelope-container');
    this.correctZone = document.getElementById('envelope-correct-zone');
    this.isOpened = false; // Estado de control
    
    if (!this.wrapper || !this.correctZone) return;

    // Inicializamos la coreografía
    this.animation = new EnvelopeAnimation(this.wrapper, atmosphere);

    this.initEvents();
  }

  initEvents() {
    this.wrapper.addEventListener('click', (e) => {
      if (this.isOpened) return; // Bloquea si ya se abrió

      if (this.correctZone.contains(e.target)) {
        this.handleCorrectClick();
      } else {
        this.triggerRejection();
      }
    });
  }

  triggerRejection() {
    // Removemos la clase para poder reiniciar la animación si clica varias veces
    this.wrapper.classList.remove('is-vibrating');
    
    // Forzamos un reflow del DOM para que la animación se reinicie
    void this.wrapper.offsetWidth;
    
    // Aplicamos la animación de vibración elegante
    this.wrapper.classList.add('is-vibrating');
  }

  handleCorrectClick() {
    this.isOpened = true; // Bloquear interacciones futuras
    this.correctZone.style.cursor = 'default'; // Accesibilidad visual
    this.correctZone.blur(); // Quitar foco de teclado
    
    // Disparar la magia
    this.animation.play();
    console.log('🎬 Secuencia cinematográfica iniciada.');
  }
}