import React from 'react';

const CustomSection = ({ section }) => {
  const { content } = section;

  return (
    <section id={section.name} className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.title && (
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {section.title}
            </h2>
            <div className="w-20 h-1 bg-primary-600 mx-auto"></div>
          </div>
        )}

        {/* Default content rendering */}
        {content.description && (
          <div className="prose prose-lg dark:prose-invert max-w-none text-center">
            {content.description.split('\n').map((paragraph, index) => (
              <p key={index} className="text-gray-600 dark:text-gray-300 mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {/* Custom HTML content */}
        {section.custom_html && (
          <div 
            className="custom-content"
            dangerouslySetInnerHTML={{ __html: section.custom_html }} 
          />
        )}
      </div>
      
      {/* Custom CSS */}
      {section.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: section.custom_css }} />
      )}
      
      {/* Custom JavaScript */}
      {section.custom_js && (
        <script dangerouslySetInnerHTML={{ __html: section.custom_js }} />
      )}
    </section>
  );
};

export default CustomSection;