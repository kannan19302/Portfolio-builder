import React from 'react';

const AboutSection = ({ section }) => {
  const { content } = section;

  return (
    <section id={section.name} className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {section.title || 'About Me'}
          </h2>
          <div className="w-20 h-1 bg-primary-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            {content.description && (
              <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                {content.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-600 dark:text-gray-300 mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {content.skills && content.skills.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Skills & Technologies
                </h3>
                <div className="flex flex-wrap gap-3">
                  {content.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Image or additional content */}
          <div className="flex justify-center">
            {content.image ? (
              <img
                src={content.image}
                alt="About"
                className="rounded-lg shadow-lg max-w-full h-auto"
              />
            ) : (
              <div className="w-full max-w-md h-64 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-primary-400 dark:text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">Add your photo</p>
                </div>
              </div>
            )}
          </div>
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

export default AboutSection;