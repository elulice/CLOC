import React, { useState, Suspense, useMemo } from 'react';
import { useChunk, useCullingReact } from './chunkCullReact.js';

// Example component for dynamic loading
// Save as MiComponente.js in the same folder:
// export default function MiComponente() { return <div>Dynamically loaded component!</div>; }

export default function ExampleReact({ lang, texts }) {
  // State for buffer and item height
  const [buffer, setBuffer] = useState(5);
  const [itemHeight, setItemHeight] = useState(40);
  // useCullingReact for virtual list
  const items = useMemo(() => Array.from({ length: 1000 }, (_, i) => `Item #${i+1}`), []);
  const { visibleItems, start, ref } = useCullingReact(items, { itemHeight, buffer });
  const totalHeight = items.length * itemHeight;
  const offset = start * itemHeight;

  // useChunk for dynamic component loading
  const [show, setShow] = useState(false);
  const MiComponente = React.lazy(() => import('./MiComponente.js'));

  // Component to visualize mount/unmount
  function VirtualItem({ children, index }) {
    React.useEffect(() => {
      console.log(`🟢 Mounted: ${children}`);
      return () => {
        console.log(`🔴 Unmounted: ${children}`);
      };
    }, [children]);
    return (
      <div
        style={{
          height: itemHeight,
          borderBottom: '1px solid #eee',
          padding: 8,
          background: index % 2 === 0 ? '#f9f9f9' : '#e3f2fd',
          transition: 'background 0.2s, height 0.2s',
        }}
      >
        {children}
      </div>
    );
  }

  const containerHeight = 300; // Must match the container style
  const visibleWindow = Math.ceil(containerHeight / itemHeight);
  const bufferTotal = buffer * 2;
  const renderedTotal = visibleWindow + bufferTotal;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>{texts.exampleReact.title}</h1>

      <div style={{ marginBottom: 20, color: '#333', fontSize: 15, maxWidth: 600 }}>
        <b>{texts.exampleReact.howTitle}</b> {texts.exampleReact.howDesc}
      </div>

      <h2>{texts.exampleReact.virtualListTitle}</h2>
      <div style={{ marginBottom: 12 }}>
        <label>
          {texts.exampleReact.buffer}:
          <input
            type="range"
            min={0}
            max={50}
            value={buffer}
            onChange={e => setBuffer(Number(e.target.value))}
            style={{ marginLeft: 8, width: 200 }}
          />
          <span style={{ marginLeft: 12, fontWeight: 600 }}>{buffer}</span>
        </label>
        <span style={{ marginLeft: 24 }}>
          {texts.exampleReact.renderedItems}: <b>{visibleItems.length}</b>
        </span>
        <div style={{ marginTop: 8, color: '#1976d2', fontWeight: 500 }}>
          {texts.exampleReact.showingItems} {items.length === 0 ? 0 : start + 1} {texts.exampleReact.to} {start + visibleItems.length} {texts.exampleReact.of} {items.length}
        </div>
        <div style={{ marginTop: 8, color: '#555', fontSize: 14 }}>
          {texts.exampleReact.visibleWindow}: {visibleWindow} &nbsp;|&nbsp; {texts.exampleReact.bufferAbove}: {buffer} &nbsp;|&nbsp; {texts.exampleReact.bufferBelow}: {buffer} &nbsp;|&nbsp; <b>{texts.exampleReact.expectedTotal}:</b> {renderedTotal}
          <br/>
          <span style={{ color: '#888' }}>
            ({texts.exampleReact.actualTotalNote})
          </span>
        </div>
        <div style={{ marginTop: 16 }}>
          <label>
            {texts.exampleReact.itemHeight}:
            <input
              type="range"
              min={20}
              max={100}
              value={itemHeight}
              onChange={e => setItemHeight(Number(e.target.value))}
              style={{ marginLeft: 8, width: 200 }}
            />
            <span style={{ marginLeft: 12, fontWeight: 600 }}>{itemHeight}px</span>
          </label>
        </div>
      </div>
      <div
        ref={ref}
        style={{ width: 300, height: 300, overflowY: 'auto', border: '1px solid #ccc', marginBottom: 20, position: 'relative' }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offset}px)`, position: 'absolute', width: '100%' }}>
            {visibleItems.map((item, i) => (
              <VirtualItem key={start + i} index={start + i}>{item}</VirtualItem>
            ))}
          </div>
        </div>
      </div>

      <h2>{texts.exampleReact.dynamicTitle}</h2>
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
        {texts.exampleReact.loadDynamic}
      </button>
      <div style={{ marginTop: 20 }}>
        <Suspense fallback={<div>{texts.exampleReact.loading}</div>}>
          {show && <MiComponente />}
        </Suspense>
      </div>
    </div>
  );
} 