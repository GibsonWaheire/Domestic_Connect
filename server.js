import jsonServer from 'json-server';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Use default middlewares
server.use(middlewares);

// Add file upload endpoint
server.post('/upload-photo', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Create photo URL
    const photoUrl = `http://localhost:3002/uploads/${req.file.filename}`;
    
    // Store photo reference in database
    const photos = router.db.get('photos') || [];
    const newPhoto = {
      id: Date.now().toString(),
      userId: userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      photoUrl: photoUrl,
      uploadedAt: new Date().toISOString()
    };
    
    photos.push(newPhoto);
    router.db.set('photos', photos).write();

    res.json({ 
      success: true, 
      photoUrl: photoUrl,
      message: 'Photo uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Serve uploaded files
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use router
server.use(router);

const port = 3002;
server.listen(port, () => {
  console.log(`JSON Server with file upload is running on port ${port}`);
  console.log(`Upload endpoint: http://localhost:${port}/upload-photo`);
  console.log(`Uploads directory: ${path.join(__dirname, 'uploads')}`);
});
