import React, { useState, useEffect } from 'react';
import { subscribeToCacheUpdates } from '../utils/cacheManager';

const CacheStatusIndicator = ({ lang, texts }) => {
  const [cacheInfo, setCacheInfo] = useState({ size: 0, maxSize: 0, keys: [] });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCacheUpdates(setCacheInfo);
    return () => unsubscribe();
  }, []);

  const percentage = cacheInfo.maxSize > 0 ? (cacheInfo.size / cacheInfo.maxSize) * 100 : 0;
  const statusColor = percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg text-white transition-all duration-300 ${statusColor} hover:scale-105`}
        aria-label="Show cache status"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10l2 2h10l2-2V7m-2 0H6m12 0V5a2 2 0 00-2-2H6a2 2 0 00-2 2v2m12 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293L6.293 7.293A1 1 0 005.586 7H4"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-72 bg-white p-6 rounded-xl shadow-2xl border border-gray-200 transform transition-all duration-300 scale-100 opacity-100 origin-bottom-right">
          <h4 className="text-xl font-bold text-gray-900 mb-4">{texts.cache.status}</h4>
          <div className="mb-4">
            <p className="text-lg text-gray-700">{texts.cache.elements}: <span className="font-semibold">{cacheInfo.size} / {cacheInfo.maxSize}</span></p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <div
                className={`h-3 rounded-full ${statusColor} transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
          <div>
            <p className="text-md font-semibold text-gray-800 mb-2">{texts.cache.storedChunks}</p>
            <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-inner p-3">
              <ul className="list-disc list-inside text-gray-600 text-sm max-h-24 overflow-y-auto custom-scrollbar space-y-1">
                {cacheInfo.keys.length > 0 ? (
                  cacheInfo.keys.map((key) => (
                    <li key={key} className="truncate hover:text-blue-600 transition-colors cursor-pointer" title={key}>{key}</li>
                  ))
                ) : (
                  <li className="text-gray-400 italic">{texts.cache.noChunksInCache}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CacheStatusIndicator;