const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${base || 'media'}-${unique}${ext}`);
  },
});

// Filter allowed mime types (images and videos)
const fileFilter = (_req, file, cb) => {
  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');
  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error('Only image or video files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    // ~100MB for videos, images typically < 10MB
    fileSize: 100 * 1024 * 1024,
  },
});

// POST /api/uploads - single file upload
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const urlPath = `/uploads/${req.file.filename}`;
    return res.json({ success: true, url: urlPath, filename: req.file.filename });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Upload failed' });
  }
});

module.exports = router;
