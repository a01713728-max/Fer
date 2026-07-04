import LoaderManager from './LoaderManager.js';
import Atmosphere from '../effects/Atmosphere.js';
import Envelope from '../components/Envelope.js';

/**
 * Clase principal de la Aplicación
 * Coordina la inicialización de todos los subsistemas.
 */
export default class App {
  constructor() {
    this.loader = new LoaderManager();
    this.atmosphere = new Atmosphere(); // Instanciamos la atmósfera
    // 3. Inicializamos el sobre, pasándole la atmósfera
    this.envelope = new Envelope(this.atmosphere);
  }

  /**
   * Punto de arranque de la experiencia.
   */
  async init() {
    // 1. Bloqueo estricto del scroll
    document.body.style.overflow = 'hidden';

    this.setupPreloader();

    // Bloqueamos la ejecución hasta que el Loader termine
    await this.loader.loadAll();
    
    // Una vez cargado, ocultamos la UI de carga
    this.loader.hide();
    
    // Iniciamos la narrativa
    this.startExperience();
  }

  /**
   * Registra los recursos críticos antes de empezar.
   */
  setupPreloader() {
    // 1. Precargar tipografías (Nativo del navegador)
    this.loader.addResource(document.fonts.ready);

    // 2. Simulador de carga temporal (1.5 segundos)
    // TODO: Eliminar esto cuando añadamos imágenes/audio reales.
    const fakeDelay = new Promise(resolve => setTimeout(resolve, 1500));
    this.loader.addResource(fakeDelay);
  }

  /**
   * Arranca las animaciones y módulos de la web.
   */
  startExperience() {
    console.log('✨ Assets cargados. La experiencia ha comenzado.');
    
    // Encendemos el fondo cinematográfico
    this.atmosphere.start();

    // 3. Inicializamos el sobre
    this.envelope = new Envelope();
  }
}