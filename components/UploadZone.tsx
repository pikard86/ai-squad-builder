import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative cursor-pointer border-2 border-dashed rounded-2xl p-8 md:p-12
          flex flex-col items-center justify-center text-center transition-colors duration-300
          ${isDragging ? 'border-yellow-500 bg-yellow-500/10' : 'border-slate-600 hover:border-yellow-500/50 hover:bg-slate-800/50'}
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          className="hidden"
          onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-yellow-500">Scouting Candidate...</p>
            <p className="text-sm text-slate-400">Analyzing attributes & stats</p>
          </div>
        ) : (
          <>
            <div className={`p-4 rounded-full mb-4 ${isDragging ? 'bg-yellow-500/20' : 'bg-slate-800'}`}>
              <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-yellow-500' : 'text-slate-400'}`} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Drop Resume Here
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Supports PDF, DOCX
            </p>
            <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg text-sm transition-colors">
              Select File
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};
