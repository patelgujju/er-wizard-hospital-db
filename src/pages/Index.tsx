
import React from 'react';
import Header from '../components/Header';
import EntitySection from '../components/EntitySection';
import RelationshipTable from '../components/RelationshipTable';
import DiagramUploader from '../components/DiagramUploader';
import NormalizationTool from '../components/NormalizationTool';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-medical-700 to-medical-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">Hospital Management System DB Designer</h1>
            <p className="text-xl max-w-2xl mx-auto">
              A powerful tool for designing and normalizing database schemas for hospital management systems
            </p>
          </div>
        </section>
        
        <EntitySection />
        <RelationshipTable />
        <DiagramUploader />
        <NormalizationTool />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
