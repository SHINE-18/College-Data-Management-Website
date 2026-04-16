const cloudinary = require('../config/cloudinary');

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} buffer - The file buffer
 * @param {string} folder - The destination folder in Cloudinary
 * @param {string} resourceType - The type of resource ('image', 'raw', 'video')
 * @returns {Promise<Object>} - The Cloudinary upload result
 */
const uploadToCloudinary = (buffer, folder, resourceType = 'auto') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `vgec/${folder}`,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

/**
 * Deletes a resource from Cloudinary
 * @param {string} publicId - The public ID of the resource
 * @param {string} resourceType - The type of resource ('image', 'raw', 'video')
 * @returns {Promise<Object>} - The Cloudinary deletion result
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

/**
 * Extracts public ID from a Cloudinary URL
 * @param {string} url - The Cloudinary URL
 * @returns {string|null} - The public ID or null
 */
const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    try {
        // Example URL: https://res.cloudinary.com/demo/image/upload/v1571218039/sample.jpg
        // Public ID is everything after /upload/ (excluding the version and extension if needed)
        // For 'raw' files, the extension is often part of the public ID.
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;
        
        // Remove everything before and including 'upload/vXXXXXXXX/'
        // The version starts with 'v' followed by digits.
        const pathParts = parts.slice(uploadIndex + 1);
        if (pathParts[0].startsWith('v') && /^\d+$/.test(pathParts[0].substring(1))) {
            pathParts.shift();
        }
        
        const publicIdWithExt = pathParts.join('/');
        // For images, we usually remove the extension. For raw, we keep it.
        // But the destroy API is flexible. Let's return the publicIdWithExt.
        return publicIdWithExt.replace(/\.[^/.]+$/, "");
    } catch (err) {
        return null;
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
    getPublicIdFromUrl
};
