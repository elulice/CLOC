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
import ExampleReact from './utils/exampleReact.js';
import Navbar from './components/Navbar';
import texts from './i18n';
import Footer from './components/Footer';
import Home from './components/Home';

function App() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    clearAllCache();
  }, [lang]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar lang={lang} setLang={setLang} texts={texts[lang]} />
        <main className="flex-grow">
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 break-words">
            <Routes>
              <Route path="/" element={<Home lang={lang} texts={texts[lang]} />} />
              <Route path="/versions" element={<VersionManager lang={lang} texts={texts[lang]} />} />
              <Route path="/test-suite" element={<TestSuite lang={lang} texts={texts[lang]} />} />
              <Route path="/react-demo" element={<ExampleReact lang={lang} texts={texts[lang]} />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

// DONE