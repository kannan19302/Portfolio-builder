import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { contentAPI } from '../utils/api';
import ThemeToggle from '../components/ThemeToggle';

// Admin components
import SectionsManager from '../components/admin/SectionsManager';
import SectionEditor from '../components/admin/SectionEditor';
import SettingsManager from '../components/admin/SettingsManager';
import MediaManager from '../components/admin/MediaManager';

const AdminDashboard = () => {
  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sections');

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Update active tab based on current route
    const path = location.pathname.split('/').pop();
    if (['sections', 'settings', 'media'].includes(path)) {
      setActiveTab(path);
    }
  }, [location]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sectionsResponse, settingsResponse] = await Promise.all([
        contentAPI.getAdminSections(),
        contentAPI.getSettings()
      ]);
      
      setSections(sectionsResponse.data);
      setSettings(settingsResponse.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navigateToTab = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Portfolio Admin
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
              >
                View Site
              </a>
              
              <ThemeToggle />
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => navigateToTab('sections')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sections'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Sections
            </button>
            
            <button
              onClick={() => navigateToTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
            
            <button
              onClick={() => navigateToTab('media')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'media'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Media
            </button>
          </nav>
        </div>

        {/* Content */}
        <Routes>
          <Route 
            path="/" 
            element={
              <SectionsManager 
                sections={sections} 
                setSections={setSections}
                onRefresh={fetchData}
              />
            } 
          />
          <Route 
            path="/sections" 
            element={
              <SectionsManager 
                sections={sections} 
                setSections={setSections}
                onRefresh={fetchData}
              />
            } 
          />
          <Route 
            path="/sections/:id/edit" 
            element={
              <SectionEditor 
                sections={sections}
                onRefresh={fetchData}
              />
            } 
          />
          <Route 
            path="/settings" 
            element={
              <SettingsManager 
                settings={settings}
                setSettings={setSettings}
                onRefresh={fetchData}
              />
            } 
          />
          <Route 
            path="/media" 
            element={<MediaManager />} 
          />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;