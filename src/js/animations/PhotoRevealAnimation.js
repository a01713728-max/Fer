import { gsap } from 'gsap';
import { storyData } from '../data/storyContent.js';

const CONFIG = {
  animDuration: 1.6,
  staggerTime: 1.0,
  scrollDuration: 2.0
};

export default class PhotoRevealAnimation {
  constructor(containerElement, revealGroup, paperElement = null, options = {}) {
    this.container = containerElement;
    this.revealGroup = revealGroup;
    this.paperElement = paperElement;
    this.options = { variant: 'default', ...options }; // 'default' | 'featured'
    this.photosData = storyData.photos.filter(p => p.revealGroup === this.revealGroup);
    this.animatedElements = [];
    this.isBuilt = false;
    this.isInteractive = false; 
  }

  buildDOM() {
    if (this.isBuilt || this.photosData.length === 0) return;

    const isFeatured = this.options.variant === 'featured';

    this.groupWrapper = document.createElement('section');
    this.groupWrapper.classList.add('memory-group');
    
    // Asignación semántica basada en la variante
    if (isFeatured) {
      this.groupWrapper.classList.add('memory-group--featured');
      this.groupWrapper.style.minHeight = '480px'; // Más aire para la foto principal
    } else {
      this.groupWrapper.style.minHeight = '320px';
    }

    const containerWidth = this.container.clientWidth;
    const maxOffsetPx = Math.min(containerWidth * 0.18, 90); 

    this.photosData.forEach((photo, index) => {
      const figure = document.createElement('figure');
      figure.classList.add('photo-print');

      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt;
      img.loading = 'lazy';
      img.decoding = 'async';

      figure.appendChild(img);
      this.groupWrapper.appendChild(figure);
      this.animatedElements.push(figure);

      let targetRot = 0;
      let targetX = 0;

      // Lógica de layout controlada por la variante
      if (isFeatured) {
        // Rotación casi imperceptible y centrada
        targetRot = (Math.random() * 1) - 0.5; // Entre -0.5deg y 0.5deg
        targetX = 0;
      } else if (this.photosData.length === 1) {
        targetRot = this.revealGroup % 2 === 0 ? 2.5 : -2.5;
        targetX = 0;
      } else {
        const isEven = index % 2 === 0;
        const baseAngle = this.revealGroup % 2 === 0 ? 4.8 : 3.5;
        targetRot = isEven ? baseAngle : -baseAngle;
        const direction = this.revealGroup % 2 === 0 ? -1 : 1;
        targetX = isEven ? -(maxOffsetPx) * direction : (maxOffsetPx) * direction;
        targetRot += (Math.random() * 1.5 - 0.75);
      }
      
      const zIndex = index + 1;
      figure.style.setProperty('--target-rot', `${targetRot}deg`);
      figure.style.setProperty('--target-x', `${targetX}px`);
      figure.dataset.baseZIndex = zIndex;
      figure.style.zIndex = zIndex;

      // Interacción preservada
      figure.addEventListener('mouseenter', () => {
        if (!this.isInteractive) return; 
        figure.style.zIndex = 50; 
        gsap.to(figure, {
          '--scale': 1.05,
          '--rot': '0deg',
          boxShadow: '0 12px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04)',
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      figure.addEventListener('mouseleave', () => {
        if (!this.isInteractive) return;
        figure.style.zIndex = figure.dataset.baseZIndex; 
        gsap.to(figure, {
          '--scale': 1,
          '--rot': `${targetRot}deg`,
          boxShadow: '0 4px 15px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)',
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    });

    this.container.appendChild(this.groupWrapper);
    this.isBuilt = true;
  }

  getRevealTimeline() {
    this.buildDOM();

    const tl = gsap.timeline();
    if (this.animatedElements.length === 0) return tl;

    const isFeatured = this.options.variant === 'featured';

    if (this.paperElement) {
      if (isFeatured) {
        // ==========================================
        // COMPORTAMIENTO CLÍMAX: Anticipación visual
        // ==========================================
        tl.to(this.paperElement, {
          y: () => {
            // Se ejecuta dinámicamente en el milisegundo en que inicia la animación
            const currentY = parseFloat(gsap.getProperty(this.paperElement, "y")) || 0;
            const rect = this.groupWrapper.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Queremos que el centro del contenedor quede perfectamente enfocado
            // (al 45% de la pantalla para dejar espacio visual arriba)
            const elementCenter = rect.top + (rect.height / 2);
            const targetCenter = windowHeight * 0.45; 
            
            // Calculamos cuánto debemos empujar la carta hacia arriba
            const offsetToMove = elementCenter - targetCenter;
            
            return currentY - offsetToMove;
          },
          duration: 3.8, // Movimiento muy lento y solemne
          ease: 'sine.inOut'
        }, 0);
      } else {
        // ==========================================
        // COMPORTAMIENTO NORMAL: Fotografías anteriores
        // ==========================================
        const style = window.getComputedStyle(this.groupWrapper);
        const margins = parseFloat(style.marginTop || 0) + parseFloat(style.marginBottom || 0);
        let addedHeight = this.groupWrapper.offsetHeight + margins; 
        
        let scrollAmount = addedHeight * 0.5;
        if (scrollAmount < 120) scrollAmount = 120; 

        tl.to(this.paperElement, {
          y: `-=${scrollAmount}px`,
          duration: CONFIG.scrollDuration,
          ease: 'power2.inOut'
        }, 0);
      }
    }

    gsap.set(this.animatedElements, {
      '--y': isFeatured ? '120px' : '60px', // La protagonista sube desde más abajo
      '--scale': 0.85,
      '--rot': '0deg',
      '--x': '0px', 
      opacity: 0
    });

    // Sincronización narrativa:
    // Las fotos normales aparecen casi con el scroll ("<0.2").
    // La protagonista espera a que la carta haya avanzado bastante (2.5s de los 3.8s totales)
    // para crear el sentimiento de anticipación revelando un espacio vacío primero.
    const revealStartTime = isFeatured ? 2.5 : "<0.2"; 

    tl.to(this.animatedElements, {
      '--y': '0px',
      '--scale': 1,
      '--rot': (i, el) => el.style.getPropertyValue('--target-rot'),
      '--x': (i, el) => el.style.getPropertyValue('--target-x'),
      opacity: 1,
      duration: isFeatured ? 3.0 : CONFIG.animDuration, 
      stagger: CONFIG.staggerTime,
      ease: isFeatured ? 'sine.out' : 'power3.out' 
    }, revealStartTime)
    .call(() => { this.isInteractive = true; }); 

    return tl;
  }
}