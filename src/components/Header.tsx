
import React from 'react';
import { Hospital } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-medical-600 to-medical-800 text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Hospital className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">HMS DB Designer</h1>
            <p className="text-xs text-medical-100">Hospital Management System Database Design Tool</p>
          </div>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a href="#entities" className="hover:text-medical-200 transition-colors">Entities</a>
            </li>
            <li>
              <a href="#relationships" className="hover:text-medical-200 transition-colors">Relationships</a>
            </li>
            <li>
              <a href="#diagrams" className="hover:text-medical-200 transition-colors">ER Diagrams</a>
            </li>
            <li>
              <a href="#normalization" className="hover:text-medical-200 transition-colors">Normalization</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
