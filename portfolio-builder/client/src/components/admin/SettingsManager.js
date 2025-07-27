import React, { useState } from 'react';
import { contentAPI } from '../../utils/api';

const SettingsManager = ({ settings, setSettings, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = async () => {
    try {
      setLoading(true);
      await contentAPI.updateSettings(localSettings);
      setSettings(localSettings);
      onRefresh();
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExport = async () => {
    try {
      const response = await contentAPI.exportData();
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'portfolio-backup.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.sections || !data.settings) {
        alert('Invalid backup file format.');
        return;
      }

      if (window.confirm('This will replace all current data. Are you sure?')) {
        await contentAPI.importData(data);
        onRefresh();
        alert('Data imported successfully!');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Error importing data. Please check the file format.');
    }
    
    // Reset file input
    event.target.value = '';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Site Settings
        </h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            General Settings
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Title
              </label>
              <input
                type="text"
                value={localSettings.site_title || ''}
                onChange={(e) => updateSetting('site_title', e.target.value)}
                className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="My Portfolio"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Description
              </label>
              <textarea
                value={localSettings.site_description || ''}
                onChange={(e) => updateSetting('site_description', e.target.value)}
                rows={3}
                className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="A brief description of your portfolio"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={localSettings.primary_color || '#3B82F6'}
                  onChange={(e) => updateSetting('primary_color', e.target.value)}
                  className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={localSettings.primary_color || '#3B82F6'}
                  onChange={(e) => updateSetting('primary_color', e.target.value)}
                  className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white flex-1"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Family
              </label>
              <select
                value={localSettings.font_family || 'Inter'}
                onChange={(e) => updateSetting('font_family', e.target.value)}
                className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Poppins">Poppins</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>
          </div>
        </div>

        {/* Backup & Import */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Backup & Import
          </h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Export Data
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Download a backup of all your portfolio data including sections, settings, and content.
              </p>
              <button
                onClick={handleExport}
                className="btn-secondary w-full"
              >
                Export Portfolio Data
              </button>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Import Data
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Import portfolio data from a backup file. This will replace all current data.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100
                  dark:file:bg-primary-900 dark:file:text-primary-300
                  dark:hover:file:bg-primary-800"
              />
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    Important
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Always backup your data before importing. Import will replace all existing content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="card p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Advanced Settings
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom CSS
            </label>
            <textarea
              value={localSettings.custom_css || ''}
              onChange={(e) => updateSetting('custom_css', e.target.value)}
              rows={8}
              className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white font-mono text-sm"
              placeholder="/* Add your custom CSS here */"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Custom CSS will be applied to the entire portfolio site
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Analytics Code
            </label>
            <textarea
              value={localSettings.analytics_code || ''}
              onChange={(e) => updateSetting('analytics_code', e.target.value)}
              rows={4}
              className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white font-mono text-sm"
              placeholder="<!-- Google Analytics or other tracking code -->"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Analytics tracking code (will be added to the head section)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;