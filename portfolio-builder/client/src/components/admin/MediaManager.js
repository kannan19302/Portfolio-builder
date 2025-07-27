import React, { useState, useEffect } from 'react';
import { uploadAPI } from '../../utils/api';

const MediaManager = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await uploadAPI.getFiles();
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const uploadFiles = Array.from(event.target.files);
    if (uploadFiles.length === 0) return;

    try {
      setUploading(true);
      
      if (uploadFiles.length === 1) {
        await uploadAPI.uploadSingle(uploadFiles[0]);
      } else {
        await uploadAPI.uploadMultiple(uploadFiles);
      }
      
      fetchFiles();
      event.target.value = ''; // Reset file input
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await uploadAPI.deleteFile(fileId);
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file. Please try again.');
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('URL copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy URL to clipboard.');
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (mimeType) => {
    return mimeType.startsWith('image/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Media Manager
        </h2>
        
        <div className="flex items-center space-x-4">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
            accept="image/*,.pdf,.txt,.css,.js"
          />
          <label
            htmlFor="file-upload"
            className={`btn-primary cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </label>
        </div>
      </div>

      {/* Upload Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
          Supported File Types
        </h3>
        <p className="text-sm text-blue-600 dark:text-blue-300">
          Images: JPEG, PNG, GIF, WebP, SVG | Documents: PDF, TXT | Code: CSS, JS
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
          Maximum file size: 10MB per file
        </p>
      </div>

      {/* Files Grid */}
      {files.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {files.map((file) => (
            <div key={file.id} className="card overflow-hidden">
              {/* File Preview */}
              <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {isImage(file.mimeType) ? (
                  <img
                    src={file.url}
                    alt={file.originalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {file.mimeType.split('/')[1].toUpperCase()}
                    </p>
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                  {file.originalName}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {formatFileSize(file.size)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => copyToClipboard(file.url)}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                  >
                    Copy URL
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      title="View file"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </a>
                    
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete file"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 mb-4">No files uploaded yet.</p>
          <label
            htmlFor="file-upload"
            className="btn-primary cursor-pointer"
          >
            Upload Your First File
          </label>
        </div>
      )}
    </div>
  );
};

export default MediaManager;