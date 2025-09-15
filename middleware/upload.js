const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Storage configuration for profile pictures
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/profiles');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage configuration for task submissions
const taskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/tasks');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'task-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Storage configuration for documents (ID cards)
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/documents');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'idCardFrontPic' ? 'id-front-' : 
                   file.fieldname === 'idCardBackPic' ? 'id-back-' : 
                   file.fieldname === 'profilePicture' ? 'profile-' : 'doc-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for profile pictures'), false);
  }
};

const taskFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/', 'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/zip', 'application/x-zip-compressed'
  ];
  
  const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
  
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed for task submissions'), false);
  }
};

// Multer configurations
const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const uploadTaskFile = multer({
  storage: taskStorage,
  fileFilter: taskFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Document upload configuration (for ID cards and profile pictures)
const uploadDocuments = multer({
  storage: documentStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = {
  uploadProfile,
  uploadTaskFile,
  uploadDocuments
};