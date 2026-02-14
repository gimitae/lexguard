import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

const FileUploadZone = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`w-full max-w-2xl p-10 border-2 border-dashed rounded-[32px] transition-all relative ${
        dragActive 
          ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center">
          <Upload className={`w-8 h-8 ${dragActive ? 'text-indigo-600' : 'text-slate-400'}`} />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-slate-900">PDF 또는 Word 파일을 드래그하세요</p>
          <p className="text-slate-400 text-sm mt-1">최대 20MB까지 업로드 가능</p>
        </div>
        <button 
          onClick={handleButtonClick}
          className="mt-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95"
        >
          내 컴퓨터에서 파일 찾기
        </button>
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileInput}
          aria-label="파일 선택"
        />
      </div>
    </div>
  );
};

export default FileUploadZone;