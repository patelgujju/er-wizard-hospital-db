
import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const DiagramUploader = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);
    
    // Check file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (PNG, JPG or JPEG)');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        setUploadedImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section id="diagrams" className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">ER Diagram Upload</h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Upload area */}
          <div className="md:w-1/2">
            <div
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center h-64 ${
                error ? 'border-red-400 bg-red-50' : 'border-medical-300 bg-medical-50 hover:border-medical-500'
              } transition-colors cursor-pointer`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".png,.jpg,.jpeg"
              />
              
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-700 text-center mb-1">Drag and drop your ER diagram here</p>
              <p className="text-gray-500 text-sm text-center mb-3">or click to browse</p>
              <p className="text-xs text-gray-400">Supported formats: PNG, JPG, JPEG (max 5MB)</p>
              
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </div>
          
          {/* Preview area */}
          <div className="md:w-1/2">
            <div className="border rounded-lg p-4 h-64 bg-white">
              <h3 className="text-xl font-medium text-gray-700 mb-2">Diagram Preview</h3>
              
              {!uploadedImage ? (
                <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded border">
                  <ImageIcon className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-400">No diagram uploaded yet</p>
                </div>
              ) : (
                <div className="relative h-48">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetUpload();
                    }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                  <img
                    src={uploadedImage}
                    alt="Uploaded ER Diagram"
                    className="max-h-full max-w-full mx-auto h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiagramUploader;
