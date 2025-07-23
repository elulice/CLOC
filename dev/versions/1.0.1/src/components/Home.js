import React from 'react';
import { Link } from 'react-router-dom';
import SectionContent from './SectionContent';

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="space-y-12">
        <SectionContent
          title="Carga Eficiente"
          description="Optimiza el rendimiento de tu aplicación con nuestro sistema de carga inteligente. Reduce el tiempo de carga inicial y mejora la experiencia del usuario."
          imageUrl="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        />

        <SectionContent
          title="Manejo de Errores"
          description="Sistema robusto de manejo de errores que garantiza una experiencia fluida incluso en situaciones adversas. Recuperación automática y notificaciones claras."
          imageUrl="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        />

        <SectionContent
          title="Personalización"
          description="Adapta el componente a tus necesidades específicas con opciones flexibles de configuración. Control total sobre el comportamiento y la apariencia."
          imageUrl="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        />

        <div className="text-center mt-12">
          <Link
            to="/test-suite"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Ver Suite de Pruebas
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 