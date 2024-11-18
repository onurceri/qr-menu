import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { restaurantService } from '../services/restaurantService';
import type { Restaurant } from '../types/restaurant';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Image, Clock, Trash2, ArrowLeft } from 'lucide-react';
import { SearchableDropdown } from '../components/SearchableDropdown';
import { locationService } from '../services/locationService';
import { useFormValidation } from '../hooks/useFormValidation';
import { validateSchedule } from '../utils/scheduleValidation';

// Dosya tipi ve boyut kontrolleri için yardımcı fonksiyonlar
const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

function validateImageFile(file: File): string | null {
    // Dosya tipi kontrolü
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return 'Invalid file type. Only JPG, JPEG and PNG files are allowed.';
    }

    // Dosya boyutu kontrolü
    if (file.size > IMAGE_SIZE_LIMIT) {
        return 'File size too large. Maximum size is 5MB.';
    }

    return null;
}

// Yeni tip tanımlamaları
interface DaySchedule {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

interface WeekSchedule {
    [key: string]: DaySchedule;
}

// Varsayılan saat formatı için yardımcı fonksiyon
const formatTimeForInput = (time: string): string => {
    return time.length === 5 ? time : '09:00';
};

// String'den objeye çevirme
const parseOpeningHours = (hoursString: string): WeekSchedule => {
    const defaultSchedule: DaySchedule = { isOpen: true, openTime: '09:00', closeTime: '22:00' };
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    try {
        return JSON.parse(hoursString);
    } catch {
        // Eğer parse edilemezse varsayılan schedule'ı döndür
        return days.reduce((acc, day) => ({ ...acc, [day]: defaultSchedule }), {});
    }
};

// Objeden string'e çevirme
const stringifyOpeningHours = (schedule: WeekSchedule): string => {
    return JSON.stringify(schedule);
};

// Sabit değişken tanımı
const MAX_DESCRIPTION_LENGTH = 500;

export function RestaurantEdit() {
    const { restaurantId } = useParams();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: {
            street: '',
            city: '',
            country: '',
            postalCode: ''
        },
        openingHours: '',
        imageUrl: ''
    });

    const [schedule, setSchedule] = useState<WeekSchedule>(() => {
        const defaultSchedule: DaySchedule = { isOpen: true, openTime: '09:00', closeTime: '22:00' };
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        return days.reduce((acc, day) => ({ ...acc, [day]: defaultSchedule }), {});
    });

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { validateForm } = useFormValidation(formData);

    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // formData değiştiğinde schedule'ı güncelle
    useEffect(() => {
        if (formData.openingHours) {
            try {
                const parsedSchedule = parseOpeningHours(formData.openingHours);
                setSchedule(parsedSchedule);
            } catch (error) {
                console.error('Failed to parse opening hours:', error);
                // Hata durumunda varsayılan schedule'ı kullan
                const defaultSchedule: DaySchedule = { isOpen: true, openTime: '09:00', closeTime: '22:00' };
                const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                setSchedule(days.reduce((acc, day) => ({ ...acc, [day]: defaultSchedule }), {}));
            }
        }
    }, [formData.openingHours]);

    // schedule değiştiğinde formData'yı güncelle
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            openingHours: stringifyOpeningHours(schedule)
        }));
    }, [schedule]);

    const handleScheduleChange = (day: string, field: keyof DaySchedule, value: string | boolean) => {
        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }));
    };

    useEffect(() => {
        async function fetchRestaurant() {
            if (!restaurantId) return;

            try {
                const data = await restaurantService.getRestaurant(restaurantId);
                setRestaurant(data);
                setFormData({
                    name: data.name,
                    description: data.description || '',
                    address: data.address || {
                        street: '',
                        city: '',
                        country: '',
                        postalCode: ''
                    },
                    openingHours: data.openingHours || '',
                    imageUrl: data.imageUrl || ''
                });
            } catch (err) {
                setError(t('restaurants.loadError'));
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchRestaurant();
    }, [restaurantId, t]);

    // Sayfa değişikliğinde uyarı göster
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted');

        if (!restaurant || saving) {
            console.log('Submit blocked: ', { restaurant: !!restaurant, saving });
            return;
        }

        // Form validasyonu
        const formErrors = validateForm();
        const scheduleErrors = validateSchedule(schedule);
        
        // Posta kodu validasyonunu kaldır veya opsiyonel yap
        if (Object.keys(formErrors).length > 0 && formErrors.postalCode) {
            delete formErrors.postalCode; // Posta kodu hatasını yoksay
        }
        
        if (Object.keys(formErrors).length > 0 || Object.keys(scheduleErrors).length > 0) {
            console.log('Validation errors:', { formErrors, scheduleErrors });
            setErrors({ ...formErrors, ...scheduleErrors });
            return;
        }

        const previousData = { ...restaurant };
        
        try {
            setSaving(true);
            setError(null);

            // schedule'ı string'e çevir
            const openingHoursString = stringifyOpeningHours(schedule);
            
            // Güncellenecek veriyi hazırla
            const updatedData = {
                name: formData.name,
                description: formData.description,
                address: formData.address,
                openingHours: openingHoursString,
                imageUrl: formData.imageUrl
            };

            console.log('Sending update request with data:', updatedData);

            // Restoranı güncelle
            const updatedRestaurant = await restaurantService.updateRestaurant(restaurantId!, updatedData);
            
            if (updatedRestaurant) {
                console.log('Restaurant updated successfully:', updatedRestaurant);
                setHasUnsavedChanges(false);
                navigate(`/restaurant/${restaurantId}`);
            } else {
                throw new Error('Failed to update restaurant');
            }
        } catch (err) {
            console.error('Update error:', err);
            setRestaurant(previousData);
            setError(t('restaurants.updateError'));
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !restaurantId) return;

        // Dosya validasyonu
        const validationError = validateImageFile(file);
        if (validationError) {
            setError(t('restaurants.imageValidationError', { error: validationError }));
            // Input'u temizle
            e.target.value = '';
            return;
        }

        try {
            setIsUploadingImage(true);
            setError(null);

            const imageUrl = await restaurantService.uploadImage(file, restaurantId);
            setFormData(prev => ({ ...prev, imageUrl }));
        } catch (err) {
            setError(t('restaurants.imageUploadError'));
            console.error(err);
        } finally {
            setIsUploadingImage(false);
            // Input'u temizle
            e.target.value = '';
        }
    };

    // Form değişikliklerini takip et
    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(`/restaurant/${restaurantId}`)}
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                        aria-label={t('common.back')}
                    >
                        <ArrowLeft className="w-5 h-5 text-zinc-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-zinc-900">
                        {t('restaurants.profile')}
                    </h1>
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6 border border-zinc-200">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Temel Bilgiler */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700">
                            {t('restaurants.name')}
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700">
                            {t('restaurants.description')}
                        </label>
                        <div className="relative">
                            <textarea
                                value={formData.description}
                                onChange={e => {
                                    const value = e.target.value;
                                    if (value.length <= MAX_DESCRIPTION_LENGTH) {
                                        setFormData(prev => ({ ...prev, description: value }));
                                    }
                                }}
                                maxLength={MAX_DESCRIPTION_LENGTH}
                                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 resize-none"
                                rows={3}
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-zinc-500">
                                {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
                            </div>
                        </div>
                        {/* Karakter sayısı uyarısı */}
                        <div className="mt-1 text-xs text-zinc-500 flex justify-between items-center">
                            <span>{t('restaurants.descriptionHint')}</span>
                            <span className={formData.description.length > MAX_DESCRIPTION_LENGTH * 0.9 ? 'text-amber-600' : ''}>
                                {t('common.charactersRemaining', { 
                                    count: MAX_DESCRIPTION_LENGTH - formData.description.length 
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Adres Bilgileri */}
                    <div className="border-t border-zinc-200 pt-6">
                        <h2 className="text-lg font-medium text-zinc-900 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
                            {t('restaurants.address')}
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700">
                                    {t('restaurants.country')}
                                </label>
                                <SearchableDropdown
                                    value={formData.address.country}
                                    onChange={(value) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            address: { 
                                                ...prev.address, 
                                                country: value,
                                                city: '' // Ülke değiştiğinde şehri sıfırla
                                            }
                                        }));
                                    }}
                                    onSearch={locationService.searchCountries}
                                    placeholder={t('restaurants.selectCountry')}
                                    label={t('restaurants.country')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700">
                                    {t('restaurants.city')}
                                </label>
                                <SearchableDropdown
                                    value={formData.address.city}
                                    onChange={(value) => setFormData(prev => ({
                                        ...prev,
                                        address: { ...prev.address, city: value }
                                    }))}
                                    onSearch={(query) => locationService.getCities(formData.address.country, query)}
                                    placeholder={t('restaurants.selectCity')}
                                    label={t('restaurants.city')}
                                    minSearchLength={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700">
                                    {t('restaurants.street')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.address.street}
                                    onChange={e => setFormData(prev => ({
                                        ...prev,
                                        address: { ...prev.address, street: e.target.value }
                                    }))}
                                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700">
                                    {t('restaurants.postalCode')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.address.postalCode}
                                    onChange={e => setFormData(prev => ({
                                        ...prev,
                                        address: { ...prev.address, postalCode: e.target.value }
                                    }))}
                                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Çalışma Saatleri */}
                    <div className="border-t border-zinc-200 pt-6">
                        <h2 className="text-lg font-medium text-zinc-900 mb-4 flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            {t('restaurants.hours')}
                        </h2>
                        <div className="space-y-4">
                            {Object.entries(schedule).map(([day, daySchedule]) => (
                                <div key={day} className="flex flex-col space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                        <div className="flex items-center justify-between sm:w-auto">
                                            <div className="w-28">
                                                <span className="text-sm font-medium text-zinc-700 capitalize">
                                                    {t(`days.${day}`)}
                                                </span>
                                            </div>
                                            <label className="flex items-center sm:ml-4">
                                                <input
                                                    type="checkbox"
                                                    checked={daySchedule.isOpen}
                                                    onChange={(e) => handleScheduleChange(day, 'isOpen', e.target.checked)}
                                                    className="rounded border-zinc-300 text-zinc-600 focus:ring-zinc-500"
                                                />
                                                <span className="ml-2 text-sm text-zinc-600">
                                                    {t('restaurants.isOpen')}
                                                </span>
                                            </label>
                                        </div>
                                        {daySchedule.isOpen && (
                                            <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
                                                <input
                                                    type="time"
                                                    value={formatTimeForInput(daySchedule.openTime)}
                                                    onChange={(e) => handleScheduleChange(day, 'openTime', e.target.value)}
                                                    className={`block w-[120px] rounded-md shadow-sm focus:border-zinc-500 
                                                            focus:ring-zinc-500 sm:text-sm
                                                            ${errors[day] ? 'border-red-300 bg-red-50' : 'border-zinc-300'}`}
                                                />
                                                <span className="text-zinc-500">-</span>
                                                <input
                                                    type="time"
                                                    value={formatTimeForInput(daySchedule.closeTime)}
                                                    onChange={(e) => handleScheduleChange(day, 'closeTime', e.target.value)}
                                                    className={`block w-[120px] rounded-md shadow-sm focus:border-zinc-500 
                                                            focus:ring-zinc-500 sm:text-sm
                                                            ${errors[day] ? 'border-red-300 bg-red-50' : 'border-zinc-300'}`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {/* Hata mesajı */}
                                    {errors[day] && (
                                        <div className="text-sm text-red-600 ml-0 sm:ml-32 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {t(errors[day])}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resim Yükleme */}
                    <div className="border-t border-zinc-200 pt-6">
                        <h2 className="text-lg font-medium text-zinc-900 mb-4 flex items-center">
                            <Image className="w-5 h-5 mr-2" />
                            {t('restaurants.uploadImage')}
                        </h2>
                        <div className="mt-1 flex flex-col space-y-4">
                            {/* Mevcut resmi göster */}
                            {formData.imageUrl && (
                                <div className="relative w-full sm:w-48 h-48 group">
                                    <img 
                                        src={formData.imageUrl} 
                                        alt="Restaurant" 
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                        disabled={isUploadingImage}
                                        className={`absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full 
                                                 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity
                                                 ${isUploadingImage ? 'cursor-not-allowed opacity-50' : ''}`}
                                        title={t('common.delete')}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            
                            {/* Dosya yükleme input'u */}
                            <div className="flex flex-col space-y-2">
                                <div className="relative">
                                    <input
                                        type="file"
                                        onChange={handleImageUpload}
                                        accept={ALLOWED_FILE_TYPES.join(',')}
                                        disabled={isUploadingImage}
                                        className={`block w-full text-sm text-zinc-500
                                                 file:mr-4 file:py-2 file:px-4
                                                 file:rounded-md file:border-0
                                                 file:text-sm file:font-medium
                                                 file:bg-zinc-50 file:text-zinc-700
                                                 hover:file:bg-zinc-100
                                                 ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                    {isUploadingImage && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-sm text-zinc-600">{t('restaurants.uploadingImage')}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm text-zinc-500 space-y-1">
                                    <p>{t('restaurants.imageRequirements')}</p>
                                    <p>{t('restaurants.allowedFileTypes', { types: 'JPG, JPEG, PNG' })}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button - Mobil için daha iyi görünüm */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 sm:relative sm:bg-transparent sm:border-t-0 sm:p-0 sm:mt-6">
                        <button
                            type="submit"
                            disabled={saving || isUploadingImage}
                            className={`w-full btn flex items-center justify-center space-x-2
                                ${(saving || isUploadingImage) ? 'opacity-50 cursor-not-allowed' : ''}
                                shadow-lg sm:shadow-none`}
                        >
                            {saving ? (
                                <span className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>{t('common.saving')}</span>
                                </span>
                            ) : isUploadingImage ? (
                                <span className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>{t('restaurants.uploadingImage')}</span>
                                </span>
                            ) : (
                                <span>{t('common.save')}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 