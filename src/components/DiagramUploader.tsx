
import React from 'react';

const DiagramUploader = () => {
  return (
    <section id="diagrams" className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">ER Diagram</h2>
        
        <div className="flex flex-col items-center">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-4 mb-4">
            <h3 className="text-xl font-medium text-gray-700 mb-4">Hospital Management System ER Diagram</h3>
            <div className="border rounded-lg p-2 bg-white">
              <img
                src="/lovable-uploads/a6c27fad-c674-403b-8820-cd6e5c98a366.png"
                alt="Hospital Management System ER Diagram"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
          <p className="text-gray-600 text-sm max-w-2xl text-center mt-2">
            This diagram depicts the relationships between different entities in the Hospital Management System, 
            including patients, doctors, nurses, rooms, and other key components.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DiagramUploader;
