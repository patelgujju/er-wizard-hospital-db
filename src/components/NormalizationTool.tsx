
import React, { useState } from 'react';
import { normalize, NormalizationResult, NormalizationStep, findCandidateKeys, parseSchema, parseFDs } from '../utils/normalizationLogic';
import { ArrowRight, Copy, CheckCircle, AlertCircle, Key } from 'lucide-react';

const NormalizationTool = () => {
  const [schema, setSchema] = useState('');
  const [fds, setFds] = useState('');
  const [candidateKeys, setCandidateKeys] = useState('');
  const [result, setResult] = useState<NormalizationResult | null>(null);
  const [autoDetectedKeys, setAutoDetectedKeys] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Remove any spaces from schema
    const cleanedSchema = schema.trim();
    
    // Check if schema matches the expected format: R(A,B,C,D)
    const schemaFormat = /^[A-Za-z_]+\([A-Za-z_,\s]+\)$/;
    if (!schemaFormat.test(cleanedSchema)) {
      setError('Please enter a valid relation schema in the format R(A, B, C, D)');
      return;
    }
    
    // Validate functional dependencies - accept both → and -> formats
    const cleanedFDs = fds.trim();
    if (!cleanedFDs) {
      setError('Please enter at least one functional dependency');
      return;
    }
    
    try {
      // Auto-detect candidate keys
      const attributes = parseSchema(cleanedSchema);
      const parsedFDs = parseFDs(cleanedFDs);
      
      if (attributes.length > 0 && parsedFDs.length > 0) {
        const detectedKeys = findCandidateKeys(attributes, parsedFDs);
        setAutoDetectedKeys(detectedKeys.map(key => key.join('')));
      }
      
      const normalizationResult = normalize(cleanedSchema, cleanedFDs, candidateKeys);
      
      // Check if there was an error in normalization
      if (normalizationResult.steps.length > 0 && normalizationResult.steps[0].name === 'Error') {
        setError(normalizationResult.steps[0].reasoning);
        return;
      }
      
      setResult(normalizationResult);
    } catch (err) {
      setError(`Error during normalization: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const copyResults = () => {
    if (!result) return;
    
    let text = 'Normalization Results\n\n';
    
    result.steps.forEach((step, index) => {
      text += `${step.name}:\n`;
      text += `Relations: ${step.relations.join(', ')}\n`;
      
      if (step.violatingDependencies && step.violatingDependencies.length > 0) {
        text += 'Violating Dependencies: ';
        text += step.violatingDependencies.map(fd => 
          `${fd.determinant.join('')}→${fd.dependent.join('')}`
        ).join(', ') + '\n';
      }
      
      if (step.decomposedRelations) {
        text += `Decomposed Relations: ${step.decomposedRelations.join(', ')}\n`;
      }
      
      text += `Reasoning: ${step.reasoning}\n\n`;
    });
    
    text += `Final Relations: ${result.finalRelations.join(', ')}`;
    
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  return (
    <section id="normalization" className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Normalization Tool</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Normalization form */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-medical-100">
            <h3 className="text-xl font-semibold text-medical-800 mb-4">Input Schema Details</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="schema" className="block text-sm font-medium text-gray-700 mb-1">
                  Relation Schema (e.g., R(A, B, C, D))
                </label>
                <input
                  id="schema"
                  type="text"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500"
                  placeholder="R(A, B, C, D)"
                  value={schema}
                  onChange={(e) => setSchema(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="fds" className="block text-sm font-medium text-gray-700 mb-1">
                  Functional Dependencies (e.g., A→B, BC→D)
                </label>
                <input
                  id="fds"
                  type="text"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500"
                  placeholder="A→B, BC→D or A->B, BC->D"
                  value={fds}
                  onChange={(e) => setFds(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use the arrow symbol (→) or type '-&gt;'
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="keys" className="block text-sm font-medium text-gray-700 mb-1">
                  Candidate Keys (optional, e.g., AB, CD)
                </label>
                <input
                  id="keys"
                  type="text"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500"
                  placeholder="AB, CD"
                  value={candidateKeys}
                  onChange={(e) => setCandidateKeys(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  If not provided, candidate keys will be automatically detected
                </p>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="text-red-500 mt-0.5" size={16} />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-medical-600 hover:bg-medical-700 text-white py-2 rounded-md transition-colors"
              >
                Normalize
              </button>
            </form>
          </div>
          
          {/* Results section */}
          <div className="bg-gray-50 rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-medical-600 text-white py-3 px-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Normalization Results</h3>
              
              {result && (
                <button
                  onClick={copyResults}
                  className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md transition-colors"
                  title="Copy results"
                >
                  {copied ? (
                    <>
                      <CheckCircle size={16} />
                      <span className="text-sm">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span className="text-sm">Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
            
            <div className="p-4 overflow-auto max-h-[500px]">
              {!result ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <p>Enter schema information and click "Normalize"</p>
                  <p className="text-sm mt-2">Results will appear here</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Display candidate keys if available */}
                  {autoDetectedKeys.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="text-lg font-medium text-blue-800 mb-2 flex items-center">
                        <Key className="mr-2" size={18} />
                        Candidate Keys
                      </h4>
                      <p className="bg-white p-2 rounded border border-blue-100 text-blue-900">
                        {autoDetectedKeys.map((key, index) => (
                          <span key={key} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2">
                            {key}
                          </span>
                        ))}
                      </p>
                    </div>
                  )}

                  {result.steps.map((step, index) => (
                    <StepCard key={index} step={step} index={index + 1} />
                  ))}
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-green-800 mb-2">Final Relations</h4>
                    <p className="bg-white p-2 rounded border border-green-100 text-green-900">
                      {result.finalRelations.join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StepCard: React.FC<{ step: NormalizationStep; index: number }> = ({ step, index }) => {
  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className={`text-white p-3 font-medium ${
        step.name === '1NF' ? 'bg-blue-600' :
        step.name === '2NF' ? 'bg-purple-600' :
        step.name === '3NF' ? 'bg-orange-600' :
        'bg-green-600'
      }`}>
        Step {index}: {step.name}
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-1">Initial Relations</h5>
          <p className="bg-gray-50 p-2 rounded text-sm">{step.relations.join(', ')}</p>
        </div>
        
        {step.violatingDependencies && step.violatingDependencies.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">Violating Dependencies</h5>
            <p className="bg-red-50 p-2 rounded text-sm">
              {step.violatingDependencies.map(fd => 
                `${fd.determinant.join('')}→${fd.dependent.join('')}`
              ).join(', ')}
            </p>
          </div>
        )}
        
        {step.decomposedRelations && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-1">
              Decomposed Relations
              <ArrowRight className="inline-block ml-1 text-gray-500" size={14} />
            </h5>
            <p className="bg-green-50 p-2 rounded text-sm">{step.decomposedRelations.join(', ')}</p>
          </div>
        )}
        
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-1">Reasoning</h5>
          <p className="text-sm text-gray-600">{step.reasoning}</p>
        </div>
      </div>
    </div>
  );
};

export default NormalizationTool;
