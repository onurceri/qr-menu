import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { restaurantService, waitForGoogleMaps } from '../services/restaurantService';
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
import { Search } from 'lucide-react';

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

const createCustomIcon = (color: string = '#4F46E5') => {
  const svgMarker = {
    path: 'M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z',
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: '#fff',
    rotation: 0,
    scale: 2,
  };
  return svgMarker;
};

// LocationPicker bileşeni
function LocationPicker({ 
    initialLocation,
    onLocationSelect 
}: { 
    initialLocation?: { lat: number; lng: number };
    onLocationSelect: (location: { lat: number; lng: number }) => void;
}) {
    const mapRef = useRef<HTMLDivElement>(null);
    const searchBoxRef = useRef<HTMLInputElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
    const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);

    const defaultLocation = initialLocation || { lat: 41.0082, lng: 28.9784 }; // Default to Istanbul coordinates

    const handleLocationChange = (latLng: google.maps.LatLng) => {
        const newLocation = {
            lat: latLng.lat(),
            lng: latLng.lng()
        };
        
        if (marker) {
            marker.position = latLng;
        }
        
        if (map) {
            map.panTo(latLng);
        }
        
        onLocationSelect(newLocation);
    };

    const initMap = async () => {
        try {
            await waitForGoogleMaps();

            if (!mapRef.current || !searchBoxRef.current) return;

            const mapOptions: google.maps.MapOptions = {
                center: defaultLocation,
                zoom: 15,
                mapId: import.meta.env.VITE_GOOGLE_MAPS_ID,
                disableDefaultUI: false,
                clickableIcons: false,
            };

            const newMap = new google.maps.Map(mapRef.current, mapOptions);
            setMap(newMap);

            // Initialize SearchBox
            const newSearchBox = new google.maps.places.SearchBox(searchBoxRef.current);
            setSearchBox(newSearchBox);

            // Bias SearchBox results towards current map's viewport
            newMap.addListener('bounds_changed', () => {
                newSearchBox.setBounds(newMap.getBounds() as google.maps.LatLngBounds);
            });

            // Özel marker oluştur
            const newMarker = new google.maps.marker.AdvancedMarkerElement({
                map: newMap,
                position: defaultLocation,
                title: 'Restaurant Location',
            });
            setMarker(newMarker);

            // Listen for search box changes
            newSearchBox.addListener('places_changed', () => {
                const places = newSearchBox.getPlaces();
                if (!places || places.length === 0) return;

                const place = places[0];
                if (!place.geometry || !place.geometry.location) return;

                // Update map and marker
                handleLocationChange(place.geometry.location);
            });

            // Harita tıklama olayını dinle
            newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
                if (e.latLng) {
                    handleLocationChange(e.latLng);
                }
            });

            // Marker sürükleme olayını dinle
            if (newMarker) {
                newMarker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
                    if (e.latLng) {
                        handleLocationChange(e.latLng);
                    }
                });
            }

        } catch (error) {
            console.error('Google Maps initialization error:', error);
        }
    };

    useEffect(() => {
        initMap();
    }, []);

    return (
        <div className="space-y-4">
            <input
                ref={searchBoxRef}
                type="text"
                placeholder="Adres veya konum ara..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div ref={mapRef} style={{ width: '100%', height: '400px' }} />
        </div>
    );
}

export function RestaurantEdit() {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Restaurant>({
        id: '',
        name: '',
        description: '',
        location: {
            type: 'Point',
            coordinates: [0, 0],
            address: {
                street: '',
                city: '',
                country: '',
                postalCode: ''
            },
            isManuallySet: false
        },
        openingHours: '{}',
        imageUrl: '',
        ownerId: user?.uid || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    useEffect(() => {
        async function fetchRestaurant() {
            if (!restaurantId) return;

            try {
                const data = await restaurantService.getRestaurant(restaurantId);
                setFormData(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchRestaurant();
    }, [restaurantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!restaurantId || isSaving) return;

        try {
            setIsSaving(true);

            const updatedData = { ...formData };

            if (restaurantId) {
                updatedData.id = restaurantId;
            }

            const updatedRestaurant = await restaurantService.updateRestaurant(restaurantId!, updatedData);
            
            if (updatedRestaurant) {
                setHasUnsavedChanges(false);
                navigate(`/restaurant/${restaurantId}`);
            } else {
                throw new Error('Failed to update restaurant');
            }
        } catch (err) {
            console.error('Update error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 sm:px-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 flex items-center text-zinc-600 hover:text-zinc-900"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        {t('common.back')}
                    </button>
                    
                    <h1 className="text-2xl font-semibold text-zinc-900">
                        {restaurantId ? t('restaurants.edit') : t('restaurants.addRestaurant')}
                    </h1>
                </div>

                {isLoading ? (
                    <div className="mt-6">
                        <div className="animate-pulse">
                            <div className="h-8 bg-zinc-200 rounded w-1/4 mb-4"></div>
                            <div className="h-32 bg-zinc-200 rounded mb-4"></div>
                            <div className="h-8 bg-zinc-200 rounded w-1/3 mb-4"></div>
                            <div className="h-32 bg-zinc-200 rounded"></div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-6">
                        <div className="bg-white shadow rounded-lg">
                            <div className="p-6">
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

                                <div className="mt-8">
                                    <div className="border-t border-zinc-200 pt-6">
                                        <label className="block text-sm font-medium text-zinc-700 mb-4">
                                            {t('restaurants.selectLocation')}
                                        </label>
                                        <LocationPicker
                                            initialLocation={formData.location.coordinates[1] && formData.location.coordinates[0] ? {
                                                lat: formData.location.coordinates[1],
                                                lng: formData.location.coordinates[0]
                                            } : undefined}
                                            onLocationSelect={(location) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    location: {
                                                        ...prev.location,
                                                        coordinates: [location.lng, location.lat],
                                                        isManuallySet: true
                                                    }
                                                }));
                                                setHasUnsavedChanges(true);
                                            }}
                                        />
                                    </div>
                                </div>

                                <RestaurantHours
                                    schedule={parseOpeningHours(formData.openingHours)}
                                    onScheduleChange={(schedule) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            openingHours: stringifyOpeningHours(schedule)
                                        }));
                                        setHasUnsavedChanges(true);
                                    }}
                                />

                                <RestaurantImage
                                    imageUrl={formData.imageUrl}
                                    onImageChange={(imageUrl) => {
                                        setFormData(prev => ({ ...prev, imageUrl }));
                                        setHasUnsavedChanges(true);
                                    }}
                                />
                            </div>

                            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 rounded-b-lg">
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving || !hasUnsavedChanges}
                                        className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-md
                                                 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2
                                                 focus:ring-zinc-500 disabled:bg-zinc-400 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                {t('common.saving')}
                                            </div>
                                        ) : (
                                            t('common.save')
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}