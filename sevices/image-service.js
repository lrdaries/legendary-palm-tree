// services/image-service.js
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const Database = require('../database');

class ImageService {
    constructor() {
        this.uploadDir = path.join(__dirname, '../public/uploads');
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
    }

    async uploadImage(file) {
        // Validate file
        if (!this.allowedTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
        }

        if (file.size > this.maxFileSize) {
            throw new Error('File size exceeds the 5MB limit');
        }

        // Create uploads directory if it doesn't exist
        await fs.mkdir(this.uploadDir, { recursive: true });

        // Generate unique filename
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        const filepath = path.join(this.uploadDir, filename);

        // Save file
        await fs.writeFile(filepath, file.buffer);

        // Return relative path
        return `/uploads/${filename}`;
    }

    async deleteImage(imageUrl) {
        try {
            const filename = path.basename(imageUrl);
            const filepath = path.join(this.uploadDir, filename);
            await fs.unlink(filepath);
            return true;
        } catch (error) {
            console.error('Error deleting image:', error);
            return false;
        }
    }

    async cleanupOrphanedImages() {
        try {
            const [rows] = await Database.query(`
                SELECT image_url FROM products 
                WHERE image_url IS NOT NULL
                UNION
                SELECT url as image_url FROM product_images
            `);

            const usedImages = new Set(rows.map(row => row.image_url));
            const files = await fs.readdir(this.uploadDir);

            for (const file of files) {
                const filepath = path.join(this.uploadDir, file);
                const relativePath = `/uploads/${file}`;
                
                if (!usedImages.has(relativePath)) {
                    await fs.unlink(filepath).catch(console.error);
                }
            }
        } catch (error) {
            console.error('Error cleaning up images:', error);
        }
    }
}

module.exports = new ImageService();