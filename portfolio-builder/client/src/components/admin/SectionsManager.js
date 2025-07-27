import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { contentAPI } from '../../utils/api';

const SectionsManager = ({ sections, setSections, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSection, setNewSection] = useState({
    name: '',
    type: 'custom',
    title: '',
    is_visible: true
  });

  const navigate = useNavigate();

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for better UX
    setSections(items);

    try {
      await contentAPI.reorderSections(items);
    } catch (error) {
      console.error('Error reordering sections:', error);
      // Revert on error
      onRefresh();
    }
  };

  const handleToggleVisibility = async (sectionId, currentVisibility) => {
    try {
      setLoading(true);
      await contentAPI.updateSection(sectionId, { is_visible: !currentVisibility });
      onRefresh();
    } catch (error) {
      console.error('Error toggling section visibility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) {
      return;
    }

    try {
      setLoading(true);
      await contentAPI.deleteSection(sectionId);
      onRefresh();
    } catch (error) {
      console.error('Error deleting section:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    
    if (!newSection.name || !newSection.title) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await contentAPI.createSection(newSection);
      setShowCreateModal(false);
      setNewSection({
        name: '',
        type: 'custom',
        title: '',
        is_visible: true
      });
      onRefresh();
    } catch (error) {
      console.error('Error creating section:', error);
    } finally {
      setLoading(false);
    }
  };

  const sectionTypes = [
    { value: 'hero', label: 'Hero Section' },
    { value: 'about', label: 'About Section' },
    { value: 'projects', label: 'Projects Section' },
    { value: 'contact', label: 'Contact Section' },
    { value: 'custom', label: 'Custom Section' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Manage Sections
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          Add New Section
        </button>
      </div>

      {/* Sections List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {sections.map((section, index) => (
                <Draggable
                  key={section.id}
                  draggableId={section.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`card p-6 ${
                        snapshot.isDragging ? 'shadow-lg' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                            </svg>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {section.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Type: {section.type} • ID: {section.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Visibility Toggle */}
                          <button
                            onClick={() => handleToggleVisibility(section.id, section.is_visible)}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              section.is_visible
                                ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                            title={section.is_visible ? 'Hide section' : 'Show section'}
                          >
                            {section.is_visible ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => navigate(`/admin/sections/${section.id}/edit`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                            title="Edit section"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                            title="Delete section"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {sections.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">No sections created yet.</p>
        </div>
      )}

      {/* Create Section Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Section
            </h3>
            
            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Section Name (ID)
                </label>
                <input
                  type="text"
                  value={newSection.name}
                  onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                  className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., about, projects, custom-section"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Section Type
                </label>
                <select
                  value={newSection.type}
                  onChange={(e) => setNewSection({ ...newSection, type: e.target.value })}
                  className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {sectionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  className="input-field dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., About Me, My Projects"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_visible"
                  checked={newSection.is_visible}
                  onChange={(e) => setNewSection({ ...newSection, is_visible: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_visible" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Visible on site
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Creating...' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionsManager;