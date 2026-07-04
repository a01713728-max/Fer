// Archivo: src/js/data/storyContent.js

export const storyData = {
  letter: {
    title: "Nuestro Primer Capítulo",
    greeting: "Hola, mi amor:",
    sections: [
      { id: "intro", visibleAtStart: true, text: "Siempre he pensado que las mejores historias comienzan de imprevisto, sin guiones ni ensayos. Quería detener un momento el tiempo, en medio de tanto ruido, para dejarte esto aquí, escrito en papel digital." },
      { id: "body-1", visibleAtStart: false, text: "Todavía recuerdo ese día como si fuera ayer. Las risas, las miradas furtivas, y esa extraña sensación de que, de alguna manera, ya nos conocíamos de antes." },
      
      // AJUSTE: Identificador semántico y metadato emocional añadido
      { 
        id: "closing", 
        visibleAtStart: false, 
        text: "He guardado cada uno de estos recuerdos porque quiero que podamos volver a ellos siempre que lo necesitemos.",
        emotionalWeight: "high"
      }
    ]
  },
  
  // Arreglo de fotografías preparado para escalabilidad
  photos: [
    { id: "fer1", src: "/images/fer1.jpg", alt: "Nuestra primera memoria de ese día", note: "", revealGroup: 1 },
    { id: "fer2", src: "/images/fer2.jpg", alt: "Otro ángulo de nuestro recuerdo", note: "", revealGroup: 1 },
    { id: "fer3", src: "/images/fer3.jpg", alt: "Tercera memoria", note: "", revealGroup: 2 },
    { id: "fer4", src: "/images/fer4.jpg", alt: "Cuarta memoria", note: "", revealGroup: 3 },
    { id: "fer5", src: "/images/fer5.jpg", alt: "Quinta memoria", note: "", revealGroup: 3 }
  ],
  
  timeline: [],
  ending: {}
};