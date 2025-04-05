
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-6 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Hospital Management System DB Designer</p>
          <p className="mt-1">A database design tool for healthcare professionals</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
