import { chunkLoaderConfig } from '../config/chunkLoaderConfig';
import pako from 'pako';

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.cacheUpdateListeners = new Set();
    this.lastCacheState = {
      size: 0,
      maxSize: chunkLoaderConfig.cache.maxSize,
      keys: []
    };
    this.updateTimeout = null;
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      loadTimes: []
    };

    this.initialize();
  }

  initialize() {
    // Cargar caché persistente si está habilitado
    if (chunkLoaderConfig.cache.persistence.enabled) {
      this.loadPersistentCache();
    }

    // Iniciar limpieza automática
    this.startCleanupInterval();

    // Iniciar guardado automático si la persistencia está habilitada
    if (chunkLoaderConfig.cache.persistence.enabled) {
      this.startPersistenceInterval();
    }
  }

  async loadPersistentCache() {
    try {
      const stored = localStorage.getItem(chunkLoaderConfig.cache.persistence.storageKey);
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        if (Date.now() - timestamp < chunkLoaderConfig.cache.duration) {
          const decompressed = pako.inflate(atob(data), { to: 'string' });
          const cacheData = JSON.parse(decompressed);
          this.cache = new Map(Object.entries(cacheData));
          this.notifyCacheUpdate();
        }
      }
    } catch (error) {
      console.error('Error al cargar caché persistente:', error);
      this.metrics.errors++;
    }
  }

  async savePersistentCache() {
    if (!chunkLoaderConfig.cache.persistence.enabled) return;

    try {
      const cacheData = Object.fromEntries(this.cache);
      const jsonString = JSON.stringify(cacheData);
      const compressed = pako.deflate(jsonString, { level: chunkLoaderConfig.performance.compression.level });
      const base64 = btoa(String.fromCharCode.apply(null, compressed));
      
      localStorage.setItem(
        chunkLoaderConfig.cache.persistence.storageKey,
        JSON.stringify({
          data: base64,
          timestamp: Date.now()
        })
      );
    } catch (error) {
      console.error('Error al guardar caché persistente:', error);
      this.metrics.errors++;
    }
  }

  startCleanupInterval() {
    setInterval(() => this.cleanCache(), chunkLoaderConfig.cache.cleanupInterval);
  }

  startPersistenceInterval() {
    setInterval(() => this.savePersistentCache(), chunkLoaderConfig.cache.persistence.saveInterval);
  }

  getMemoryUsage() {
    let total = 0;
    const seen = new WeakSet();

    const getSize = (obj) => {
      if (obj === null || obj === undefined) return 0;
      if (typeof obj !== 'object') return new Blob([String(obj)]).size;
      if (seen.has(obj)) return 0; // Evitar referencias circulares
      
      seen.add(obj);
      let size = 0;

      if (Array.isArray(obj)) {
        size = obj.reduce((acc, item) => acc + getSize(item), 0);
      } else if (obj instanceof Map) {
        for (const [key, value] of obj.entries()) {
          size += getSize(key) + getSize(value);
        }
      } else if (obj instanceof Set) {
        for (const item of obj) {
          size += getSize(item);
        }
      } else {
        // Para objetos React, solo contar propiedades primitivas
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (typeof value !== 'object' || value === null) {
              size += getSize(value);
            }
          }
        }
      }

      return size;
    };

    for (const [key, value] of this.cache.entries()) {
      total += getSize(key) + getSize(value);
    }

    return total / (1024 * 1024); // Convertir a MB
  }

  cleanCache() {
    const now = Date.now();
    let hasChanges = false;

    // Limpiar por expiración
    for (let [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        hasChanges = true;
      }
    }

    // Limpiar por tamaño si excede el límite (LRU)
    while (this.cache.size > chunkLoaderConfig.cache.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      hasChanges = true;
    }

    // Limpiar por uso de memoria si excede el límite
    const memoryUsage = this.getMemoryUsage();
    if (memoryUsage > chunkLoaderConfig.performance.memory.limit) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].lastUsed - b[1].lastUsed);
      
      while (this.getMemoryUsage() > chunkLoaderConfig.performance.memory.limit && sortedEntries.length > 0) {
        const [key] = sortedEntries.shift();
        this.cache.delete(key);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this.notifyCacheUpdate();
    }
  }

  notifyCacheUpdate() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      const newState = {
        size: this.cache.size,
        maxSize: chunkLoaderConfig.cache.maxSize,
        keys: Array.from(this.cache.keys())
      };

      if (JSON.stringify(newState) !== JSON.stringify(this.lastCacheState)) {
        this.lastCacheState = newState;
        const listeners = Array.from(this.cacheUpdateListeners);
        listeners.forEach(listener => {
          try {
            listener(newState);
          } catch (error) {
            console.error('Error en listener de caché:', error);
            this.metrics.errors++;
          }
        });
      }
    }, 0);
  }

  getFromCache(key) {
    const startTime = performance.now();
    const item = this.cache.get(key);
    
    if (item && Date.now() < item.expiry) {
      // Actualizar el timestamp para que sea "recientemente usado"
      this.cache.delete(key);
      this.cache.set(key, { ...item, lastUsed: Date.now() });
      
      // Registrar métricas
      this.metrics.hits++;
      this.metrics.loadTimes.push(performance.now() - startTime);
      
      return item.value;
    }
    
    this.metrics.misses++;
    return null;
  }

  setToCache(key, value) {
    if (!value) return;
    
    const existingItem = this.cache.get(key);
    if (existingItem && existingItem.value === value) {
      return;
    }

    this.cleanCache();
    const expiry = Date.now() + chunkLoaderConfig.cache.duration;
    this.cache.set(key, { value, expiry, lastUsed: Date.now() });
    this.notifyCacheUpdate();
  }

  clearAllCache() {
    if (this.cache.size > 0) {
      this.cache.clear();
      this.notifyCacheUpdate();
    }
  }

  subscribeToCacheUpdates(listener) {
    if (typeof listener !== 'function') {
      console.error('El listener debe ser una función');
      return () => {};
    }

    this.cacheUpdateListeners.add(listener);
    return () => {
      this.cacheUpdateListeners.delete(listener);
    };
  }
}

const cacheManager = new CacheManager();

export const getFromCache = (key) => cacheManager.getFromCache(key);
export const setToCache = (key, value) => cacheManager.setToCache(key, value);
export const clearAllCache = () => cacheManager.clearAllCache();
export const subscribeToCacheUpdates = (listener) => cacheManager.subscribeToCacheUpdates(listener);