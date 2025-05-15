import { useState, useRef, useCallback } from 'react';

export default function SubmitProvisional() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      simulateUpload(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      simulateUpload(selectedFile);
    }
  }, []);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const simulateUpload = useCallback((file) => {
    setIsUploaded(false);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploaded(true);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + 'b';
    const kb = bytes / 1024;
    if (kb < 1024) return Math.round(kb) + 'kb';
    const mb = kb / 1024;
    return mb.toFixed(1) + 'mb';
  };

  return (
    <div className="bg-[#FEFCFA] min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Submit Provisional</h1>
          <p className="text-gray-500">détail khrff tehna à écrire</p>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-16 my-8 flex flex-col items-center justify-center bg-white min-h-[400px] ${isDragging ? 'border-orange-500' : 'border-gray-300'}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <h2 className="text-3xl font-bold text-orange-500 mb-8">Drag & Drop</h2>

          <img src="/upload.svg" alt="File Icon" className="w-24 h-24 mb-12" />

          <p className="text-lg text-gray-600">
            Drop the report here, or{' '}
            <button
              onClick={handleBrowseClick}
              className="text-orange-500 bg-white hover:text-orange-600 underline"
            >
              browse your files
            </button>
          </p>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Upload Status */}
        {file && (
          <div className="bg-white p-6 mt-8 rounded-lg shadow flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-4 mr-4">
                <img src="/uploaded-item.svg" alt="Document" className="w-8 h-8" />
              </div>
              <div>
                {isUploaded ? (
                  <div className="flex items-center font-medium text-green-600 mb-1">
                    <input
                      type="checkbox"
                      checked
                      readOnly
                      className="w-4 h-4 mr-2 accent-green-600 bg-green-100 border-green-300 rounded"
                    />
                    Upload completed
                  </div>
                ) : null}
                <p className="text-gray-700">{file.name}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-gray-500">Size: {formatFileSize(file.size)}</span>
                  <span className="text-gray-500">{uploadProgress}%</span>
                </div>
                <div className="w-full max-w-md bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <button
              className={`px-8 py-3 rounded-lg font-medium ${isUploaded ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              disabled={!isUploaded}
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}