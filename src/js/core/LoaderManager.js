/**
 * LoaderManager
 * Gestiona la cola de recursos críticos y el ciclo de vida de la pantalla de carga.
 */
export default class LoaderManager {
  constructor() {
    this.loaderElement = document.getElementById('global-loader');
    this.appContainer = document.getElementById('app');
    this.queue = []; // Array de promesas a esperar
  }

  /**
   * Añade una promesa a la cola de carga.
   * @param {Promise} promise 
   */
  addResource(promise) {
    this.queue.push(promise);
  }

  /**
   * Inicia la espera de todos los recursos registrados.
   * @returns {Promise} Se resuelve cuando todo ha cargado.
   */
  async loadAll() {
    try {
      // Esperamos a que todas las promesas de la cola se resuelvan
      await Promise.all(this.queue);
    } catch (error) {
      console.error('Error cargando recursos:', error);
      // Podríamos manejar una pantalla de error aquí en el futuro
    }
  }

  /**
   * Oculta el loader y actualiza la accesibilidad.
   */
  hide() {
    // 1. Ocultar visualmente con transición CSS
    this.loaderElement.classList.add('is-loaded');
    
    // 2. Actualizar etiquetas ARIA (Accesibilidad)
    this.loaderElement.setAttribute('aria-busy', 'false');
    this.appContainer.setAttribute('aria-hidden', 'false');
  }
}