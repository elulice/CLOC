import React, { useState, Suspense, useMemo } from 'react';
import { useChunk, useCullingReact } from './chunkCullReact.js';

// Example component for dynamic loading
// Save as MiComponente.js in the same folder:
// export default function MiComponente() { return <div>Dynamically loaded component!</div>; }

export default function ExampleReact() {
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
      <h1>CLOC - Chunk Loading - Occlusion Culling (React Demo)</h1>

      <div style={{ marginBottom: 20, color: '#333', fontSize: 15, maxWidth: 600 }}>
        <b>How does it work?</b> This virtualized list only renders the items visible in the scroll window, plus a buffer above and below for smooth scrolling. You can adjust the buffer and item height below to see how the virtualization adapts. The component efficiently handles thousands of items without performance loss.
      </div>

      <h2>useCullingReact (Virtual List)</h2>
      <div style={{ marginBottom: 12 }}>
        <label>
          Buffer:
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
          Rendered items: <b>{visibleItems.length}</b>
        </span>
        <div style={{ marginTop: 8, color: '#1976d2', fontWeight: 500 }}>
          Showing items {items.length === 0 ? 0 : start + 1} to {start + visibleItems.length} of {items.length}
        </div>
        <div style={{ marginTop: 8, color: '#555', fontSize: 14 }}>
          Visible window: {visibleWindow} &nbsp;|&nbsp; Buffer above: {buffer} &nbsp;|&nbsp; Buffer below: {buffer} &nbsp;|&nbsp; <b>Expected total:</b> {renderedTotal}
          <br/>
          <span style={{ color: '#888' }}>
            (The actual total may vary at the start and end of the list)
          </span>
        </div>
        <div style={{ marginTop: 16 }}>
          <label>
            Item height:
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

      <h2>useChunk (Dynamic Component Loading)</h2>
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
        Load dynamic component
      </button>
      <div style={{ marginTop: 20 }}>
        <Suspense fallback={<div>Loading...</div>}>
          {show && <MiComponente />}
        </Suspense>
      </div>
    </div>
  );
} 