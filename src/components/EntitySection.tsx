
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Entity data structure
interface Attribute {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  referencesEntity?: string;
}

interface Entity {
  name: string;
  attributes: Attribute[];
  description?: string;
}

// Sample entity data
const entities: Entity[] = [
  {
    name: 'Patient',
    description: 'Contains information about hospital patients',
    attributes: [
      { name: 'Patient_ID', type: 'int', isPrimaryKey: true },
      { name: 'Name', type: 'string' },
      { name: 'Age', type: 'int' },
      { name: 'Gender', type: 'char' },
      { name: 'Address', type: 'string' },
      { name: 'Contact_No', type: 'string' },
      { name: 'Room_ID', type: 'int', isForeignKey: true, referencesEntity: 'Room' }
    ]
  },
  {
    name: 'Doctor',
    description: 'Contains information about hospital doctors',
    attributes: [
      { name: 'Doctor_ID', type: 'int', isPrimaryKey: true },
      { name: 'Name', type: 'string' },
      { name: 'Specialization', type: 'string' },
      { name: 'Department_ID', type: 'int', isForeignKey: true, referencesEntity: 'Department' }
    ]
  },
  {
    name: 'Appointment',
    description: 'Records scheduled appointments between patients and doctors',
    attributes: [
      { name: 'Appointment_ID', type: 'int', isPrimaryKey: true },
      { name: 'Patient_ID', type: 'int', isForeignKey: true, referencesEntity: 'Patient' },
      { name: 'Doctor_ID', type: 'int', isForeignKey: true, referencesEntity: 'Doctor' },
      { name: 'Date', type: 'date' },
      { name: 'Time', type: 'time' },
      { name: 'Status', type: 'string' }
    ]
  },
  {
    name: 'Department',
    description: 'Hospital departments and their details',
    attributes: [
      { name: 'Department_ID', type: 'int', isPrimaryKey: true },
      { name: 'Name', type: 'string' },
      { name: 'Location', type: 'string' },
      { name: 'Head_Doctor_ID', type: 'int', isForeignKey: true, referencesEntity: 'Doctor' }
    ]
  },
  {
    name: 'Room',
    description: 'Information about hospital rooms',
    attributes: [
      { name: 'Room_ID', type: 'int', isPrimaryKey: true },
      { name: 'Room_Type', type: 'string' },
      { name: 'Floor', type: 'int' },
      { name: 'Status', type: 'string' }
    ]
  },
  {
    name: 'Nurse',
    description: 'Contains information about hospital nurses',
    attributes: [
      { name: 'Nurse_ID', type: 'int', isPrimaryKey: true },
      { name: 'Name', type: 'string' },
      { name: 'Shift', type: 'string' },
      { name: 'Department_ID', type: 'int', isForeignKey: true, referencesEntity: 'Department' }
    ]
  },
  {
    name: 'Billing',
    description: 'Patient billing information',
    attributes: [
      { name: 'Bill_ID', type: 'int', isPrimaryKey: true },
      { name: 'Patient_ID', type: 'int', isForeignKey: true, referencesEntity: 'Patient' },
      { name: 'Amount', type: 'decimal' },
      { name: 'Bill_Date', type: 'date' },
      { name: 'Payment_Status', type: 'string' },
      { name: 'Treatment_ID', type: 'int', isForeignKey: true, referencesEntity: 'Treatment' }
    ]
  },
  {
    name: 'Medication',
    description: 'Information about medications prescribed to patients',
    attributes: [
      { name: 'Medication_ID', type: 'int', isPrimaryKey: true },
      { name: 'Name', type: 'string' },
      { name: 'Dosage', type: 'string' },
      { name: 'Description', type: 'string' },
      { name: 'Side_Effects', type: 'string' }
    ]
  },
  {
    name: 'Treatment',
    description: 'Records of treatments given to patients',
    attributes: [
      { name: 'Treatment_ID', type: 'int', isPrimaryKey: true },
      { name: 'Patient_ID', type: 'int', isForeignKey: true, referencesEntity: 'Patient' },
      { name: 'Doctor_ID', type: 'int', isForeignKey: true, referencesEntity: 'Doctor' },
      { name: 'Treatment_Type', type: 'string' },
      { name: 'Start_Date', type: 'date' },
      { name: 'End_Date', type: 'date' },
      { name: 'Notes', type: 'text' }
    ]
  }
];

// Component for displaying a single entity
const EntityCard: React.FC<{ entity: Entity }> = ({ entity }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-medical-100 animate-fade-in">
      <div 
        className="bg-gradient-to-r from-medical-400 to-medical-600 text-white p-4 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-xl font-semibold">{entity.name}</h3>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      
      {isExpanded && (
        <div className="p-4">
          {entity.description && (
            <p className="text-gray-600 mb-4">{entity.description}</p>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attribute</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Type</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Constraints</th>
                </tr>
              </thead>
              <tbody>
                {entity.attributes.map((attr, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2 px-4 border-b border-gray-200">
                      <span className={`${attr.isPrimaryKey ? 'font-bold' : ''} ${attr.isForeignKey ? 'italic' : ''}`}>
                        {attr.name}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">{attr.type}</td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {attr.isPrimaryKey && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mr-1">PK</span>}
                      {attr.isForeignKey && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          FK to {attr.referencesEntity}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const EntitySection = () => {
  return (
    <section id="entities" className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Entity Types</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {entities.map((entity, index) => (
            <EntityCard key={index} entity={entity} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EntitySection;
