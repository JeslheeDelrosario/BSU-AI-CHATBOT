import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directories exist
const joinRequestsDir = path.join(__dirname, '../../uploads/join-requests');
const postAttachmentsDir = path.join(__dirname, '../../uploads/post-attachments');

if (!fs.existsSync(joinRequestsDir)) {
  fs.mkdirSync(joinRequestsDir, { recursive: true });
}
if (!fs.existsSync(postAttachmentsDir)) {
  fs.mkdirSync(postAttachmentsDir, { recursive: true });
}

// Configure storage for join requests
const joinRequestStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, joinRequestsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storage for post attachments
const postAttachmentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, postAttachmentsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for PDF and DOCX only (join requests)
const joinRequestFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'));
  }
};

// File filter for post attachments (broader support)
const postAttachmentFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'));
  }
};

// Configure multer for join requests
export const uploadJoinRequestFiles = multer({
  storage: joinRequestStorage,
  fileFilter: joinRequestFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Configure multer for post attachments
export const uploadPostAttachments = multer({
  storage: postAttachmentStorage,
  fileFilter: postAttachmentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});
