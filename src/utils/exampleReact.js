import React, { useState, Suspense, useMemo } from 'react';
import { useChunk, useCullingReact } from './chunkCullReact.js';

// Componente de ejemplo para carga dinámica
// Guardar como MiComponente.js en la misma carpeta:
// export default function MiComponente() { return <div>¡Componente cargado dinámicamente!</div>; }

export default function ExampleReact() {
  // useCullingReact para lista virtual
  const items = useMemo(() => Array.from({ length: 1000 }, (_, i) => `Ítem #${i+1}`), []);
  const { visibleItems, ref } = useCullingReact(items, { itemHeight: 40, buffer: 5 });

  // useChunk para carga dinámica de componente
  const [show, setShow] = useState(false);
  const MiComponente = React.lazy(() => import('./MiComponente.js'));

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>Ejemplo Universal Chunk & Culling (React)</h1>

      <h2>useCullingReact (Lista Virtual)</h2>
      <div
        ref={ref}
        style={{ width: 300, height: 300, overflowY: 'auto', border: '1px solid #ccc', marginBottom: 20 }}
      >
        {visibleItems.map((item, i) => (
          <div key={i} style={{ height: 40, borderBottom: '1px solid #eee', padding: 8 }}>{item}</div>
        ))}
      </div>

      <h2>useChunk (Carga dinámica de componente)</h2>
      <button
        onClick={() => setShow(true)}
        style={{
          background: 'linear-gradient(90deg, #007cf0 0%, #00dfd8 100%)',
          color: '#fff',
          padding: '12px 28px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          transition: 'transform 0.1s, box-shadow 0.1s',
          marginBottom: '8px',
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        Cargar componente dinámico
      </button>
      <div style={{ marginTop: 20 }}>
        <Suspense fallback={<div>Cargando...</div>}>
          {show && <MiComponente />}
        </Suspense>
      </div>
    </div>
  );
} 