import React, { useState, useEffect } from 'react';
import { contentAPI } from '../utils/api';
import ThemeToggle from '../components/ThemeToggle';
import HeroSection from '../components/sections/HeroSection';
import AboutSection from '../components/sections/AboutSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import ContactSection from '../components/sections/ContactSection';
import CustomSection from '../components/sections/CustomSection';

const Portfolio = () => {
  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const [sectionsResponse, settingsResponse] = await Promise.all([
        contentAPI.getSections(),
        contentAPI.getSettings()
      ]);
      
      setSections(sectionsResponse.data);
      setSettings(settingsResponse.data);
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (section) => {
    const commonProps = {
      key: section.id,
      section,
      settings
    };

    switch (section.type) {
      case 'hero':
        return <HeroSection {...commonProps} />;
      case 'about':
        return <AboutSection {...commonProps} />;
      case 'projects':
        return <ProjectsSection {...commonProps} />;
      case 'contact':
        return <ContactSection {...commonProps} />;
      default:
        return <CustomSection {...commonProps} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchPortfolioData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Fixed Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {settings.site_title || 'Portfolio'}
              </h1>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.name}`}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                onClick={() => {
                  const menu = document.getElementById('mobile-menu');
                  menu.classList.toggle('hidden');
                }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.name}`}
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={() => {
                  document.getElementById('mobile-menu').classList.add('hidden');
                }}
              >
                {section.title}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {sections.map(renderSection)}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} {settings.site_title || 'Portfolio'}. Built with Portfolio Builder.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;