const crypto = require('crypto');
const config = require('../config/config')

// Your secret key (change this to your own secret)
const SECRET_KEY = crypto.createHash('sha256').update(config.jwt.secret).digest();

/**
 * Sanitize user input for logging to prevent log injection
 * @param {any} input - The input to sanitize
 * @returns {string} - Sanitized string safe for logging
 */
function sanitizeForLog(input) {
    if (input === null || input === undefined) {
        return 'null';
    }

    const str = String(input);
    // Remove control characters, newlines, and potential injection patterns
    return str.replace(/[\r\n\t\x00-\x1f\x7f-\x9f]/g, '')
        .replace(/[<>'"&]/g, (char) => {
            const entities = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' };
            return entities[char];
        })
        .substring(0, 1000); // Limit length
}

/**
 * Recursively validate object for dangerous properties
 * @param {object} obj - Object to validate
 */
function validateObjectSafety(obj) {
    if (obj === null || typeof obj !== 'object') return;

    for (const key in obj) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            throw new Error('Dangerous property detected: ' + key);
        }
        if (typeof obj[key] === 'object') {
            validateObjectSafety(obj[key]);
        }
    }
}

/**
 * Safe JSON parsing with validation
 * @param {string} jsonString - JSON string to parse
 * @returns {object} - Parsed object
 */
function safeJsonParse(jsonString) {
    try {
        if (typeof jsonString !== 'string') {
            throw new Error('Input must be a string');
        }

        // Basic validation before parsing
        if (jsonString.length > 1000000) { // 1MB limit
            throw new Error('JSON string too large');
        }

        // Additional security checks before parsing
        if (jsonString.includes('__proto__') || jsonString.includes('constructor') || jsonString.includes('prototype')) {
            throw new Error('Potentially dangerous JSON content detected');
        }

        // Parse JSON with strict reviver function
        const parsed = JSON.parse(jsonString, (key, value) => {
            // Block dangerous keys and functions
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                return undefined;
            }
            // Block function strings that could be executed
            if (typeof value === 'string' && (value.includes('function') || value.includes('=>'))) {
                return undefined;
            }
            return value;
        });

        // Additional validation for nested objects
        if (parsed && typeof parsed === 'object') {
            validateObjectSafety(parsed);
        }

        return parsed;
    } catch (error) {
        throw new Error('Safe JSON parsing failed: ' + error.message);
    }
}

/**
 * Encode (encrypt) a string securely
 * @param {string} text - The text to encode
 * @returns {string} - Base64 encoded encrypted string
 */
function encode(text) {
    try {
        if (typeof text !== 'string') {
            throw new Error('Input must be a string');
        }
        if (text.length > 100000) {
            throw new Error('Input too large');
        }

        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const combined = iv.toString('hex') + ':' + encrypted;

        return Buffer.from(combined).toString('base64');
    } catch (error) {
        throw new Error('Encoding failed: ' + error.message);
    }
}

/**
 * Decode (decrypt) an encoded string
 * @param {string} encodedText - The base64 encoded string to decode
 * @returns {string} - The original decrypted text
 */
function decode(encodedText) {
    try {
        if (typeof encodedText !== 'string') {
            throw new Error('Input must be a string');
        }
        if (encodedText.length > 200000) {
            throw new Error('Input too large');
        }

        const combined = Buffer.from(encodedText, 'base64').toString('utf8');
        const parts = combined.split(':');

        if (parts.length !== 2) {
            throw new Error('Invalid format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];

        const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET_KEY, iv);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;

    } catch (error) {
        throw new Error('Decoding failed: ' + error.message);
    }
}

module.exports = { encode, decode, sanitizeForLog, safeJsonParse, validateObjectSafety };