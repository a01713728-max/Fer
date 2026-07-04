import { gsap } from 'gsap';
import { storyData } from '../data/storyContent.js';

const DEFAULT_CONFIG = {
  scrollDuration: 1.8,
  fadeDuration: 1.5,
  yOffset: 30
};

export default class LetterRevealAnimation {
  constructor(container, paperElement = null) {
    this.container = container;
    this.paperElement = paperElement; 
    this.data = storyData.letter;
    this.animatedElements = [];
  }

  buildDOM() {
    this.container.innerHTML = ''; 

    const title = document.createElement('h2');
    title.classList.add('letter-title');
    title.textContent = this.data.title;
    this.container.appendChild(title);
    this.animatedElements.push(title);

    const greeting = document.createElement('p');
    greeting.classList.add('letter-greeting');
    greeting.textContent = this.data.greeting;
    this.container.appendChild(greeting);
    this.animatedElements.push(greeting);

    const initialSections = this.data.sections.filter(sec => sec.visibleAtStart);
    
    initialSections.forEach(section => {
      const paragraph = document.createElement('p');
      paragraph.classList.add('letter-paragraph');
      paragraph.textContent = section.text;
      this.container.appendChild(paragraph);
      this.animatedElements.push(paragraph);
    });
  }

  getRevealTimeline() {
    this.buildDOM();
    const tl = gsap.timeline();
    if (this.animatedElements.length === 0) return tl;

    gsap.set(this.animatedElements, { opacity: 0, y: 20 });
    tl.to(this.animatedElements, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      stagger: 0.4,
      ease: 'power2.out'
    });
    return tl;
  }

  appendNarrativeSection(sectionId, config = {}) {
    const tl = gsap.timeline();
    const animSettings = { ...DEFAULT_CONFIG, ...config };
    const sectionData = this.data.sections.find(sec => sec.id === sectionId);
    
    if (!sectionData) return tl;

    const paragraph = document.createElement('p');
    paragraph.classList.add('letter-paragraph');
    
    if (sectionData.emotionalWeight === 'high') {
      paragraph.style.marginTop = '2.5rem';
      paragraph.dataset.emotion = 'high';
    }

    paragraph.textContent = sectionData.text;
    gsap.set(paragraph, { opacity: 0, y: animSettings.yOffset });
    this.container.appendChild(paragraph);

    if (this.paperElement) {
      const style = window.getComputedStyle(paragraph);
      const addedHeight = paragraph.offsetHeight + parseFloat(style.marginBottom || 0) + parseFloat(style.marginTop || 0);
      
      // CORRECCIÓN: Suavizamos el desplazamiento para que no suba tanto
      const scrollAmount = addedHeight * 0.6;

      tl.to(this.paperElement, {
        y: `-=${scrollAmount}px`,
        duration: animSettings.scrollDuration,
        ease: 'power2.inOut'
      }, 0);
    }

    tl.to(paragraph, {
      opacity: 1,
      y: 0,
      duration: animSettings.fadeDuration,
      ease: 'power2.out'
    }, "<0.4");

    return tl;
  }

  prepareEndingSceneContainer() {
    if (!this.container.querySelector('.ending-scene')) {
      const endingScene = document.createElement('div');
      endingScene.classList.add('ending-scene');
      this.container.appendChild(endingScene);
    }
  }
}