/*
 * Universal Chunk & Culling Library
 * MIT License
 * Copyright (c) 2024 Ulises López
 */
// Universal Chunk & Culling Library (Vanilla JS Prototipo)
// API: ChunkLoader, useCulling

/**
 * ChunkLoader: carga módulos JS bajo demanda con caché opcional y soporte de versiones.
 */
export class ChunkLoader {
  constructor({ strategy = 'on-demand', cache = true, version = '1.0.0' } = {}) {
    this.strategy = strategy;
    this.cache = cache;
    this.version = version;
    this._cache = {};
  }

  async load(path) {
    if (this.cache && this._cache[path]) {
      return this._cache[path];
    }
    // Carga dinámica de módulos JS (ESM)
    const mod = await import(/* @vite-ignore */ path);
    if (this.cache) this._cache[path] = mod;
    return mod;
  }

  clearCache() {
    this._cache = {};
  }
}

/**
 * useCulling: para listas virtuales. Devuelve los elementos visibles dados un contenedor y buffer.
 * Uso: const { getVisibleItems } = useCulling({ container, items, itemHeight, buffer })
 */
export function useCulling({ container, items, itemHeight = 40, buffer = 5 }) {
  function getVisibleItems() {
    const scrollTop = container.scrollTop;
    const height = container.clientHeight;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const end = Math.min(items.length, Math.ceil((scrollTop + height) / itemHeight) + buffer);
    return items.slice(start, end);
  }
  return { getVisibleItems };
}

// VersionManager: gestión global de versión actual
export const VersionManager = {
  _version: '1.0.0',
  setVersion(version) {
    this._version = version;
  },
  getVersion() {
    return this._version;
  }
};

// Extensión de ChunkLoader para usar VersionManager y limpiar caché por versión
ChunkLoader.prototype.setVersion = function(version) {
  this.version = version;
  VersionManager.setVersion(version);
  this.clearCache();
};

ChunkLoader.prototype.getVersion = function() {
  return this.version;
};

// Exportación por defecto para integración más sencilla
export default {
  ChunkLoader,
  useCulling,
  VersionManager
}; 