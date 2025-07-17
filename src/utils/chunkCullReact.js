/*
 * Universal Chunk & Culling Library (React Wrapper)
 * MIT License
 * Copyright (c) 2024 Ulises López
 */
import { useEffect, useRef, useState } from 'react';
import { ChunkLoader, VersionManager } from './chunkCull.js';

// useChunk: hook para carga dinámica de módulos/componentes
export function useChunk(importPath, { cache = true, version } = {}) {
  const [mod, setMod] = useState(null);
  useEffect(() => {
    const loader = new ChunkLoader({ cache, version: version || VersionManager.getVersion() });
    let mounted = true;
    loader.load(importPath).then((m) => {
      if (mounted) setMod(m.default || m);
    });
    return () => { mounted = false; };
    // eslint-disable-next-line
  }, [importPath, cache, version]);
  return mod;
}

// useCullingReact: hook para listas virtuales en React
export function useCullingReact(items, { itemHeight = 40, buffer = 5 } = {}) {
  const ref = useRef();
  const [visibleItems, setVisibleItems] = useState(() => {
    // Inicializa solo una vez
    return items.slice(0, Math.min(items.length, buffer * 2));
  });

  useEffect(() => {
    function update() {
      const container = ref.current;
      if (!container) return;
      const scrollTop = container.scrollTop;
      const height = container.clientHeight;
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
      const end = Math.min(items.length, Math.ceil((scrollTop + height) / itemHeight) + buffer);
      setVisibleItems(items.slice(start, end));
    }
    const container = ref.current;
    if (container) {
      container.addEventListener('scroll', update);
      // Llama una vez al montar
      update();
    }
    return () => {
      if (container) container.removeEventListener('scroll', update);
    };
  }, [items, itemHeight, buffer]);

  return { visibleItems, ref };
}

// Exportación por defecto para integración más sencilla en React
export default {
  useChunk,
  useCullingReact
}; 