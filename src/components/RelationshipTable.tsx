
import React from 'react';

interface Relationship {
  entity1: string;
  relationship: string;
  entity2: string;
  cardinality: string;
  participation: string;
}

// Sample relationship data
const relationships: Relationship[] = [
  {
    entity1: 'Patient',
    relationship: 'books',
    entity2: 'Appointment',
    cardinality: '1:M',
    participation: 'Total'
  },
  {
    entity1: 'Doctor',
    relationship: 'belongs to',
    entity2: 'Department',
    cardinality: 'M:1',
    participation: 'Total'
  },
  {
    entity1: 'Room',
    relationship: 'assigned to',
    entity2: 'Patient',
    cardinality: 'M:N',
    participation: 'Partial'
  },
  {
    entity1: 'Nurse',
    relationship: 'manages',
    entity2: 'Room',
    cardinality: '1:M',
    participation: 'Partial'
  },
  {
    entity1: 'Doctor',
    relationship: 'conducts',
    entity2: 'Treatment',
    cardinality: '1:M',
    participation: 'Total'
  },
  {
    entity1: 'Patient',
    relationship: 'receives',
    entity2: 'Treatment',
    cardinality: '1:M',
    participation: 'Partial'
  },
  {
    entity1: 'Treatment',
    relationship: 'requires',
    entity2: 'Medication',
    cardinality: 'M:N',
    participation: 'Partial'
  },
  {
    entity1: 'Patient',
    relationship: 'has',
    entity2: 'Billing',
    cardinality: '1:M',
    participation: 'Total'
  },
  {
    entity1: 'Department',
    relationship: 'contains',
    entity2: 'Room',
    cardinality: '1:M',
    participation: 'Total'
  }
];

const RelationshipTable = () => {
  return (
    <section id="relationships" className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Entity Relationships</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full">
            <thead>
              <tr className="bg-medical-600 text-white">
                <th className="py-3 px-4 text-left">Entity 1</th>
                <th className="py-3 px-4 text-left">Relationship</th>
                <th className="py-3 px-4 text-left">Entity 2</th>
                <th className="py-3 px-4 text-left">Cardinality</th>
                <th className="py-3 px-4 text-left">Participation</th>
              </tr>
            </thead>
            <tbody>
              {relationships.map((rel, index) => (
                <tr 
                  key={index} 
                  className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="py-3 px-4 border-b">{rel.entity1}</td>
                  <td className="py-3 px-4 border-b italic text-gray-700">{rel.relationship}</td>
                  <td className="py-3 px-4 border-b">{rel.entity2}</td>
                  <td className="py-3 px-4 border-b">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {rel.cardinality}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <span className={`px-2 py-1 rounded text-sm ${
                      rel.participation === 'Total' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rel.participation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default RelationshipTable;
