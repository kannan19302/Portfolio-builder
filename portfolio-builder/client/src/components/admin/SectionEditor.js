import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentAPI } from '../../utils/api';

const SectionEditor = ({ sections, onRefresh }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    fetchSection();
  }, [id]);

  const fetchSection = async () => {
    try {
      setLoading(true);
      const response = await contentAPI.getSection(id);
      setSection(response.data);
    } catch (error) {
      console.error('Error fetching section:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await contentAPI.updateSection(id, section);
      onRefresh();
      navigate('/admin/sections');
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Error saving section. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (field, value) => {
    setSection(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateContent = (field, value) => {
    setSection(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
  };

  const updateContentArray = (field, index, value) => {
    setSection(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: prev.content[field].map((item, i) => 
          i === index ? value : item
        )
      }
    }));
  };

  const addToContentArray = (field, newItem) => {
    setSection(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: [...(prev.content[field] || []), newItem]
      }
    }));
  };

  const removeFromContentArray = (field, index) => {
    setSection(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: prev.content[field].filter((_, i) => i !== index)
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Section not found.</p>
        <button
          onClick={() => navigate('/admin/sections')}
          className="btn-primary mt-4"
        >
          Back to Sections
        </button>
      </div>
    );
  }

  const renderContentEditor = () => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={section.content.subtitle || ''}
                onChange={(e) => updateContent('subtitle', e.target.value)}
                className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="e.g., Full Stack Developer & Designer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={section.content.description || ''}
                onChange={(e) => updateContent('description', e.target.value)}
                rows={3}
                className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Brief description about yourself"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={section.content.buttonText || ''}
                  onChange={(e) => updateContent('buttonText', e.target.value)}
                  className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., View My Work"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Button Link
                </label>
                <input
                  type="text"
                  value={section.content.buttonLink || ''}
                  onChange={(e) => updateContent('buttonLink', e.target.value)}
                  className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., #projects"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Button Text
                </label>
                <input
                  type="text"
                  value={section.content.secondaryButtonText || ''}
                  onChange={(e) => updateContent('secondaryButtonText', e.target.value)}
                  className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., Contact Me"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Button Link
                </label>
                <input
                  type="text"
                  value={section.content.secondaryButtonLink || ''}
                  onChange={(e) => updateContent('secondaryButtonLink', e.target.value)}
                  className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., #contact"
                />
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={section.content.description || ''}
                onChange={(e) => updateContent('description', e.target.value)}
                rows={6}
                className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Tell your story..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Image URL
              </label>
              <input
                type="url"
                value={section.content.image || ''}
                onChange={(e) => updateContent('image', e.target.value)}
                className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="https://example.com/your-photo.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skills
              </label>
              <div className="space-y-2">
                {(section.content.skills || []).map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateContentArray('skills', index, e.target.value)}
                      className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      placeholder="Skill name"
                    />
                    <button
                      onClick={() => removeFromContentArray('skills', index)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addToContentArray('skills', '')}
                  className="btn-secondary text-sm"
                >
                  Add Skill
                </button>
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Section Description
              </label>
              <textarea
                value={section.content.description || ''}
                onChange={(e) => updateContent('description', e.target.value)}
                rows={3}
                className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Brief description of your projects"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Projects
              </label>
              <div className="space-y-6">
                {(section.content.projects || []).map((project, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Project {index + 1}
                      </h4>
                      <button
                        onClick={() => removeFromContentArray('projects', index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={project.title || ''}
                          onChange={(e) => updateContentArray('projects', index, { ...project, title: e.target.value })}
                          className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          placeholder="Project title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Image URL
                        </label>
                        <input
                          type="url"
                          value={project.image || ''}
                          onChange={(e) => updateContentArray('projects', index, { ...project, image: e.target.value })}
                          className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          placeholder="https://example.com/project-image.jpg"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={project.description || ''}
                        onChange={(e) => updateContentArray('projects', index, { ...project, description: e.target.value })}
                        rows={3}
                        className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        placeholder="Project description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Live Demo URL
                        </label>
                        <input
                          type="url"
                          value={project.link || ''}
                          onChange={(e) => updateContentArray('projects', index, { ...project, link: e.target.value })}
                          className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          placeholder="https://your-project.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          GitHub URL
                        </label>
                        <input
                          type="url"
                          value={project.github || ''}
                          onChange={(e) => updateContentArray('projects', index, { ...project, github: e.target.value })}
                          className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          placeholder="https://github.com/username/repo"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Technologies (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={(project.technologies || []).join(', ')}
                        onChange={(e) => updateContentArray('projects', index, { 
                          ...project, 
                          technologies: e.target.value.split(',').map(tech => tech.trim()).filter(tech => tech)
                        })}
                        className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        placeholder="React, Node.js, MongoDB"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addToContentArray('projects', {
                    title: '',
                    description: '',
                    image: '',
                    link: '',
                    github: '',
                    technologies: []
                  })}
                  className="btn-secondary"
                >
                  Add Project
                </button>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={section.content.description || ''}
                onChange={(e) => updateContent('description', e.target.value)}
                rows={3}
                className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Contact section description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={section.content.email || ''}
                  onChange={(e) => updateContent('email', e.target.value)}
                  className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={section.content.phone || ''}
                  onChange={(e) => updateContent('phone', e.target.value)}
                  className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={section.content.location || ''}
                onChange={(e) => updateContent('location', e.target.value)}
                className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Social Links
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    GitHub
                  </label>
                  <input
                    type="url"
                    value={section.content.social?.github || ''}
                    onChange={(e) => updateContent('social', { 
                      ...section.content.social, 
                      github: e.target.value 
                    })}
                    className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="https://github.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={section.content.social?.linkedin || ''}
                    onChange={(e) => updateContent('social', { 
                      ...section.content.social, 
                      linkedin: e.target.value 
                    })}
                    className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={section.content.social?.twitter || ''}
                    onChange={(e) => updateContent('social', { 
                      ...section.content.social, 
                      twitter: e.target.value 
                    })}
                    className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={section.content.description || ''}
                onChange={(e) => updateContent('description', e.target.value)}
                rows={6}
                className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="Section content..."
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/admin/sections')}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-2 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Sections
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Section: {section.title}
          </h2>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'content'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Content
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Settings
          </button>
          
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'custom'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Custom Code
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'content' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Section Content
            </h3>
            
            {/* Basic Settings */}
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={section.title || ''}
                    onChange={(e) => updateSection('title', e.target.value)}
                    className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="Section title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Section ID
                  </label>
                  <input
                    type="text"
                    value={section.name || ''}
                    onChange={(e) => updateSection('name', e.target.value)}
                    className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="section-id"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_visible"
                  checked={section.is_visible}
                  onChange={(e) => updateSection('is_visible', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_visible" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Visible on site
                </label>
              </div>
            </div>

            {/* Type-specific Content */}
            {renderContentEditor()}
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Section Settings
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Section Type
                </label>
                <select
                  value={section.type}
                  onChange={(e) => updateSection('type', e.target.value)}
                  className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                >
                  <option value="hero">Hero Section</option>
                  <option value="about">About Section</option>
                  <option value="projects">Projects Section</option>
                  <option value="contact">Contact Section</option>
                  <option value="custom">Custom Section</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Settings (JSON)
                </label>
                <textarea
                  value={JSON.stringify(section.settings || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const settings = JSON.parse(e.target.value);
                      updateSection('settings', settings);
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={6}
                  className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white font-mono text-sm"
                  placeholder='{"key": "value"}'
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Additional settings in JSON format
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Custom Code
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom HTML
                </label>
                <textarea
                  value={section.custom_html || ''}
                  onChange={(e) => updateSection('custom_html', e.target.value)}
                  rows={8}
                  className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white font-mono text-sm"
                  placeholder="<div>Your custom HTML here</div>"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom CSS
                </label>
                <textarea
                  value={section.custom_css || ''}
                  onChange={(e) => updateSection('custom_css', e.target.value)}
                  rows={8}
                  className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white font-mono text-sm"
                  placeholder=".custom-class { color: red; }"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom JavaScript
                </label>
                <textarea
                  value={section.custom_js || ''}
                  onChange={(e) => updateSection('custom_js', e.target.value)}
                  rows={8}
                  className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white font-mono text-sm"
                  placeholder="console.log('Custom JS');"
                />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                      Security Warning
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Custom code will be executed on your website. Only add code from trusted sources.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionEditor;