import React from 'react';

const HeroSection = ({ section }) => {
  const { content } = section;

  return (
    <section id={section.name} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {section.title || 'Welcome to My Portfolio'}
          </h1>
          
          {content.subtitle && (
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6">
              {content.subtitle}
            </p>
          )}
          
          {content.description && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              {content.description}
            </p>
          )}
          
          {content.buttonText && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={content.buttonLink || '#projects'}
                className="btn-primary text-lg px-8 py-3 inline-block"
              >
                {content.buttonText}
              </a>
              
              {content.secondaryButtonText && (
                <a
                  href={content.secondaryButtonLink || '#contact'}
                  className="btn-secondary text-lg px-8 py-3 inline-block"
                >
                  {content.secondaryButtonText}
                </a>
              )}
            </div>
          )}
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
      
      {/* Custom HTML/CSS/JS */}
      {section.custom_html && (
        <div dangerouslySetInnerHTML={{ __html: section.custom_html }} />
      )}
      
      {section.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: section.custom_css }} />
      )}
      
      {section.custom_js && (
        <script dangerouslySetInnerHTML={{ __html: section.custom_js }} />
      )}
    </section>
  );
};

export default HeroSection;