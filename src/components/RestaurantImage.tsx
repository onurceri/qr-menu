import { useTranslation } from 'react-i18next';
import { Image, Trash2 } from 'lucide-react';

// Constants for image validation
const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

interface RestaurantImageProps {
    imageUrl: string;
    onImageChange: (imageUrl: string) => void;
    onImageUpload: (file: File) => Promise<void>;
    isUploading: boolean;
}

function validateImageFile(file: File): string | null {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return 'Invalid file type. Only JPG, JPEG and PNG files are allowed.';
    }

    if (file.size > IMAGE_SIZE_LIMIT) {
        return 'File size too large. Maximum size is 5MB.';
    }

    return null;
}

export function RestaurantImage({ 
    imageUrl, 
    onImageChange, 
    onImageUpload,
    isUploading 
}: RestaurantImageProps) {
    const { t } = useTranslation();

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validationError = validateImageFile(file);
        if (validationError) {
            alert(t('restaurants.imageValidationError', { error: validationError }));
            e.target.value = '';
            return;
        }

        try {
            await onImageUpload(file);
            e.target.value = '';
        } catch (error) {
            console.error('Upload error:', error);
            alert(t('restaurants.uploadError', { error: error instanceof Error ? error.message : 'Unknown error' }));
            e.target.value = '';
        }
    };

    return (
        <div className="border-t border-zinc-200 pt-6">
            <h2 className="text-lg font-medium text-zinc-900 mb-4 flex items-center">
                <Image className="w-5 h-5 mr-2" />
                {t('restaurants.uploadImage')}
            </h2>
            <div className="mt-1 flex flex-col space-y-4">
                {imageUrl && (
                    <div className="relative w-full sm:w-48 h-48 group">
                        <img 
                            src={imageUrl} 
                            alt="Restaurant" 
                            className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                            onClick={() => onImageChange('')}
                            disabled={isUploading}
                            className={`absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full 
                                     opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity
                                     ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
                            title={t('common.delete')}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
                
                <div className="flex flex-col space-y-2">
                    <div className="relative">
                        <input
                            type="file"
                            onChange={handleImageUpload}
                            accept={ALLOWED_FILE_TYPES.join(',')}
                            disabled={isUploading}
                            className={`block w-full text-sm text-zinc-500
                                     file:mr-4 file:py-2 file:px-4
                                     file:rounded-md file:border-0
                                     file:text-sm file:font-medium
                                     file:bg-zinc-50 file:text-zinc-700
                                     hover:file:bg-zinc-100
                                     ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm text-zinc-600">{t('restaurants.uploadingImage')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-zinc-500">
                        {t('restaurants.imageRequirements')}
                    </p>
                </div>
            </div>
        </div>
    );
}
