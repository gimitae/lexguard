import React, { useCallback, useState } from 'react';
import { Upload, FileText, Image, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ACCEPTED_EXTENSIONS = '.pdf,.docx,.hwp,.hwpx,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.tif';

const FILE_ICONS = {
  pdf: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
  docx: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
  hwp: { icon: FileText, color: 'text-teal-500', bg: 'bg-teal-50' },
  hwpx: { icon: FileText, color: 'text-teal-500', bg: 'bg-teal-50' },
  image: { icon: Image, color: 'text-green-500', bg: 'bg-green-50' },
};

const getFileType = (filename) => {
  const ext = filename.toLowerCase().split('.').pop();
  if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff', 'tif'].includes(ext)) return 'image';
  return ext;
};

const FileUploadZone = ({ onFileUpload }) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const validateFile = (file) => {
    const maxSize = 20 * 1024 * 1024;
    const allowedExtensions = ['pdf', 'docx', 'hwp', 'hwpx', 'png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff', 'tif'];
    const ext = file.name.toLowerCase().split('.').pop();

    if (file.size > maxSize) {
      return '파일 크기는 20MB를 초과할 수 없습니다.';
    }

    if (!allowedExtensions.includes(ext)) {
      return '지원하지 않는 파일 형식입니다.\n지원 형식: PDF, DOCX, HWP, HWPX, 이미지(PNG/JPG/WEBP/BMP/TIFF)';
    }

    return null;
  };

  const handleFile = useCallback((file) => {
    if (!file) return;

    const errorMsg = validateFile(file);
    if (errorMsg) {
      setError(errorMsg);
      setSelectedFile(null);
      return;
    }

    setError('');
    setSelectedFile(file);
    onFileUpload(file);
  }, [onFileUpload]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const fileType = selectedFile ? getFileType(selectedFile.name) : null;
  const fileIcon = fileType ? FILE_ICONS[fileType] || FILE_ICONS['pdf'] : null;

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex flex-col items-center justify-center w-full min-h-[200px] 
          border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
          ${isDragging
            ? 'border-indigo-500 bg-indigo-50 scale-[1.02]'
            : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/30'
          }
        `}
      >
        <input
          id="file-upload"
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleInputChange}
          className="hidden"
        />

        {selectedFile && fileIcon ? (
          <div className="flex flex-col items-center gap-3 p-8">
            <div className={`w-16 h-16 ${fileIcon.bg} rounded-2xl flex items-center justify-center`}>
              <fileIcon.icon className={`w-8 h-8 ${fileIcon.color}`} />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-900">{selectedFile.name}</p>
              <p className="text-sm text-slate-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <p className="text-xs text-indigo-600 font-bold">
              {t('upload.changeFile', '클릭하여 다른 파일 선택')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-indigo-500" />
            </div>
            <div>
              <p className="font-bold text-slate-900 mb-1">
                {t('upload.title', '파일을 드래그하거나 클릭하여 업로드')}
              </p>
              <p className="text-sm text-slate-500">
                {t('upload.subtitle', '최대 20MB')}
              </p>
            </div>

            {/* 지원 형식 배지 */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { label: 'PDF', color: 'bg-red-100 text-red-700' },
                { label: 'DOCX', color: 'bg-blue-100 text-blue-700' },
                { label: 'HWP', color: 'bg-teal-100 text-teal-700' },
                { label: 'HWPX', color: 'bg-teal-100 text-teal-700' },
                { label: 'PNG/JPG', color: 'bg-green-100 text-green-700' },
                { label: 'WEBP/BMP', color: 'bg-green-100 text-green-700' },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className={`px-2 py-0.5 rounded text-xs font-bold ${badge.color}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </label>

      {error && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;