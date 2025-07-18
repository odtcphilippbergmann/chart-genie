import React, { useCallback, useState, useEffect } from "react";
import { Upload, FileText, Database, Image, Send, X } from "lucide-react";
import { animate } from "motion";

interface FileUploadProps {
  onFileSelect: (file: File, context?: string) => void;
  loading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  loading = false,
}) => {
  const [context, setContext] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        setSelectedFile(files[0]);
      }
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setSelectedFile(files[0]);
      }
    },
    []
  );

  // Animate when file is selected
  useEffect(() => {
    if (selectedFile) {
      animate(
        ".file-selected-content",
        { opacity: [0, 1], y: [20, 0] },
        { duration: 0.6 }
      );
    }
  }, [selectedFile]);

  const handleSendFile = useCallback(() => {
    if (selectedFile) {
      onFileSelect(selectedFile, context);
    }
  }, [selectedFile, context, onFileSelect]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const getSupportedFormats = () => [
    { icon: FileText, name: "CSV" },
    { icon: Database, name: "JSON" },
    { icon: Image, name: "Excel / XLSX" },
  ];

  if (loading) {
    return (
      <div
        className="flex items-center justify-center p-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <div className="relative">
            <div
              className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 mx-auto mb-6"
              aria-hidden="true"
            ></div>
            <div
              className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-indigo-600 mx-auto"
              aria-hidden="true"
            ></div>
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Processing your file...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Please wait while we analyze your data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      role="button"
      tabIndex={0}
      aria-label="Upload data file by dragging and dropping or clicking to browse"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          document.getElementById("file-upload")?.click();
        }
      }}
      className="relative p-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border-2 border-dashed border-gray-300/50 dark:border-gray-600/50 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/20 shadow-lg hover:shadow-xl group"
    >
      <div className="flex flex-col items-center justify-center text-center">
        {!selectedFile ? (
          <>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Upload your data file
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 font-light max-w-md">
              Drag and drop your file here, or click to browse
            </p>

            <input
              type="file"
              accept=".csv,.json,.xlsx,.xls"
              onChange={handleFileInput}
              className="sr-only"
              id="file-upload"
              aria-describedby="file-upload-description"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-2xl cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
            >
              <Upload className="w-5 h-5 mr-3" aria-hidden="true" />
              Choose File
            </label>
            <p id="file-upload-description" className="sr-only">
              Supported file formats: CSV, JSON, Excel (XLSX, XLS)
            </p>

            <div className="mt-12">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
                Supported formats
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="list">
                {getSupportedFormats().map((format) => {
                  const IconComponent = format.icon;
                  return (
                    <li
                      key={format.name}
                      className="flex items-center p-5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl mr-4">
                        <IconComponent
                          className="w-6 h-6 text-indigo-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {format.name}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        ) : (
          <div className="file-selected-content">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              File Ready for Analysis
            </h3>
            
            {/* Selected File Display */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 w-full max-w-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Context Input Field */}
            <div className="w-full max-w-md mb-6">
              <label htmlFor="data-context" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What is this data about? (Optional)
              </label>
              <textarea
                id="data-context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="e.g., Monthly sales data from our e-commerce platform, Customer survey responses, Financial performance metrics..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Help the AI understand your data better for more accurate insights
              </p>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendFile}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-500/30"
            >
              <Send className="w-5 h-5 mr-3" aria-hidden="true" />
              Analyze Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
