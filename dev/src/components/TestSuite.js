import React from 'react';
import TestErrorHandling from './TestErrorHandling';
import Footer from './Footer';

const TestSuite = ({ lang, texts }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{texts.testSuite.title}</h1>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <TestErrorHandling lang={lang} texts={texts} />
          </div>
        </div>

        <Footer lang={lang} texts={texts} />
      </div>
    </div>
  );
};

export default TestSuite; 