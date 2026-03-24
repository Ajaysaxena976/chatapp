const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const ApiError = require('../utils/api-error');
const httpStatus = require('http-status');
const logger = require('../config/logger');

// --- Validation Configuration ---
// Define allowed file types and maximum size for easy management.
const ALLOWED_MIME_TYPES = [
    // Standard Web Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    
    // Modern & High-Efficiency Images
    'image/avif',
    'image/heic',
    'image/heif',

    // Vector Graphics
    'image/svg+xml',

    // Other Common Formats
    'image/tiff',
    'image/bmp',
    'image/vnd.microsoft.icon', // For .ico files

    // Video Formats (from your original list)
    'image/jpg'
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

function cleanFilename(filename) {
    const basename = path.basename(filename);
    const cleanName = basename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const ext = path.extname(cleanName);
    const nameWithoutExt = path.basename(cleanName, ext);
    return `${nameWithoutExt}_${timestamp}${ext}`;
}

const uploadMediaService = async (data) => { // Removed `res` as it's not used here


    try {
        console.log(data.req.file,"------------------------------------------------------------------")
        let file = data.req.file
        // --- 1. File Validation ---
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new ApiError(httpStatus.BAD_REQUEST,`Invalid file type. Only ${ALLOWED_MIME_TYPES.join(', ')} are allowed.`);
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            throw new ApiError(httpStatus.BAD_REQUEST,`File is too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`);
        }

        // --- 2. Upload Logic (unchanged) ---
        const bucketName = process.env.R2_BUCKET_NAME;
        const key = `${Date.now()}-${cleanFilename(file.originalname)}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            })
        );

        const url = `https://${process.env.R2_PUBLIC_DOMAIN}/${key}`;
        return { url };
    } catch (err) {
        console.error('Upload error:', err);
        throw err;
    }
};

module.exports = { uploadMediaService };