import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ChunkLoader from './components/ChunkLoader';
import SectionContent from './components/SectionContent';
import CacheStatusIndicator from './components/CacheStatusIndicator';
import TestSuite from './components/TestSuite';
import VersionManager from './components/VersionManager';
import useCurrentVersion from './hooks/useCurrentVersion';
import { sectionsData } from './mock/sections';
import { clearAllCache } from './utils/cacheManager';
import { chunkLoaderConfig } from './config/chunkLoaderConfig';

function Navbar() {
  const location = useLocation();
  const { currentVersion, loading, error } = useCurrentVersion();
  
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-800">Chunk</span>
            {!loading && !error && currentVersion && (
              <span className="text-sm text-gray-500">v{currentVersion.version}</span>
            )}
          </Link>
          
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Inicio
            </Link>
            <Link
              to="/versions"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/versions'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Versiones
            </Link>
            <Link
              to="/test-suite"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/test-suite'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Suite de Pruebas
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Home() {
  const [loadedChunks, setLoadedChunks] = useState({});
  const [error, setError] = useState(null);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const handleChunkLoaded = (chunkId) => {
    setLoadedChunks((prev) => ({ ...prev, [chunkId]: true }));
    setError(null);
  };

  const handleChunkUnloaded = (chunkId) => {
    setLoadedChunks((prev) => {
      const newState = { ...prev };
      delete newState[chunkId];
      return newState;
    });
  };

  const handleChunkError = (chunkId, error) => {
    setError({ chunkId, message: error.message });
    console.error(`Error en chunk ${chunkId}:`, error);
  };

  const handleClearCache = async () => {
    try {
      setIsClearingCache(true);
      await clearAllCache();
      setLoadedChunks({});
      setError(null);
      alert('Caché limpiado. Las secciones se recargarán al ser visibles.');
    } catch (error) {
      setError({ message: 'Error al limpiar la caché' });
      console.error('Error al limpiar la caché:', error);
    } finally {
      setIsClearingCache(false);
    }
  };

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, chunkLoaderConfig.errorHandling.errorDisplayTime);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-8">
      <header className="text-center mb-16">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
          ChunkWeb: Carga Inteligente
        </h1>
        <p className="text-2xl text-gray-700 max-w-3xl mx-auto">
          Experimenta la web como nunca antes, con contenido que aparece justo cuando lo necesitas.
        </p>
        <div className="mt-8 flex justify-center items-center space-x-4">
          <button
            onClick={handleClearCache}
            disabled={isClearingCache}
            className={`
              bg-red-600 text-white py-3 px-8 rounded-full 
              transition-all duration-300 shadow-lg hover:shadow-xl
              ${isClearingCache ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}
            `}
          >
            {isClearingCache ? 'Limpiando...' : 'Limpiar Caché'}
          </button>
          <CacheStatusIndicator />
        </div>
      </header>

      {error && (
        <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-medium">Error: {error.message}</p>
          {error.chunkId && (
            <p className="text-sm mt-1">Chunk afectado: {error.chunkId}</p>
          )}
        </div>
      )}

      <main className="space-y-20">
        {sectionsData.map((section) => (
          <ChunkLoader
            key={section.id}
            chunkId={section.id}
            onChunkLoaded={handleChunkLoaded}
            onChunkUnloaded={handleChunkUnloaded}
            onError={(error) => handleChunkError(section.id, error)}
            config={{
              ...chunkLoaderConfig,
              observer: {
                ...chunkLoaderConfig.observer,
                margin: section.margin || chunkLoaderConfig.observer.margin
              }
            }}
          >
            <SectionContent
              title={section.title}
              description={section.description}
              imageUrl={section.imageUrl}
            />
          </ChunkLoader>
        ))}
      </main>

      <footer className="text-center mt-20 py-8 text-gray-600 text-lg">
        <p>&copy; 2024 ChunkWeb. Todos los derechos reservados.</p>
        <p className="text-sm mt-2">
          Chunks cargados: {Object.keys(loadedChunks).length} de {sectionsData.length}
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/versions" element={<VersionManager />} />
            <Route path="/test-suite" element={<TestSuite />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

// DONE