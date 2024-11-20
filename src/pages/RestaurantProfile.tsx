import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { restaurantService, waitForGoogleMaps } from '../services/restaurantService';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Clock, ChevronRight, Trash2, ChevronDown, ChevronUp, MenuIcon, Navigation } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/Toast';
import { parseOpeningHours } from '../utils/dateUtils';
import { RestaurantReservation } from '../components/RestaurantReservation';

// Özel marker icon oluşturma
const createCustomIcon = (color: string) => `
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="12" fill="${color}"/>
        <circle cx="24" cy="24" r="10" fill="white"/>
        <circle cx="24" cy="24" r="8" fill="${color}"/>
    </svg>
`;

// Özel marker stili için CSS ekle
const markerStyle = `
    .custom-marker-icon {
        background: none;
        border: none;
    }
    .custom-marker-icon svg {
        filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.3));
    }
    .navigation-icon {
        display: inline-block;
        width: 16px;
        height: 16px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 11l19-9-9 19-2-8-8-2z'%3E%3C/path%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: center;
        vertical-align: middle;
    }
`;

// CSS'i head'e ekle
const style = document.createElement('style');
style.textContent = markerStyle;
document.head.appendChild(style);

// Address formatter helper function
const formatAddress = (
    address: {
        street: string;
        city: string;
        country: string;
        postalCode: string;
    },
    t: (key: string) => string
): string => {
    const parts = [];

    if (address.street) parts.push(address.street);
    if (address.city) {
        const cityPart = [address.postalCode, address.city]
            .filter(Boolean)
            .join(' ');
        parts.push(cityPart);
    }
    if (address.country) parts.push(address.country);

    // Tam adresi döndür
    return parts.join(', ') || t('restaurants.noLocation');
};

