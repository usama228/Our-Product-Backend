const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Base Directories ---
const baseDir = path.join(__dirname, '../uploads');
const profileDir = path.join(baseDir, 'profiles');
const documentDir = path.join(baseDir, 'documents');
const taskDir = path.join(baseDir, 'tasks');

// --- Ensure all directories exist ---
fs.mkdirSync(profileDir, { recursive: true });
fs.mkdirSync(documentDir, { recursive: true });
fs.mkdirSync(taskDir, { recursive: true });

// --- Dynamic Storage Engine ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Route files to the correct directory based on the form field name
    if (file.fieldname === 'profilePicture' || file.fieldname === 'coverPhoto') {
      cb(null, profileDir);
    } else if (file.fieldname === 'idCardFrontPic' || file.fieldname === 'idCardBackPic') {
      cb(null, documentDir);
    } else if (file.fieldname === 'submissionFile') {
      cb(null, taskDir);
    } else {
      // Fallback for any unexpected files
      cb(new Error('Invalid file field name'), baseDir);
    }
  },
  filename: (req, file, cb) => {
    // Create a unique filename to prevent collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// --- File Filter for User Images ---
const userImageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// --- File Filter for Task Submissions ---
// Allows a wider range of file types for task submissions
const taskSubmissionFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-rar-compressed'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload a valid document or image.'), false);
  }
};

// --- Multer Instances ---

// Middleware for handling user-related file uploads (profile picture, ID cards)
const uploadUserFiles = multer({
  storage: storage,
  fileFilter: userImageFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
});

// Middleware for handling task submission files
const uploadTaskSubmission = multer({
  storage: storage,
  fileFilter: taskSubmissionFileFilter,
  limits: { fileSize: 1024 * 1024 * 10 } // 10MB limit for task files
});

// --- Exports ---
module.exports = {
  uploadUserFiles,
  uploadTaskSubmission
};
