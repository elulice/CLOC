import React from 'react';
import { Link } from 'react-router-dom';
import SectionContent from './SectionContent';

const Home = () => {
  return (
    <div className="w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 break-words">
      <div className="space-y-8 sm:space-y-12">
        {/* Si hay un título exclusivo del Home, aplicar break-all y text-ellipsis */}
        {/* <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 break-all text-ellipsis overflow-hidden">Some very long home title that should wrap or truncate</h1> */}
        <SectionContent
          title="Efficient Loading"
          description="Optimize your application's performance with our smart loading system. Reduce initial load time and improve user experience."
          imageUrl="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        />

        <SectionContent
          title="Error Handling"
          description="Robust error handling system that ensures a smooth experience even in adverse situations. Automatic recovery and clear notifications."
          imageUrl="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        />

        <SectionContent
          title="Customization"
          description="Adapt the component to your specific needs with flexible configuration options. Full control over behavior and appearance."
          imageUrl="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        />

        <div className="flex justify-center mt-8 sm:mt-12 w-full">
          <Link
            to="/test-suite"
            className="inline-block bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto text-center break-all text-ellipsis overflow-hidden"
          >
            View Test Suite
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 