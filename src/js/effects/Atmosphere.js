/**
 * Atmosphere Engine
 * Sistema de partículas de alto rendimiento (Polvo y Corazones sutiles).
 */
export default class Atmosphere {
  constructor() {
    this.canvas = document.getElementById('atmosphere-canvas');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.hearts = [];
    this.isActive = false;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    // Soporte para pantallas retina (nitidez)
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.initEntities();
  }

  initEntities() {
    this.particles = [];
    this.hearts = [];
    
    // Polvo iluminado (pocas unidades, elegantes)
    const numParticles = Math.min(window.innerWidth / 15, 80);
    for (let i = 0; i < numParticles; i++) {
      this.particles.push(this.createParticle());
    }

    // Corazones discretos (reducimos cantidad al aumentar tamaño para mantener sutiliza)
    for (let i = 0; i < 3; i++) { // <-- Cantidad ajustada a 3
      this.hearts.push(this.createHeart());
    }
  }

  createParticle() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      size: Math.random() * 1.5 + 0.5,
      speedY: Math.random() * 0.2 + 0.1, // Movimiento muy lento
      alpha: Math.random() * 0.4 + 0.1
    };
  }

  createHeart() {
    return {
      x: Math.random() * this.width,
      y: this.height + Math.random() * 200, // Nacen desde abajo
      size: Math.random() * 10 + 15, // <-- TAMAÑO AUMENTADO (Rango 15-25px, antes 4-10px)
      speedY: Math.random() * 0.4 + 0.3, // <-- VELOCIDAD LIGERAMENTE AUMENTADA (Rango 0.3-0.7px)
      drift: Math.random() * 2 - 1, // Oscilación suave lateral
      alpha: Math.random() * 0.15 + 0.05, // Muy transparentes
      angle: 0
    };
  }
  burstHearts() {
    // Genera 3 corazones elegantes desde el centro de la pantalla
    for (let i = 0; i < 3; i++) {
      this.hearts.push({
        x: (this.width / 2) + (Math.random() * 80 - 40), // Cerca del centro
        y: (this.height / 2) + 50,
        size: Math.random() * 8 + 15,
        speedY: Math.random() * 0.8 + 0.6, // Un poco más rápidos al salir
        drift: Math.random() * 2 - 1,
        alpha: Math.random() * 0.4 + 0.2, // Más opacos para destacar
        angle: 0
      });
    }
  }

  drawHeart(x, y, size, alpha) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.fillStyle = `rgba(184, 92, 92, ${alpha})`;
    this.ctx.beginPath();
    // Ecuación bezier para un corazón perfecto
    this.ctx.moveTo(0, size / 4);
    this.ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, size / 4);
    this.ctx.bezierCurveTo(-size / 2, size / 1.5, 0, size, 0, size * 1.2);
    this.ctx.bezierCurveTo(0, size, size / 2, size / 1.5, size / 2, size / 4);
    this.ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, size / 4);
    this.ctx.fill();
    this.ctx.restore();
  }

  render = () => {
    if (!this.isActive) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Renderizar Polvo
    this.ctx.fillStyle = '#FFFFFF';
    this.particles.forEach(p => {
      p.y -= p.speedY;
      if (p.y < -10) p.y = this.height + 10; // Bucle
      
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Renderizar Corazones
    this.hearts.forEach(h => {
      h.y -= h.speedY;
      h.angle += 0.02;
      h.x += Math.sin(h.angle) * h.drift * 0.5; // Movimiento orgánico ondulante

      if (h.y < -50) Object.assign(h, this.createHeart()); // Reciclar al salir
      
      this.drawHeart(h.x, h.y, h.size, h.alpha);
    });

    requestAnimationFrame(this.render);
  }

  start() {
    this.isActive = true;
    this.render();
  }
}