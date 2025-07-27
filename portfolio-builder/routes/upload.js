const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const authRouter = require('./auth');
const authenticateToken = authRouter.authenticateToken;

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter for security
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'text/css',
    'text/javascript',
    'application/javascript'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  }
});

// Upload single file
router.post('/single', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Save file info to database
    const result = await db.run(
      'INSERT INTO media (filename, original_name, mime_type, size, path) VALUES (?, ?, ?, ?, ?)',
      [
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        req.file.path
      ]
    );

    const fileInfo = {
      id: result.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date().toISOString()
    };

    res.json({
      message: 'File uploaded successfully',
      file: fileInfo
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if database save failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload multiple files
router.post('/multiple', authenticateToken, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      try {
        // Save file info to database
        const result = await db.run(
          'INSERT INTO media (filename, original_name, mime_type, size, path) VALUES (?, ?, ?, ?, ?)',
          [
            file.filename,
            file.originalname,
            file.mimetype,
            file.size,
            file.path
          ]
        );

        uploadedFiles.push({
          id: result.id,
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`,
          uploadedAt: new Date().toISOString()
        });

      } catch (dbError) {
        console.error('Database error for file:', file.filename, dbError);
        
        // Clean up file if database save failed
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    res.json({
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    
    // Clean up files if something went wrong
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Get all uploaded files
router.get('/files', authenticateToken, async (req, res) => {
  try {
    const files = await db.all('SELECT * FROM media ORDER BY created_at DESC');
    
    const filesWithUrls = files.map(file => ({
      id: file.id,
      filename: file.filename,
      originalName: file.original_name,
      mimeType: file.mime_type,
      size: file.size,
      url: `/uploads/${file.filename}`,
      uploadedAt: file.created_at
    }));

    res.json(filesWithUrls);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Delete file
router.delete('/files/:id', authenticateToken, async (req, res) => {
  try {
    const fileId = req.params.id;

    // Get file info from database
    const file = await db.get('SELECT * FROM media WHERE id = ?', [fileId]);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(uploadsDir, file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete file record from database
    await db.run('DELETE FROM media WHERE id = ?', [fileId]);

    res.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get file info
router.get('/files/:id', authenticateToken, async (req, res) => {
  try {
    const fileId = req.params.id;

    const file = await db.get('SELECT * FROM media WHERE id = ?', [fileId]);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fileInfo = {
      id: file.id,
      filename: file.filename,
      originalName: file.original_name,
      mimeType: file.mime_type,
      size: file.size,
      url: `/uploads/${file.filename}`,
      uploadedAt: file.created_at
    };

    res.json(fileInfo);

  } catch (error) {
    console.error('Error fetching file info:', error);
    res.status(500).json({ error: 'Failed to fetch file info' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 5 files per request.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field.' });
    }
  }
  
  if (error.message.includes('File type')) {
    return res.status(400).json({ error: error.message });
  }

  next(error);
});

module.exports = router;