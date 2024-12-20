import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// Configure Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Missing Cloudinary configuration');
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadImage(file: Express.Multer.File, restaurantId: string): Promise<string> {
    try {
        const uploadOptions = {
            folder: 'restaurants',
            public_id: `${restaurantId}`,
            resource_type: 'image' as const
        };

        const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                uploadOptions,
                (error, uploadResult) => {
                    if (error) {
                        console.error('Cloudinary Upload Error Details:', {
                            error: error.message,
                            httpCode: error.http_code,
                            timestamp: new Date().toISOString()
                        });
                        return reject(error);
                    }
                    if (!uploadResult) return reject(new Error('Upload failed'));
                    return resolve(uploadResult);
                }
            ).end(file.buffer);
        });

        return uploadResult.secure_url;
    } catch (error) {
        console.error('Upload function error:', error);
        throw error;
    }
}

export async function deleteImage(restaurantId: string): Promise<void> {
    try {
        const publicId = `restaurants/${restaurantId}`;
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Failed to delete image:', error);
        throw new Error('Failed to delete image');
    }
}

export async function getRestaurantImages(restaurantId: string): Promise<string[]> {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: `restaurants/${restaurantId}`,
            resource_type: 'image'
        });

        return result.resources.map((resource: any) => resource.secure_url);
    } catch (error) {
        console.error('Failed to get restaurant images:', error);
        throw new Error('Failed to get restaurant images');
    }
}

export default {
    uploadImage,
    deleteImage,
    getRestaurantImages
}; 