export function RestaurantProfile() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [restaurant, setRestaurant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAllLanguages, setShowAllLanguages] = useState(false);
    const [showAllOpeningHours, setShowAllOpeningHours] = useState(false);
    const navigate = useNavigate();
    const mapRef = useRef<google.maps.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mobileMapContainerRef = useRef<HTMLDivElement>(null);
    const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    // Google Maps yükleme kontrolü
    const waitForGoogleMaps = (): Promise<void> => {
        return new Promise((resolve) => {
            if (window.google && window.google.maps && window.google.maps.marker) {
                resolve();
                return;
            }

            const checkGoogleMaps = setInterval(() => {
                if (window.google && window.google.maps && window.google.maps.marker) {
                    clearInterval(checkGoogleMaps);
                    resolve();
                }
            }, 100);
        });
    };

    // Haritayı başlat
    const initMap = async () => {
        if (!coordinates) return;

        try {
            const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
            
            // Desktop map
            if (mapContainerRef.current) {
                const desktopMap = new Map(mapContainerRef.current, {
                    center: { lat: coordinates[0], lng: coordinates[1] },
                    zoom: 15,
                    mapId: import.meta.env.VITE_GOOGLE_MAPS_ID,
                    disableDefaultUI: true,
                    zoomControl: false,
                    gestureHandling: "none",
                    draggable: false,
                    scrollwheel: false,
                    clickableIcons: false
                });

                new google.maps.Marker({
                    position: { lat: coordinates[0], lng: coordinates[1] },
                    map: desktopMap,
                    title: restaurant?.name
                });

                // Yol tarifi butonu
                const desktopDirectionsButton = document.createElement('div');
                desktopDirectionsButton.className = 'google-maps-directions-button';
                desktopDirectionsButton.innerHTML = `
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${coordinates[0]},${coordinates[1]}"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg
                              text-sm font-medium text-zinc-700 hover:bg-white transition-colors duration-200
                              border border-zinc-200/50">
                        <span class="navigation-icon"></span>
                        ${t('restaurants.getDirections')}
                    </a>
                `;

                desktopMap.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(desktopDirectionsButton);
            }

            // Mobile map
            if (mobileMapContainerRef.current) {
                const mobileMap = new Map(mobileMapContainerRef.current, {
                    center: { lat: coordinates[0], lng: coordinates[1] },
                    zoom: 15,
                    mapId: import.meta.env.VITE_GOOGLE_MAPS_ID,
                    disableDefaultUI: true,
                    zoomControl: false,
                    gestureHandling: "none",
                    draggable: false,
                    scrollwheel: false,
                    clickableIcons: false
                });

                new google.maps.Marker({
                    position: { lat: coordinates[0], lng: coordinates[1] },
                    map: mobileMap,
                    title: restaurant?.name
                });

                // Yol tarifi butonu - mobil
                const mobileDirectionsButton = document.createElement('div');
                mobileDirectionsButton.className = 'google-maps-directions-button';
                mobileDirectionsButton.innerHTML = `
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${coordinates[0]},${coordinates[1]}"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg
                              text-sm font-medium text-zinc-700 hover:bg-white transition-colors duration-200
                              border border-zinc-200/50">
                        <span class="navigation-icon"></span>
                        ${t('restaurants.getDirections')}
                    </a>
                `;

                mobileMap.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(mobileDirectionsButton);
            }
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    };

    useEffect(() => {
        if (coordinates && mapContainerRef.current) {
            console.log('Initializing map with coordinates:', coordinates);
            initMap();
        }
    }, [coordinates, mapContainerRef.current]);

    useEffect(() => {
        async function fetchRestaurant() {
            if (!restaurantId) return;

            try {
                setLoading(true);
                setError(null);
                const data = await restaurantService.getRestaurant(restaurantId);
                console.log('Restaurant data:', data);
                setRestaurant(data);

                // Konum bilgisini kontrol et ve ayarla
                if (data.location?.coordinates &&
                    data.location.coordinates.length === 2 &&
                    (data.location.coordinates[0] !== 0 || data.location.coordinates[1] !== 0)) {
                    console.log('Setting coordinates from location:', data.location.coordinates);
                    // coordinates artık [lat, lon] formatında
                    setCoordinates(data.location.coordinates);
                } else if (data.address?.street && data.address?.city) {
                    try {
                        // Adres bilgisini kullanarak geocoding yap
                        const address = formatAddress(data.address, t);
                        console.log('Geocoding address:', address);
                        const coords = await restaurantService.geocodeAddress(address);
                        console.log('Geocoded coordinates:', coords);
                        if (coords && coords.length === 2 && (coords[0] !== 0 || coords[1] !== 0)) {
                            // coords zaten [lat, lon] formatında
                            setCoordinates(coords);
                        } else {
                            console.log('Invalid geocoded coordinates');
                            setCoordinates(null);
                        }
                    } catch (error) {
                        console.error('Geocoding error:', error);
                        setCoordinates(null);
                    }
                } else {
                    console.log('No location or address data available');
                    setCoordinates(null);
                }
            } catch (err) {
                setError(t('restaurants.fetchError'));
                console.error('Error fetching restaurant:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchRestaurant();
    }, [restaurantId, t]);

    const handleDeleteImage = async () => {
        if (!restaurant?.imageUrl || !restaurantId) return;

        try {
            // Önce restaurant'ı güncelle
            const updatedData = {
                name: restaurant.name,
                description: restaurant.description || '',
                address: {
                    street: '',
                    city: '',
                    country: '',
                    postalCode: ''
                },
                openingHours: restaurant.openingHours || '',
                imageUrl: '' // Resim URL'ini temizle
            };

            const updatedRestaurant = await restaurantService.updateRestaurant(restaurantId, updatedData);

            // Restaurant güncelleme başarılı olduysa, Cloudinary'den resmi sil
            if (updatedRestaurant) {
                try {
                    await restaurantService.deleteImage(restaurantId);
                } catch (error) {
                    console.error('Failed to delete image from Cloudinary:', error);
                }
                setRestaurant(updatedRestaurant);
            }
        } catch (error) {
            console.error('Failed to update restaurant:', error);
            setError(t('restaurants.imageDeleteError'));
        }
    };

    const handleDeleteRestaurant = async () => {
        if (!restaurant) return;

        try {
            const confirmed = window.confirm(t('confirmDeleteRestaurant'));
            if (!confirmed) return;

            setLoading(true);
            await restaurantService.deleteRestaurant(restaurant.restaurantId);
            navigate('/dashboard');
            toast.success(t('restaurantDeletedSuccess'));
        } catch (error) {
            console.error('Error deleting restaurant:', error);
            toast.error(t('restaurantDeleteError'));
        } finally {
            setLoading(false);
        }
    };

    // Silme butonu sadece restoran sahibine gösterilsin
    const showDeleteButton = user && restaurant && user.uid === restaurant.userId;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 p-4 rounded-md">
                    <p className="text-red-700">{error || t('restaurants.notFound')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
            {/* Hero Section */}
            <div className="bg-white border-b border-zinc-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Restaurant Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-8">
                                {/* Restaurant Photo */}
                                <div className="shrink-0 w-28 h-28 md:w-36 md:h-36">
                                    <div className="w-full h-full rounded-2xl border-4 border-zinc-100 overflow-hidden bg-zinc-100 relative group shadow-lg transition-transform duration-300 hover:scale-105">
                                        {restaurant.imageUrl ? (
                                            <>
                                                <img
                                                    src={restaurant.imageUrl}
                                                    alt={restaurant.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                {showDeleteButton && (
                                                    <button
                                                        onClick={handleDeleteImage}
                                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                                                                 transition-all duration-300 flex items-center justify-center text-white
                                                                 backdrop-blur-sm"
                                                    >
                                                        <Trash2 className="w-6 h-6" />
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
                                                <span className="text-3xl md:text-4xl text-zinc-400 font-bold">
                                                    {restaurant.name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Restaurant Name and Description */}
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 leading-tight">
                                        {restaurant.name}
                                    </h1>
                                    {restaurant.description && (
                                        <div className="relative">
                                            <p className={`text-lg text-zinc-600 leading-relaxed
                                                ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>
                                                {restaurant.description}
                                            </p>
                                            {restaurant.description.length > 120 && (
                                                <button
                                                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                                    className="mt-2 text-sm font-medium text-zinc-500 hover:text-zinc-800 
                                                             transition-colors duration-200 flex items-center gap-1.5
                                                             hover:bg-zinc-100 rounded-full px-3 py-1"
                                                >
                                                    {isDescriptionExpanded ? (
                                                        <>
                                                            <span>{t('common.showLess')}</span>
                                                            <ChevronUp className="w-4 h-4" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>{t('common.showMore')}</span>
                                                            <ChevronDown className="w-4 h-4" />
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info Cards */}
                            <div className="grid grid-cols-1 gap-6 mt-12">
                                {/* Address/Location and Map Card */}
                                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden hover:border-zinc-300 transition-colors duration-300">
                                    <div className="flex flex-col lg:flex-row lg:items-start">
                                        {/* Left Column: Location and Hours */}
                                        <div className="lg:w-[350px] p-6 space-y-8">
                                            {/* Location Info */}
                                            <div>
                                                <div className="flex items-start gap-4">
                                                    <div className="shrink-0 w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                                                        <MapPin className="w-6 h-6 text-zinc-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg text-zinc-900 mb-4">
                                                            {t('restaurants.location')}
                                                        </h3>
                                                        <dl className="mt-2 space-y-2">
                                                            <dt className="sr-only">{t('restaurants.address')}</dt>
                                                            <dd className="mt-1 text-zinc-600 whitespace-pre-line">
                                                                {formatAddress(restaurant.address)}
                                                            </dd>
                                                            
                                                            {/* Map in mobile view */}
                                                            <div className="block lg:hidden mt-4">
                                                                <div className="h-[300px] relative p-0">
                                                                    {coordinates ? (
                                                                        <div 
                                                                            ref={mobileMapContainerRef} 
                                                                            className="h-full w-full rounded-xl overflow-hidden shadow-sm border border-zinc-200/50 bg-white" 
                                                                        />
                                                                    ) : restaurant?.address && Object.values(restaurant.address).some(value => value) ? (
                                                                        <div className="h-full w-full flex items-center justify-center bg-zinc-50 rounded-xl border border-zinc-200/50">
                                                                            <div className="text-center p-4">
                                                                                <MapPin className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                                                                                <p className="text-sm text-zinc-600">{t('restaurants.loadingMap')}</p>
                                                                            </div>
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </dl>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Opening Hours */}
                                            <div>
                                                <div className="flex items-start gap-4">
                                                    <div className="shrink-0 w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                                                        <Clock className="w-6 h-6 text-zinc-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg text-zinc-900 mb-4">
                                                            {t('restaurants.openingHours')}
                                                        </h3>
                                                        <div className="space-y-2">
                                                            {parseOpeningHours(restaurant.openingHours) ? (
                                                                Object.entries(parseOpeningHours(restaurant.openingHours)!).map(([day, schedule]) => (
                                                                    <div 
                                                                        key={day} 
                                                                        className={`flex items-center justify-between p-2 rounded-lg
                                                                            ${schedule.isOpen 
                                                                                ? 'bg-zinc-50' 
                                                                                : 'bg-zinc-50/50'}`}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`w-2 h-2 rounded-full ${
                                                                                schedule.isOpen 
                                                                                    ? 'bg-green-500' 
                                                                                    : 'bg-zinc-300'
                                                                            }`} />
                                                                            <span className="text-sm font-medium text-zinc-700 capitalize">
                                                                                {t(`common.days.${day}`)}
                                                                            </span>
                                                                        </div>
                                                                        <span className={`text-sm ${
                                                                            schedule.isOpen 
                                                                                ? 'text-zinc-900 font-medium' 
                                                                                : 'text-zinc-400'
                                                                        }`}>
                                                                            {schedule.isOpen 
                                                                                ? `${schedule.openTime} - ${schedule.closeTime}`
                                                                                : t('restaurants.closed')}
                                                                        </span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-zinc-400 italic">
                                                                    {t('restaurants.noHours')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Separator */}
                                        <div className="hidden lg:block w-px bg-zinc-200 self-stretch" />

                                        {/* Map */}
                                        <div className="hidden lg:block h-[650px] lg:flex-1 relative mt-6 lg:mt-0 p-6">
                                            {coordinates ? (
                                                <div 
                                                    ref={mapContainerRef} 
                                                    className="h-full w-full rounded-2xl overflow-hidden shadow-lg border border-zinc-200/50 bg-white" 
                                                />
                                            ) : restaurant?.address && Object.values(restaurant.address).some(value => value) ? (
                                                <div className="h-full w-full flex items-center justify-center bg-zinc-50 rounded-2xl border border-zinc-200/50 shadow-lg">
                                                    <div className="text-center p-6">
                                                        <MapPin className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
                                                        <p className="text-zinc-600">{t('restaurants.loadingMap')}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-zinc-50 rounded-2xl border border-zinc-200/50 shadow-lg">
                                                    <div className="text-center p-6">
                                                        <MapPin className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
                                                        <p className="text-zinc-600">{t('restaurants.noLocationSet')}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menus Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden hover:border-zinc-300 transition-colors duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-start">
                        {/* Left Column: Menu Title and Description */}
                        <div className="lg:w-[350px] p-6">
                            <div className="flex items-start gap-4">
                                <div className="shrink-0 w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                                    <MenuIcon className="w-6 h-6 text-zinc-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-zinc-900 mb-4">
                                        {t('restaurants.availableMenus')}
                                    </h3>
                                    <p className="text-zinc-600">
                                        {t('restaurants.menuDescription')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="hidden lg:block w-px bg-zinc-200 self-stretch" />

                        {/* Right Column: Menu Cards */}
                        <div className="flex-1 p-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {restaurant.menus.map((menu) => {
                                    const lang = SUPPORTED_LANGUAGES.find(l => l.code === menu.language);
                                    return (
                                        <div
                                            key={menu.id}
                                            onClick={() => {
                                                window.open(`/menu/${menu.id}`, '_blank', 'noopener,noreferrer');
                                            }}
                                            className="group cursor-pointer bg-zinc-50 rounded-xl p-5
                                                     transition-all duration-300 hover:bg-zinc-100
                                                     hover:shadow-md hover:-translate-y-0.5"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                                                                   bg-white text-sm font-medium text-zinc-600 shadow-sm">
                                                        {lang?.flag} {lang?.name}
                                                    </span>
                                                    <h4 className="text-lg font-medium text-zinc-900 mt-3">
                                                        {menu.name}
                                                    </h4>
                                                    {menu.description && (
                                                        <p className="text-sm text-zinc-600 mt-2 line-clamp-2">
                                                            {menu.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center 
                                                            shadow-sm group-hover:bg-zinc-200 group-hover:shadow-md transition-all duration-300">
                                                    <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reservation Section */}
            {restaurant && (
                <div className="pb-12">
                    <RestaurantReservation
                        restaurantId={restaurant.restaurantId}
                        schedule={parseOpeningHours(restaurant.openingHours) || {}}
                    />
                </div>
            )}
        </div>
    );
}