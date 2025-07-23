# Universal Chunk & Culling Library (English)

Optimizes resource loading and rendering in any web application. Provides chunk loading (on-demand loading) and occlusion culling (efficient list/component rendering) universally, usable in Vanilla JS and React.

---

## Features
- **Chunk Loading**: Loads modules/components on demand, with optional cache and version management.
- **Occlusion Culling**: Renders only visible items in large lists (virtualization), both in Vanilla JS and React.
- **Version management**: Change the global version and clear cache automatically.
- **Simple and universal API**: Use it in any modern JS project.

---

## Installation

Copy the files `chunkCull.js` (Vanilla JS) and/or `chunkCullReact.js` (React) to your project. (Coming soon: npm package)

---

## Usage in Vanilla JS

### Recommended import (all-in-one)
```js
import ChunkCull from './chunkCull.js';

const loader = new ChunkCull.ChunkLoader({ cache: true });
const { getVisibleItems } = ChunkCull.useCulling({ container, items });
ChunkCull.VersionManager.setVersion('1.0.1');
```

### Classic import (by name)
```js
import { ChunkLoader, useCulling, VersionManager } from './chunkCull.js';

// ChunkLoader
const loader = new ChunkLoader({ cache: true, version: '1.0.0' });
loader.load('./moduloEjemplo.js').then(mod => {
  mod.saludar('Mundo');
});

// useCulling for virtual lists
const items = [...];
const container = document.getElementById('list');
const { getVisibleItems } = useCulling({ container, items, itemHeight: 40, buffer: 5 });
const visibles = getVisibleItems();

// VersionManager
VersionManager.setVersion('1.0.1');
```

---

## Usage in React

### Recommended import (all-in-one)
```jsx
import ChunkCullReact from './chunkCullReact.js';

const MiComponente = ChunkCullReact.useChunk(() => import('./MiComponente'));
const { visibleItems, ref } = ChunkCullReact.useCullingReact(items);
```

### Classic import (by name)
```jsx
import { useChunk, useCullingReact } from './chunkCullReact.js';

// useChunk
const MiComponente = useChunk(() => import('./MiComponente'));
// ...
{MiComponente ? <MiComponente /> : null}

// useCullingReact
const items = [...];
const { visibleItems, ref } = useCullingReact(items, { itemHeight: 40, buffer: 5 });
// ...
<div ref={ref} style={{height: 300, overflowY: 'auto'}}>
  {visibleItems.map(...)}
</div>
```

---

## API

### ChunkLoader (Vanilla JS)
- `constructor({ strategy, cache, version })`
- `load(path): Promise<mod>`
- `clearCache()`
- `setVersion(version)`
- `getVersion()`

### useCulling (Vanilla JS)
- `useCulling({ container, items, itemHeight, buffer })`
- Returns `{ getVisibleItems }`

### VersionManager (Vanilla JS)
- `setVersion(version)`
- `getVersion()`

### useChunk (React)
- `useChunk(importFn, { cache, version })`
- Returns the loaded module/component

### useCullingReact (React)
- `useCullingReact(items, { itemHeight, buffer })`
- Returns `{ visibleItems, ref }`

---

## Examples
- See `exampleVanilla.html` for Vanilla JS
- See `exampleReact.js` and the `/react-demo` route in the app for React

---

## Credits
Developed by [Ulises López].
Inspired by modern chunk loading and virtualization techniques.

---

## License
MIT 

---

# Universal Chunk & Culling Library (Español)

Optimiza la carga y renderizado de recursos en cualquier aplicación web. Provee chunk loading (carga bajo demanda) y occlusion culling (renderizado eficiente de listas/componentes) de forma universal, usable en Vanilla JS y React.

---

## Características
- **Chunk Loading**: Carga módulos/componentes bajo demanda, con caché y gestión de versiones.
- **Occlusion Culling**: Renderiza solo los elementos visibles en listas grandes (virtualización), tanto en Vanilla JS como en React.
- **Gestión de versiones**: Cambia la versión global y limpia caché automáticamente.
- **API simple y universal**: Úsala en cualquier proyecto JS moderno.

---

## Instalación

Copia los archivos `chunkCull.js` (Vanilla JS) y/o `chunkCullReact.js` (React) a tu proyecto. (Próximamente: npm package)

---

## Uso en Vanilla JS

### Importación recomendada (todo en uno)
```js
import ChunkCull from './chunkCull.js';

const loader = new ChunkCull.ChunkLoader({ cache: true });
const { getVisibleItems } = ChunkCull.useCulling({ container, items });
ChunkCull.VersionManager.setVersion('1.0.1');
```

### Importación clásica (por nombre)
```js
import { ChunkLoader, useCulling, VersionManager } from './chunkCull.js';

// ChunkLoader
const loader = new ChunkLoader({ cache: true, version: '1.0.0' });
loader.load('./moduloEjemplo.js').then(mod => {
  mod.saludar('Mundo');
});

// useCulling para listas virtuales
const items = [...];
const container = document.getElementById('list');
const { getVisibleItems } = useCulling({ container, items, itemHeight: 40, buffer: 5 });
const visibles = getVisibleItems();

// VersionManager
VersionManager.setVersion('1.0.1');
```

---

## Uso en React

### Importación recomendada (todo en uno)
```jsx
import ChunkCullReact from './chunkCullReact.js';

const MiComponente = ChunkCullReact.useChunk(() => import('./MiComponente'));
const { visibleItems, ref } = ChunkCullReact.useCullingReact(items);
```

### Importación clásica (por nombre)
```jsx
import { useChunk, useCullingReact } from './chunkCullReact.js';

// useChunk
const MiComponente = useChunk(() => import('./MiComponente'));
// ...
{MiComponente ? <MiComponente /> : null}

// useCullingReact
const items = [...];
const { visibleItems, ref } = useCullingReact(items, { itemHeight: 40, buffer: 5 });
// ...
<div ref={ref} style={{height: 300, overflowY: 'auto'}}>
  {visibleItems.map(...)}
</div>
```

---

## API

### ChunkLoader (Vanilla JS)
- `constructor({ strategy, cache, version })`
- `load(path): Promise<mod>`
- `clearCache()`
- `setVersion(version)`
- `getVersion()`

### useCulling (Vanilla JS)
- `useCulling({ container, items, itemHeight, buffer })`
- Devuelve `{ getVisibleItems }`

### VersionManager (Vanilla JS)
- `setVersion(version)`
- `getVersion()`

### useChunk (React)
- `useChunk(importFn, { cache, version })`
- Devuelve el módulo/componente cargado

### useCullingReact (React)
- `useCullingReact(items, { itemHeight, buffer })`
- Devuelve `{ visibleItems, ref }`

---

## Ejemplos
- Ver `exampleVanilla.html` para Vanilla JS
- Ver `exampleReact.js` y la ruta `/react-demo` en la app para React

---

## Créditos
Desarrollado por [Ulises López].
Inspirado en técnicas modernas de chunk loading y virtualización.

---

## Licencia
MIT

---