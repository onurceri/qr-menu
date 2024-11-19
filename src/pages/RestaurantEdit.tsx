import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { restaurantService } from '../services/restaurantService';
import type { Restaurant } from '../types/restaurant';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { useFormValidation } from '../hooks/useFormValidation';
import { validateSchedule } from '../utils/scheduleValidation';
import { RestaurantBasicInfo } from '../components/RestaurantBasicInfo';
import { RestaurantAddress } from '../components/RestaurantAddress';
import { RestaurantHours } from '../components/RestaurantHours';
import { RestaurantImage } from '../components/RestaurantImage';

// Types
interface DaySchedule {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

interface WeekSchedule {
    [key: string]: DaySchedule;
}

// Helper functions
const parseOpeningHours = (hoursString: string): WeekSchedule => {
    const defaultSchedule: DaySchedule = { isOpen: true, openTime: '09:00', closeTime: '22:00' };
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    try {
        return JSON.parse(hoursString);
    } catch {
        return days.reduce((acc, day) => ({ ...acc, [day]: defaultSchedule }), {});
    }
};

const stringifyOpeningHours = (schedule: WeekSchedule): string => {
    return JSON.stringify(schedule);
};

export function RestaurantEdit() {
    const { restaurantId } = useParams();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();
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

    useEffect(() => {
        if (formData.openingHours) {
            try {
                const parsedSchedule = parseOpeningHours(formData.openingHours);
                setSchedule(parsedSchedule);
            } catch (error) {
                console.error('Failed to parse opening hours:', error);
                const defaultSchedule: DaySchedule = { isOpen: true, openTime: '09:00', closeTime: '22:00' };
                const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                setSchedule(days.reduce((acc, day) => ({ ...acc, [day]: defaultSchedule }), {}));
            }
        }
    }, [formData.openingHours]);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            openingHours: stringifyOpeningHours(schedule)
        }));
    }, [schedule]);

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
        if (!restaurant || saving) return;

        const formErrors = validateForm();
        const scheduleErrors = validateSchedule(schedule);
        
        if (Object.keys(formErrors).length > 0 && formErrors.postalCode) {
            delete formErrors.postalCode;
        }
        
        if (Object.keys(formErrors).length > 0 || Object.keys(scheduleErrors).length > 0) {
            setErrors({ ...formErrors, ...scheduleErrors });
            return;
        }

        const previousData = { ...restaurant };
        
        try {
            setSaving(true);
            setError(null);

            const openingHoursString = stringifyOpeningHours(schedule);
            
            const updatedData = {
                name: formData.name,
                description: formData.description,
                address: formData.address,
                openingHours: openingHoursString,
                imageUrl: formData.imageUrl
            };

            const updatedRestaurant = await restaurantService.updateRestaurant(restaurantId!, updatedData);
            
            if (updatedRestaurant) {
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

    const handleImageUpload = async (file: File) => {
        if (!restaurantId) return;

        try {
            setIsUploadingImage(true);
            setError(null);

            const imageUrl = await restaurantService.uploadImage(file, restaurantId);
            setFormData(prev => ({ ...prev, imageUrl }));
            setHasUnsavedChanges(true);
        } catch (err) {
            setError(t('restaurants.imageUploadError'));
            console.error(err);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleScheduleChange = (day: string, field: keyof DaySchedule, value: string | boolean) => {
        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }));
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
                    <RestaurantBasicInfo
                        name={formData.name}
                        description={formData.description}
                        onNameChange={(name) => {
                            setFormData(prev => ({ ...prev, name }));
                            setHasUnsavedChanges(true);
                        }}
                        onDescriptionChange={(description) => {
                            setFormData(prev => ({ ...prev, description }));
                            setHasUnsavedChanges(true);
                        }}
                    />

                    <RestaurantAddress
                        address={formData.address}
                        onAddressChange={(address) => {
                            setFormData(prev => ({ ...prev, address }));
                            setHasUnsavedChanges(true);
                        }}
                    />

                    <RestaurantHours
                        schedule={schedule}
                        onScheduleChange={handleScheduleChange}
                        errors={errors}
                    />

                    <RestaurantImage
                        imageUrl={formData.imageUrl}
                        onImageChange={(imageUrl) => {
                            setFormData(prev => ({ ...prev, imageUrl }));
                            setHasUnsavedChanges(true);
                        }}
                        onImageUpload={handleImageUpload}
                        isUploading={isUploadingImage}
                    />

                    <div className="flex justify-end space-x-4 border-t border-zinc-200 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate(`/restaurant/${restaurantId}`)}
                            className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 rounded-md border border-zinc-300"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-md
                                    ${saving ? 'bg-zinc-400 cursor-not-allowed' : 'bg-zinc-900 hover:bg-zinc-800'}`}
                        >
                            {saving ? t('common.saving') : t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}