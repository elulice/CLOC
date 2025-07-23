import React from 'react';
import TestErrorHandling from './TestErrorHandling';

const TestSuite = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Suite de Pruebas ChunkLoader</h1>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <TestErrorHandling />
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-600 text-sm">
          <p>Suite de Pruebas ChunkLoader</p>
          <p className="mt-1">© 2024 Todos los derechos reservados</p>
        </footer>
      </div>
    </div>
  );
};

export default TestSuite; 