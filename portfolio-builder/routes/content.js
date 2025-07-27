const express = require('express');
const db = require('../db/database');
const authRouter = require('./auth');
const authenticateToken = authRouter.authenticateToken;

const router = express.Router();

// Get all sections (public endpoint for portfolio display)
router.get('/sections', async (req, res) => {
  try {
    const sections = await db.all(
      'SELECT * FROM sections WHERE is_visible = 1 ORDER BY sort_order ASC'
    );
    
    // Parse JSON content for each section
    const parsedSections = sections.map(section => ({
      ...section,
      content: section.content ? JSON.parse(section.content) : {},
      settings: section.settings ? JSON.parse(section.settings) : {}
    }));

    res.json(parsedSections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Get all sections for admin (includes hidden sections)
router.get('/admin/sections', authenticateToken, async (req, res) => {
  try {
    const sections = await db.all('SELECT * FROM sections ORDER BY sort_order ASC');
    
    const parsedSections = sections.map(section => ({
      ...section,
      content: section.content ? JSON.parse(section.content) : {},
      settings: section.settings ? JSON.parse(section.settings) : {}
    }));

    res.json(parsedSections);
  } catch (error) {
    console.error('Error fetching admin sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Get single section
router.get('/sections/:id', async (req, res) => {
  try {
    const section = await db.get('SELECT * FROM sections WHERE id = ?', [req.params.id]);
    
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const parsedSection = {
      ...section,
      content: section.content ? JSON.parse(section.content) : {},
      settings: section.settings ? JSON.parse(section.settings) : {}
    };

    res.json(parsedSection);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ error: 'Failed to fetch section' });
  }
});

// Create new section
router.post('/admin/sections', authenticateToken, async (req, res) => {
  try {
    const { name, type, title, content, custom_html, custom_css, custom_js, is_visible, settings } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    // Get the highest sort_order and add 1
    const maxOrder = await db.get('SELECT MAX(sort_order) as max_order FROM sections');
    const sortOrder = (maxOrder.max_order || 0) + 1;

    const result = await db.run(
      `INSERT INTO sections (name, type, title, content, custom_html, custom_css, custom_js, is_visible, sort_order, settings, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        name,
        type,
        title || '',
        JSON.stringify(content || {}),
        custom_html || '',
        custom_css || '',
        custom_js || '',
        is_visible !== undefined ? is_visible : 1,
        sortOrder,
        JSON.stringify(settings || {})
      ]
    );

    const newSection = await db.get('SELECT * FROM sections WHERE id = ?', [result.id]);
    const parsedSection = {
      ...newSection,
      content: newSection.content ? JSON.parse(newSection.content) : {},
      settings: newSection.settings ? JSON.parse(newSection.settings) : {}
    };

    res.status(201).json(parsedSection);
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// Update section
router.put('/admin/sections/:id', authenticateToken, async (req, res) => {
  try {
    const { name, type, title, content, custom_html, custom_css, custom_js, is_visible, settings } = req.body;
    const sectionId = req.params.id;

    const existingSection = await db.get('SELECT * FROM sections WHERE id = ?', [sectionId]);
    if (!existingSection) {
      return res.status(404).json({ error: 'Section not found' });
    }

    await db.run(
      `UPDATE sections SET 
       name = ?, type = ?, title = ?, content = ?, custom_html = ?, custom_css = ?, custom_js = ?, 
       is_visible = ?, settings = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        name || existingSection.name,
        type || existingSection.type,
        title !== undefined ? title : existingSection.title,
        JSON.stringify(content || {}),
        custom_html !== undefined ? custom_html : existingSection.custom_html,
        custom_css !== undefined ? custom_css : existingSection.custom_css,
        custom_js !== undefined ? custom_js : existingSection.custom_js,
        is_visible !== undefined ? is_visible : existingSection.is_visible,
        JSON.stringify(settings || {}),
        sectionId
      ]
    );

    const updatedSection = await db.get('SELECT * FROM sections WHERE id = ?', [sectionId]);
    const parsedSection = {
      ...updatedSection,
      content: updatedSection.content ? JSON.parse(updatedSection.content) : {},
      settings: updatedSection.settings ? JSON.parse(updatedSection.settings) : {}
    };

    res.json(parsedSection);
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// Delete section
router.delete('/admin/sections/:id', authenticateToken, async (req, res) => {
  try {
    const sectionId = req.params.id;

    const existingSection = await db.get('SELECT * FROM sections WHERE id = ?', [sectionId]);
    if (!existingSection) {
      return res.status(404).json({ error: 'Section not found' });
    }

    await db.run('DELETE FROM sections WHERE id = ?', [sectionId]);

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

// Update section order
router.put('/admin/sections/reorder', authenticateToken, async (req, res) => {
  try {
    const { sections } = req.body;

    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: 'Sections must be an array' });
    }

    // Update sort_order for each section
    for (let i = 0; i < sections.length; i++) {
      await db.run(
        'UPDATE sections SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [i + 1, sections[i].id]
      );
    }

    res.json({ message: 'Section order updated successfully' });
  } catch (error) {
    console.error('Error reordering sections:', error);
    res.status(500).json({ error: 'Failed to reorder sections' });
  }
});

// Get site settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await db.all('SELECT * FROM site_settings');
    
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update site settings
router.put('/admin/settings', authenticateToken, async (req, res) => {
  try {
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await db.run(
        `INSERT OR REPLACE INTO site_settings (key, value, updated_at) 
         VALUES (?, ?, CURRENT_TIMESTAMP)`,
        [key, value]
      );
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Export site data
router.get('/admin/export', authenticateToken, async (req, res) => {
  try {
    const sections = await db.all('SELECT * FROM sections ORDER BY sort_order ASC');
    const settings = await db.all('SELECT * FROM site_settings');
    
    const parsedSections = sections.map(section => ({
      ...section,
      content: section.content ? JSON.parse(section.content) : {},
      settings: section.settings ? JSON.parse(section.settings) : {}
    }));

    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    const exportData = {
      sections: parsedSections,
      settings: settingsObj,
      exported_at: new Date().toISOString(),
      version: '1.0.0'
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="portfolio-backup.json"');
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Import site data
router.post('/admin/import', authenticateToken, async (req, res) => {
  try {
    const { sections, settings } = req.body;

    if (!sections || !settings) {
      return res.status(400).json({ error: 'Invalid import data format' });
    }

    // Clear existing data
    await db.run('DELETE FROM sections');
    await db.run('DELETE FROM site_settings');

    // Import sections
    for (const section of sections) {
      await db.run(
        `INSERT INTO sections (name, type, title, content, custom_html, custom_css, custom_js, is_visible, sort_order, settings) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          section.name,
          section.type,
          section.title,
          JSON.stringify(section.content),
          section.custom_html || '',
          section.custom_css || '',
          section.custom_js || '',
          section.is_visible,
          section.sort_order,
          JSON.stringify(section.settings)
        ]
      );
    }

    // Import settings
    for (const [key, value] of Object.entries(settings)) {
      await db.run(
        'INSERT INTO site_settings (key, value) VALUES (?, ?)',
        [key, value]
      );
    }

    res.json({ message: 'Data imported successfully' });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

module.exports = router;