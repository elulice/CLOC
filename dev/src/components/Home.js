import React, { useState, useEffect } from 'react';
import Footer from './Footer';
import SectionContent from './SectionContent';
import CacheStatusIndicator from './CacheStatusIndicator';
import { sectionsData } from '../mock/sections';
import { chunkLoaderConfig } from '../config/chunkLoaderConfig';
import { clearAllCache } from '../utils/cacheManager';
import ChunkLoader from './ChunkLoader';

function Home({ lang, texts }) {
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
      alert(texts.general.cacheCleared);
    } catch (error) {
      setError({ message: texts.general.error });
      console.error('Error clearing cache:', error);
    } finally {
      setIsClearingCache(false);
    }
  };

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  // Aquí deberías definir sectionsData y chunkLoaderConfig o recibirlos como props
  // Por ahora, se asume que están disponibles en el scope global o se deben importar

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f9fbf9] to-[#4bff1e] p-8">
      <header className="text-center mb-16">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
          CLOC: ChunkLoading-OcclusionCulling
        </h1>
        <p className="text-2xl text-gray-700 max-w-3xl mx-auto">
          {texts.home.headerDesc}
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
            {isClearingCache ? texts.general.clearing : texts.general.clearCache}
          </button>
          <CacheStatusIndicator lang={lang} texts={texts} />
        </div>
      </header>

      {error && (
        <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-medium">{texts.general.error}: {error.message}</p>
          {error.chunkId && (
            <p className="text-sm mt-1">Chunk: {error.chunkId}</p>
          )}
        </div>
      )}

      <main className="space-y-20">
        {sectionsData.map((section) => (
          <ChunkLoader
            key={section.id + '-' + lang}
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
              title={section.title[lang]}
              description={section.description[lang]}
              imageUrl={section.imageUrl}
              texts={texts}
            />
          </ChunkLoader>
        ))}
      </main>

      <Footer lang={lang} texts={texts} />
    </div>
  );
}

export default Home; 