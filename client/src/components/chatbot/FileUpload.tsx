import React, { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  selectedFile: File | null;
  onClearFile: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isUploading,
  selectedFile,
  onClearFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/jpg",
          "application/pdf",
        ];
        if (allowedTypes.includes(file.type)) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <FileText className="w-4 h-4 text-red-500" />;
    }
    return <ImageIcon className="w-4 h-4 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
        onChange={handleFileChange}
        className="hidden"
        id="prescription-upload"
      />

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 bg-secondary/10 border-2 border-dashed border-secondary rounded-xl flex items-center justify-center backdrop-blur-sm"
          >
            <div className="text-center">
              <Paperclip className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm font-medium text-secondary">
                Drop prescription here
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="p-2 rounded-lg text-light-text/50 dark:text-dark-text/50 hover:text-secondary hover:bg-secondary/10 transition-all duration-200 disabled:opacity-50"
        title="Upload prescription (Image or PDF)"
      >
        <Paperclip className="w-5 h-5" />
      </button>

      {/* Selected file preview */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[240px]"
          >
            <div className="flex items-center gap-3">
              {/* Preview */}
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {selectedFile.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  getFileIcon(selectedFile)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-light-text dark:text-dark-text">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-light-text/50 dark:text-dark-text/50">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearFile();
                }}
                className="p-1 rounded-full hover:bg-red-500/10 text-light-text/40 dark:text-dark-text/40 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isUploading && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <motion.div
                    className="bg-gradient-to-r from-secondary to-accent h-1.5 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 3,
                      ease: "easeInOut",
                      repeat: Infinity,
                    }}
                  />
                </div>
                <p className="text-xs text-secondary mt-1">Analyzing...</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
