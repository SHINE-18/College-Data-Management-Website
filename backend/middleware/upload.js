// ============================================
// middleware/upload.js — Multer + Cloudinary upload middleware
// ============================================

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PDF_MIME_TYPES = ['application/pdf'];
const DOCUMENT_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
    'application/vnd.rar',
    'application/x-rar-compressed',
];

const makeFileFilter = (allowedTypes, errorMessage) => (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(errorMessage), false);
    }
};

// Helper to create a Cloudinary storage instance for a given folder
const createStorage = (folder, allowedFormats) =>
    new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => {
            const isImage = IMAGE_MIME_TYPES.includes(file.mimetype);
            const extension = file.originalname.includes('.')
                ? file.originalname.split('.').pop().toLowerCase()
                : undefined;
            return {
                folder: `vgec/${folder}`,
                allowed_formats: allowedFormats,
                resource_type: isImage ? 'image' : 'raw',
                // Preserve file extension for raw uploads so downloads keep the correct type.
                public_id: !isImage && extension
                    ? `${file.originalname.replace(/\.[^/.]+$/, "")}_${Date.now()}.${extension}`
                    : undefined
            };
        },
    });

// Per-resource upload instances
const uploadFaculty = multer({
    storage: createStorage('faculty', ['jpg', 'jpeg', 'png', 'webp']),
    fileFilter: makeFileFilter(IMAGE_MIME_TYPES, 'Only JPEG, PNG, and WebP images are allowed'),
    limits: { fileSize: 5 * 1024 * 1024 }
});
const uploadTimetable = multer({
    storage: createStorage('timetables', ['pdf']),
    fileFilter: makeFileFilter(PDF_MIME_TYPES, 'Only PDF files are allowed'),
    limits: { fileSize: 10 * 1024 * 1024 }
});
const uploadNotice = multer({
    storage: createStorage('notices', ['pdf']),
    fileFilter: makeFileFilter(PDF_MIME_TYPES, 'Only PDF files are allowed'),
    limits: { fileSize: 10 * 1024 * 1024 }
});
const uploadSyllabus = multer({
    storage: createStorage('syllabi', ['pdf']),
    fileFilter: makeFileFilter(PDF_MIME_TYPES, 'Only PDF files are allowed'),
    limits: { fileSize: 20 * 1024 * 1024 }
});
const uploadAssignment = multer({
    storage: createStorage('assignments', ['pdf', 'doc', 'docx', 'zip', 'rar']),
    fileFilter: makeFileFilter(DOCUMENT_MIME_TYPES, 'Only PDF, DOC, DOCX, PPT, PPTX, ZIP, and RAR files are allowed'),
    limits: { fileSize: 20 * 1024 * 1024 }
});
const uploadCircular = multer({
    storage: createStorage('circulars', ['pdf']),
    fileFilter: makeFileFilter(PDF_MIME_TYPES, 'Only PDF files are allowed'),
    limits: { fileSize: 10 * 1024 * 1024 }
});
const uploadResource = multer({
    storage: createStorage('resources', ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', 'rar']),
    fileFilter: makeFileFilter(DOCUMENT_MIME_TYPES, 'Only PDF, DOC, DOCX, PPT, PPTX, ZIP, and RAR files are allowed'),
    limits: { fileSize: 20 * 1024 * 1024 }
});
const uploadEvent = multer({
    storage: createStorage('events', ['jpg', 'jpeg', 'png', 'webp']),
    fileFilter: makeFileFilter(IMAGE_MIME_TYPES, 'Only JPEG, PNG, and WebP images are allowed'),
    limits: { fileSize: 5 * 1024 * 1024 }
});
const uploadSubmission = multer({
    storage: createStorage('submissions', ['pdf', 'doc', 'docx', 'zip', 'rar']),
    fileFilter: makeFileFilter(DOCUMENT_MIME_TYPES, 'Only PDF, DOC, DOCX, PPT, PPTX, ZIP, and RAR files are allowed'),
    limits: { fileSize: 20 * 1024 * 1024 }
});

module.exports = {
    uploadFaculty,
    uploadTimetable,
    uploadNotice,
    uploadSyllabus,
    uploadAssignment,
    uploadCircular,
    uploadResource,
    uploadEvent,
    uploadSubmission,
};
