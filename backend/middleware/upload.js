// ============================================
// middleware/upload.js — Multer + Cloudinary upload middleware
// ============================================

const multer = require('multer');
const { randomUUID } = require('node:crypto');
const path = require('node:path');
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
        cb(Object.assign(new Error(errorMessage), { statusCode: 400 }), false);
    }
};

// Helper to create a Cloudinary storage instance for a given folder
const createStorage = (folder, allowedFormats) => ({
    _handleFile(req, file, callback) {
        const image = IMAGE_MIME_TYPES.includes(file.mimetype);
        const extension = path.extname(file.originalname).slice(1).toLowerCase();
        if (!allowedFormats.includes(extension)) {
            return callback(Object.assign(new Error('Unsupported file extension'), { statusCode: 400 }));
        }
        const options = {
            folder: 'vgec/' + folder,
            resource_type: image ? 'image' : 'raw',
            type: ['results', 'submissions'].includes(folder) ? 'authenticated' : 'upload',
            allowed_formats: allowedFormats,
            public_id: image ? randomUUID() : randomUUID() + '.' + extension,
        };
        const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
            if (err) return callback(err);
            callback(null, { path: result.secure_url, filename: result.public_id, size: result.bytes,
                resourceType: options.resource_type, deliveryType: options.type });
        });
        file.stream.pipe(stream);
    },
    _removeFile(req, file, callback) {
        cloudinary.uploader.destroy(file.filename, {
            resource_type: file.resourceType, type: file.deliveryType, invalidate: true,
        }, callback);
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
    storage: createStorage('assignments', ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', 'rar']),
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
    storage: createStorage('submissions', ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', 'rar']),
    fileFilter: makeFileFilter(DOCUMENT_MIME_TYPES, 'Only PDF, DOC, DOCX, PPT, PPTX, ZIP, and RAR files are allowed'),
    limits: { fileSize: 20 * 1024 * 1024 }
});
const uploadResult = multer({
    storage: createStorage('results', ['pdf']),
    fileFilter: makeFileFilter(PDF_MIME_TYPES, 'Only PDF files are allowed'),
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
    uploadResult,
};
