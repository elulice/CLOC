import React, { useReducer, useEffect, useRef, useCallback, useMemo } from 'react';
import { getFromCache, setToCache } from '../utils/cacheManager';
import { chunkLoaderConfig } from '../config/chunkLoaderConfig';

const initialState = {
  isVisible: false,
  content: null,
  isLoading: false,
  isExiting: false,
  error: null,
  retryCount: 0
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CACHED_CONTENT':
      return { ...state, content: action.payload, isVisible: true, error: null };
    case 'START_LOADING':
      return { ...state, isLoading: true, isExiting: false, error: null };
    case 'SET_CONTENT':
      return { ...state, content: action.payload, isVisible: true, isLoading: false, error: null };
    case 'START_EXITING':
      return { ...state, isExiting: true };
    case 'CLEAR_CONTENT':
      return { ...state, isVisible: false, content: null, isExiting: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'INCREMENT_RETRY':
      return { ...state, retryCount: state.retryCount + 1 };
    case 'RESET_RETRY':
      return { ...state, retryCount: 0 };
    default:
      return state;
  }
}

const ChunkLoader = ({ children, chunkId, onChunkLoaded, onChunkUnloaded }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const chunkRef = useRef(null);
  const observerRef = useRef(null);
  const mountedRef = useRef(true);
  const contentRef = useRef(state.content);
  const callbacksRef = useRef({ onChunkLoaded, onChunkUnloaded });
  const loadingTimeoutRef = useRef(null);
  const unloadingTimeoutRef = useRef(null);
  const stateRef = useRef(state);
  const cachedContentRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  const loadContentRef = useRef(null);

  // Memoizar el contenido para evitar re-renders innecesarios
  const memoizedChildren = useMemo(() => children, [children]);

  // Actualizar referencias cuando cambien las props
  useEffect(() => {
    callbacksRef.current = { onChunkLoaded, onChunkUnloaded };
  }, [onChunkLoaded, onChunkUnloaded]);

  // Actualizar referencias cuando cambie el estado
  useEffect(() => {
    contentRef.current = state.content;
    stateRef.current = state;
  }, [state]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (unloadingTimeoutRef.current) {
        clearTimeout(unloadingTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  const loadContent = useCallback(() => {
    if (!mountedRef.current) return;
    
    dispatch({ type: 'START_LOADING' });
    
    const loadTimeout = setTimeout(() => {
      if (!mountedRef.current) return;
      
      try {
        // Asegurarnos de que el contenido sea un elemento React válido
        const content = React.isValidElement(memoizedChildren) ? memoizedChildren : null;
        dispatch({ type: 'SET_CONTENT', payload: content });
        setToCache(chunkId, content);
        callbacksRef.current.onChunkLoaded?.(chunkId);
        dispatch({ type: 'RESET_RETRY' });
      } catch (error) {
        handleError(error);
      }
    }, chunkLoaderConfig.animations.loadDelay);

    loadingTimeoutRef.current = loadTimeout;

    // Timeout general para la carga
    const generalTimeout = setTimeout(() => {
      if (mountedRef.current && stateRef.current.isLoading) {
        handleError(new Error('Timeout al cargar el contenido'));
      }
    }, chunkLoaderConfig.errorHandling.timeout);

    return () => {
      clearTimeout(loadTimeout);
      clearTimeout(generalTimeout);
    };
  }, [chunkId, memoizedChildren]);

  // Actualizar la referencia después de definir loadContent
  useEffect(() => {
    loadContentRef.current = loadContent;
  }, [loadContent]);

  const handleError = useCallback((error) => {
    if (!mountedRef.current) return;

    dispatch({ type: 'SET_ERROR', payload: error });

    if (state.retryCount < chunkLoaderConfig.errorHandling.maxRetries) {
      dispatch({ type: 'INCREMENT_RETRY' });
      retryTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          loadContentRef.current?.();
        }
      }, chunkLoaderConfig.errorHandling.retryDelay);
    }
  }, [state.retryCount, loadContentRef]);

  const unloadContent = useCallback(() => {
    if (!mountedRef.current) return;
    
    dispatch({ type: 'START_EXITING' });
    
    unloadingTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      
      dispatch({ type: 'CLEAR_CONTENT' });
      callbacksRef.current.onChunkUnloaded?.(chunkId);
    }, chunkLoaderConfig.animations.unloadDelay);
  }, [chunkId]);

  const handleIntersection = useCallback((entries) => {
    if (!mountedRef.current) return;

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!contentRef.current && !stateRef.current.isLoading) {
          if (cachedContentRef.current) {
            dispatch({ type: 'SET_CACHED_CONTENT', payload: cachedContentRef.current });
            callbacksRef.current.onChunkLoaded?.(chunkId);
          } else {
            loadContentRef.current();
          }
        }
      } else {
        if (contentRef.current) {
          unloadContent();
        }
      }
    });
  }, [chunkId, unloadContent]);

  const updateObserver = useCallback(() => {
    if (!mountedRef.current || !chunkRef.current) return;

    // Desconectar el observer actual si existe
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Asegurar que el margen sea un valor válido
    const margin = chunkLoaderConfig.observer.getMargin();
    const validMargin = typeof margin === 'number' && !isNaN(margin) ? `${margin}px` : '0px';

    // Crear un nuevo observer con el margen actualizado
    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: validMargin,
      threshold: chunkLoaderConfig.observer.threshold,
      root: null // Usar el viewport como root
    });

    // Observar el elemento
    observerRef.current.observe(chunkRef.current);
  }, [handleIntersection]);

  // Efecto para manejar el observer y la caché inicial
  useEffect(() => {
    mountedRef.current = true;
    cachedContentRef.current = getFromCache(chunkId);

    // Inicializar el observer
    updateObserver();

    // Manejar cambios de tamaño de ventana
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          updateObserver();
        }
      }, chunkLoaderConfig.observer.updateInterval);
    };

    // Usar passive: true para mejorar el rendimiento del scroll
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      mountedRef.current = false;
      window.removeEventListener('resize', handleResize);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [chunkId, updateObserver]);

  const handleRetry = useCallback(() => {
    if (!mountedRef.current) return;
    dispatch({ type: 'RESET_RETRY' });
    loadContent();
  }, [loadContent]);

  return (
    <div
      ref={chunkRef}
      id={`chunk-${chunkId}`}
      className={`
        relative
        ${chunkLoaderConfig.animations.classes.base}
        ${state.isVisible && !state.isExiting ? chunkLoaderConfig.animations.classes.visible : chunkLoaderConfig.animations.classes.hidden}
        ${state.isExiting ? chunkLoaderConfig.animations.classes.exiting : ''}
      `}
      style={{ minHeight: '200px' }} // Asegurar una altura mínima para el placeholder
    >
      {React.isValidElement(state.content) ? state.content : (
        <div className={chunkLoaderConfig.placeholder.container}>
          {state.isLoading ? (
            <>
              <div className={chunkLoaderConfig.placeholder.spinner}></div>
              <p className="ml-4 text-gray-600">{chunkLoaderConfig.placeholder.texts.loading}</p>
            </>
          ) : state.error ? (
            <div className="flex flex-col items-center">
              <p className="text-red-500 mb-2">{chunkLoaderConfig.placeholder.texts.error}</p>
              {state.retryCount < chunkLoaderConfig.errorHandling.maxRetries && (
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  {chunkLoaderConfig.placeholder.texts.retry}
                </button>
              )}
            </div>
          ) : (
            <p className="text-gray-500">{chunkLoaderConfig.placeholder.texts.empty}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChunkLoader;