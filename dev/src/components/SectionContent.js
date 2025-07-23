import React from 'react';

const SectionContent = ({ title, description, imageUrl }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
      {imageUrl && (
        <div className="flex-shrink-0 w-full md:w-64 h-48">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover rounded-xl shadow-md"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x400/CCCCCC/555555?text=Imagen+no+disponible'; }}
          />
        </div>
      )}
      <div className="flex-grow text-center md:text-left">
        <h3 className="text-3xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-lg text-gray-700 leading-relaxed">{description}</p>
        <button className="mt-6 bg-black text-white py-3 px-8 rounded-full hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl">
          Explorar más
        </button>
      </div>
    </div>
  );
};

export default SectionContent;