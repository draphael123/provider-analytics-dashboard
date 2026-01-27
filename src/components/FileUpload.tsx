import { useRef } from 'react';
import { FileSpreadsheet } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.xlsx')) {
      onFileSelect(file);
    } else {
      alert('Please select a valid Excel file (.xlsx)');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      onFileSelect(file);
    } else {
      alert('Please select a valid Excel file (.xlsx)');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors cursor-pointer bg-white dark:bg-gray-900"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />
      {isLoading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Processing file...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <FileSpreadsheet className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Excel File
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Drag and drop your Excel file here, or click to browse
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Supports .xlsx and .xls files
          </p>
        </div>
      )}
    </div>
  );
}

