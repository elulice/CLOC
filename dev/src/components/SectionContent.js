import React from 'react';

const SectionContent = ({ title, description, imageUrl }) => {
  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
      {imageUrl && (
        <div className="flex-shrink-0 w-full md:w-64 h-40 sm:h-48 mb-4 md:mb-0">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover rounded-xl shadow-md"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x400/CCCCCC/555555?text=Image+not+available'; }}
          />
        </div>
      )}
      <div className="flex-grow text-center md:text-left w-full">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 break-words">{title}</h3>
        <p className="text-base sm:text-lg text-gray-700 leading-relaxed break-words">{description}</p>
        <button className="mt-5 sm:mt-6 bg-black text-white py-2 sm:py-3 px-6 sm:px-8 rounded-full hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto">
          Explore more
        </button>
      </div>
    </div>
  );
};

export default SectionContent;