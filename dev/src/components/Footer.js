import React from 'react';

const Footer = ({ lang, texts }) => (
  <footer className="mt-8 text-center text-gray-600 text-sm py-8">
    <p>{texts.general.footer}</p>
  </footer>
);

export default Footer; 