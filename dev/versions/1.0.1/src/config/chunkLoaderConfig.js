/**
 * Configuración del ChunkLoader
 * Este archivo contiene todos los parámetros personalizables del sistema de carga de chunks
 */

// Configuración de márgenes según resolución
const marginConfig = {
  // Márgenes para diferentes rangos de resolución
  breakpoints: [
    {
      maxWidth: 480, // Móviles pequeños
      margin: '200px 0px 200px 0px'
    },
    {
      maxWidth: 768, // Tablets
      margin: '300px 0px 300px 0px'
    },
    {
      maxWidth: 1024, // Laptops
      margin: '400px 0px 400px 0px'
    },
    {
      maxWidth: 1440, // Desktops
      margin: '500px 0px 500px 0px'
    },
    {
      maxWidth: Infinity, // Pantallas grandes
      margin: '600px 0px 600px 0px'
    }
  ],
  
  // Margen por defecto si no se puede determinar la resolución
  defaultMargin: '500px 0px 500px 0px',
  
  // Intervalo de actualización del margen (en milisegundos)
  updateInterval: 1000
};

export const chunkLoaderConfig = {
  // Configuración del IntersectionObserver
  observer: {
    // Función para obtener el margen según la resolución
    getMargin: () => {
      const width = window.innerWidth;
      const breakpoint = marginConfig.breakpoints.find(bp => width <= bp.maxWidth);
      return breakpoint ? breakpoint.margin : marginConfig.defaultMargin;
    },
    
    // Umbral de intersección (0-1)
    // 0.01 significa que el elemento debe estar al menos 1% visible
    threshold: 0.01
  },

  // Configuración de la caché
  cache: {
    // Duración de la caché en milisegundos (5 minutos)
    duration: 5 * 60 * 1000,
    
    // Número máximo de elementos en caché
    maxSize: 5,
    
    // Intervalo de limpieza automática de la caché en milisegundos (30 segundos)
    cleanupInterval: 30 * 1000,

    // Configuración de persistencia
    persistence: {
      // Habilitar persistencia en localStorage
      enabled: true,
      
      // Clave para almacenar en localStorage
      storageKey: 'chunk_loader_cache',
      
      // Intervalo para guardar en localStorage (5 minutos)
      saveInterval: 5 * 60 * 1000
    }
  },

  // Configuración de las animaciones
  animations: {
    // Duración de la transición de carga en milisegundos
    loadDelay: 100,
    
    // Duración de la transición de descarga en milisegundos
    unloadDelay: 200,
    
    // Clases CSS para las transiciones
    classes: {
      // Clase base para las transiciones
      base: 'transition-all duration-200 ease-in-out',
      
      // Clase cuando el contenido está visible
      visible: 'opacity-100 translate-y-0 scale-100',
      
      // Clase cuando el contenido está oculto
      hidden: 'opacity-0',
      
      // Clase cuando el contenido está saliendo
      exiting: 'translate-y-5 scale-98'
    }
  },

  // Configuración del placeholder
  placeholder: {
    // Clases CSS para el contenedor del placeholder
    container: 'absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg shadow-inner border border-dashed border-gray-300',
    
    // Clases CSS para el spinner de carga
    spinner: 'animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900',
    
    // Textos
    texts: {
      loading: 'Precargando contenido...',
      empty: 'Espacio reservado para contenido.',
      error: 'Error al cargar el contenido. Reintentando...',
      retry: 'Reintentar'
    }
  },

  // Configuración de manejo de errores
  errorHandling: {
    // Número máximo de reintentos
    maxRetries: 3,
    
    // Tiempo entre reintentos en milisegundos
    retryDelay: 1000,
    
    // Tiempo máximo de espera para la carga
    timeout: 10000,
    
    // Habilitar recuperación automática
    autoRecovery: true,
    
    // Tiempo de visualización de errores
    errorDisplayTime: 5000
  },

  // Configuración de rendimiento
  performance: {
    // Habilitar compresión de datos
    compression: {
      enabled: true,
      // Nivel de compresión (1-9)
      level: 6
    },
    
    // Configuración de memoria
    memory: {
      // Límite de memoria en MB
      limit: 50,
      
      // Intervalo de limpieza de memoria en milisegundos
      cleanupInterval: 60 * 1000
    }
  }
}; 