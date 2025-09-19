
import React from 'react';

interface FileInputProps {
  label: string;
  name: string;
  currentFileUrl?: string;
  onFileChange: (name: string, fileUrl: string) => void;
  onFileRemove: (name: string) => void;
  accept?: string;
}

const FileInput: React.FC<FileInputProps> = ({ label, name, currentFileUrl, onFileChange, onFileRemove, accept = "image/*,.pdf" }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const fileUrl = loadEvent.target?.result as string;
        onFileChange(name, fileUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const isImage = currentFileUrl?.startsWith('data:image');

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 flex items-center space-x-4">
        {currentFileUrl ? (
          <div className="flex-shrink-0">
            {isImage ? (
              <img src={currentFileUrl} alt={label} className="h-12 w-12 rounded-md object-cover" />
            ) : (
              <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Document</a>
            )}
          </div>
        ) : (
          <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
        <div className="flex-grow flex items-center">
          <label htmlFor={name} className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <span>{currentFileUrl ? 'Change' : 'Upload'}</span>
            <input id={name} name={name} type="file" className="sr-only" onChange={handleFileChange} accept={accept} />
          </label>
          {currentFileUrl && (
            <button type="button" onClick={() => onFileRemove(name)} className="ml-3 text-sm text-danger hover:underline">
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileInput;
