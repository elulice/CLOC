import React, { useState, useCallback, useRef } from 'react';

const TestErrorHandling = ({ lang, texts }) => {
  // Estados con valores iniciales definidos
  const [errorType, setErrorType] = useState('normal');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    totalErrors: 0,
    lastError: null,
    errorTypes: {}
  });
  const [heavyContent, setHeavyContent] = useState([]);
  const [invalidObject, setInvalidObject] = useState(null);
  const errorCountRef = useRef(0);

  const handleError = useCallback((error) => {
    setMetrics(prev => ({
      totalErrors: (prev.totalErrors || 0) + 1,
      lastError: {
        message: error?.message || 'Error desconocido',
        timestamp: new Date().toISOString()
      },
      errorTypes: {
        ...prev.errorTypes,
        [errorType]: ((prev.errorTypes?.[errorType] || 0) + 1)
      }
    }));
  }, [errorType]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setErrorType('normal');
    setHeavyContent([]);
    setInvalidObject(null);
    setMetrics({
      totalErrors: 0,
      lastError: null,
      errorTypes: {}
    });
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const simulateError = useCallback((type) => {
    setIsLoading(true);
    setErrorType(type);
    errorCountRef.current = (errorCountRef.current + 1) % 5;

    setTimeout(() => {
      try {
        switch (type) {
          case 'timeout':
            setErrorType('timeout');
            break;
          case 'error':
            const errors = [
              new Error('Error de prueba'),
              new TypeError('Error de tipo'),
              new RangeError('Error de rango'),
              new ReferenceError('Error de referencia'),
              new SyntaxError('Error de sintaxis')
            ];
            const error = errors[errorCountRef.current];
            setErrorType('error');
            handleError(error);
            break;
          case 'invalid':
            const obj = {
              user: {
                profile: {
                  // Intencionalmente dejamos address indefinido
                }
              }
            };
            setInvalidObject(obj);
            setErrorType('invalid');
            handleError(new Error('Error de propiedad indefinida'));
            break;
          case 'heavy':
            try {
              const heavyArray = Array.from({ length: 1000000 }, (_, i) => ({
                id: i,
                data: `Dato ${i}`,
                timestamp: new Date().toISOString()
              }));
              setHeavyContent(heavyArray);
              setErrorType('heavy');
              handleError(new Error(`Carga pesada completada: ${heavyArray.length} elementos`));
            } catch (error) {
              setErrorType('error');
              handleError(new Error('Error de memoria: No se pudo crear el array pesado'));
            }
            break;
          default:
            setErrorType('normal');
        }
      } catch (error) {
        setErrorType('error');
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    }, 500);
  }, [handleError]);

  return (
    <div className="space-y-8">
      <div className="flex space-x-4">
        <button
          onClick={() => simulateError('timeout')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {texts.testErrorHandling.simulateTimeout}
        </button>
        <button
          onClick={() => simulateError('error')}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          {texts.testErrorHandling.simulateError}
        </button>
        <button
          onClick={() => simulateError('invalid')}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          {texts.testErrorHandling.simulateInvalid}
        </button>
        <button
          onClick={() => simulateError('heavy')}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          {texts.testErrorHandling.simulateHeavy}
        </button>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {texts.testErrorHandling.retry}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">{texts.testErrorHandling.metricsTitle}</h3>
          <div className="space-y-2">
            <p>{texts.testErrorHandling.totalErrors}: {metrics.totalErrors}</p>
            {metrics.lastError && (
              <div>
                <p>{texts.testErrorHandling.lastError}: {metrics.lastError.message}</p>
                <p className="text-sm text-gray-500">
                  {new Date(metrics.lastError.timestamp).toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <p className="font-medium">{texts.testErrorHandling.errorTypes}:</p>
              <ul className="list-disc list-inside">
                {Object.entries(metrics.errorTypes).map(([type, count]) => (
                  <li key={type}>
                    {type}: {count}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">{texts.testErrorHandling.currentState}</h3>
          <div className="space-y-2">
            <p>{texts.testErrorHandling.errorType}: {errorType}</p>
            <p>{texts.testErrorHandling.status}: {isLoading ? texts.testErrorHandling.loading : texts.testErrorHandling.ready}</p>
            {heavyContent.length > 0 && (
              <p>{texts.testErrorHandling.loadedElements}: {heavyContent.length}</p>
            )}
            {invalidObject && (
              <p>{texts.testErrorHandling.invalidObject}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestErrorHandling; 