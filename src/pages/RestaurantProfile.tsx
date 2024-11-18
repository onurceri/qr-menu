import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { restaurantService } from '../services/restaurantService';
import type { Restaurant } from '../types/restaurant';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Clock, Globe, ChevronRight, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';

// Özel marker icon oluşturma
const createCustomIcon = (color: string = '#18181B') => {
    const mapPin = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

    return divIcon({
        html: mapPin,
        className: 'custom-marker-icon',
        iconSize: [24, 36],
        iconAnchor: [12, 36],
        popupAnchor: [0, -36]
    });
};

// Özel marker stili için CSS ekle
const markerStyle = `
    .custom-marker-icon {
        background: none;
        border: none;
    }
    .custom-marker-icon svg {
        filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.3));
    }
`;

// Style tag'ini head'e ekle
if (!document.getElementById('marker-style')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'marker-style';
    styleSheet.innerText = markerStyle;
    document.head.appendChild(styleSheet);
}

// Address formatter helper function'ı güncelleyelim
function formatAddress(address: { 
    street: string; 
    city: string; 
    country: string; 
    postalCode: string; 
}): string {
    const parts = [];
    
    if (address.street) parts.push(address.street);
    if (address.postalCode || address.city) {
        const cityPart = [address.postalCode, address.city].filter(Boolean).join(' ');
        if (cityPart) parts.push(cityPart);
    }
    if (address.country) parts.push(address.country);

    return parts.join(', ') || t('restaurants.noLocation');
}

// Schedule tiplerini ekleyelim
interface DaySchedule {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

interface WeekSchedule {
    [key: string]: DaySchedule;
}

// Schedule parse fonksiyonu
const parseOpeningHours = (hoursString?: string): WeekSchedule | null => {
    if (!hoursString) return null;
    try {
        return JSON.parse(hoursString);
    } catch {
        return null;
    }
};

// Konum URL'i oluşturan helper fonksiyon
const createLocationUrl = (coordinates: [number, number]) => {
    return `https://www.openstreetmap.org/?mlat=${coordinates[0]}&mlon=${coordinates[1]}#map=16/${coordinates[0]}/${coordinates[1]}`;
};

export function RestaurantProfile() {
    const { restaurantId } = useParams();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    useEffect(() => {
        async function fetchRestaurant() {
            if (!restaurantId) return;

            try {
                const data = await restaurantService.getRestaurant(restaurantId);
                setRestaurant(data);
                
                // Sadece geçerli konum bilgisi varsa koordinatları ayarla
                if (data.location?.coordinates && 
                    data.location.coordinates.length === 2 && 
                    data.location.coordinates[0] !== 0 && 
                    data.location.coordinates[1] !== 0) {
                    setCoordinates([data.location.coordinates[1], data.location.coordinates[0]]);
                } else if (data.address?.street && data.address?.city && data.address?.country) {
                    // Sadece tam adres bilgisi varsa geocoding yap
                    const address = formatAddress(data.address);
                    const coords = await restaurantService.geocodeAddress(address);
                    if (coords) {
                        setCoordinates([coords[1], coords[0]]);
                    }
                }
            } catch (err) {
                setError(t('restaurants.fetchError'));
                console.error(err);
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
                address: restaurant.address || {
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
        <div className="min-h-screen bg-zinc-50">
            {/* Hero Section */}
            <div className="bg-white border-b border-zinc-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sol Kolon: Restoran Bilgileri */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-6">
                                {/* Restoran Fotoğrafı */}
                                <div className="shrink-0 w-24 h-24 md:w-32 md:h-32">
                                    <div className="w-full h-full rounded-full border-4 border-zinc-100 overflow-hidden bg-zinc-100 relative group shadow-sm">
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
                                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                                                                 transition-opacity flex items-center justify-center text-white"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-2xl md:text-3xl text-zinc-400 font-semibold">
                                                    {restaurant.name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Restoran Adı ve Açıklaması */}
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-2">
                                        {restaurant.name}
                                    </h1>
                                    {restaurant.description && (
                                        <div className="relative">
                                            <p className={`text-base text-zinc-600 
                                                ${!isDescriptionExpanded && 'line-clamp-2'}`}>
                                                {restaurant.description}
                                            </p>
                                            {restaurant.description.length > 120 && (
                                                <button
                                                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                                    className="mt-1 text-sm text-zinc-500 hover:text-zinc-800 
                                                             transition-colors duration-200 flex items-center gap-1"
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

                            {/* Bilgi Kartları */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                {/* Adres/Konum Kartı */}
                                <div className="bg-white rounded-lg border border-zinc-200 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-zinc-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-zinc-900">
                                                {t('restaurants.location')}
                                            </h3>
                                            {restaurant.address && Object.values(restaurant.address).some(value => value) ? (
                                                coordinates ? (
                                                    <a
                                                        href={createLocationUrl(coordinates)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-zinc-600 hover:text-zinc-900 transition-colors duration-200 
                                                                 flex items-center gap-1 group mt-1"
                                                    >
                                                        <span>{formatAddress(restaurant.address)}</span>
                                                        <svg 
                                                            className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                                                            fill="none" 
                                                            stroke="currentColor" 
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path 
                                                                strokeLinecap="round" 
                                                                strokeLinejoin="round" 
                                                                strokeWidth={2} 
                                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                                                            />
                                                        </svg>
                                                    </a>
                                                ) : (
                                                    <p className="text-zinc-600 mt-1">{formatAddress(restaurant.address)}</p>
                                                )
                                            ) : (
                                                <p className="text-zinc-400 italic text-sm mt-1">{t('restaurants.noLocation')}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Çalışma Saatleri Kartı */}
                                <div className="bg-white rounded-lg border border-zinc-200 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-zinc-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-zinc-900">
                                                {t('restaurants.hours')}
                                            </h3>
                                            <div className="mt-1 space-y-1">
                                                {parseOpeningHours(restaurant.openingHours) ? (
                                                    Object.entries(parseOpeningHours(restaurant.openingHours)!).map(([day, schedule]) => (
                                                        <div key={day} className="text-sm">
                                                            <span className="inline-block w-24 text-zinc-700 capitalize">
                                                                {t(`days.${day}`)}:
                                                            </span>
                                                            {schedule.isOpen ? (
                                                                <span className="text-zinc-600">
                                                                    {schedule.openTime} - {schedule.closeTime}
                                                                </span>
                                                            ) : (
                                                                <span className="text-zinc-400 italic">
                                                                    {t('restaurants.closed')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-zinc-400 italic text-sm">
                                                        {t('restaurants.noHours')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Diller Kartı */}
                                <div className="bg-white rounded-lg border border-zinc-200 p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                                            <Globe className="w-5 h-5 text-zinc-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-zinc-900">
                                                {t('restaurants.languages')}
                                            </h3>
                                            <p className="text-zinc-600 mt-1">
                                                {restaurant.menus.map(menu => {
                                                    const lang = SUPPORTED_LANGUAGES.find(l => l.code === menu.language);
                                                    return lang?.name;
                                                }).filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sağ Kolon: Harita */}
                        {coordinates && coordinates[0] !== 0 && coordinates[1] !== 0 && (
                            <div className="lg:w-[400px] h-[300px] lg:h-[500px] sticky top-8">
                                <div className="w-full h-full rounded-lg overflow-hidden border border-zinc-200">
                                    <MapContainer
                                        center={coordinates}
                                        zoom={15}
                                        className="w-full h-full"
                                        zoomControl={false}
                                        dragging={true}
                                        scrollWheelZoom={false}
                                        doubleClickZoom={true}
                                        style={{ width: '100%', height: '100%', zIndex: 1 }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <Marker 
                                            position={coordinates} 
                                            icon={createCustomIcon('#18181B')}
                                        >
                                            <Popup>
                                                <div className="text-zinc-900 font-medium">
                                                    {restaurant?.name}
                                                </div>
                                                {restaurant?.address && (
                                                    <div className="text-zinc-600 text-sm mt-1">
                                                        {formatAddress(restaurant.address)}
                                                    </div>
                                                )}
                                            </Popup>
                                        </Marker>
                                        <ZoomControl position="topright" />
                                    </MapContainer>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Menüler Bölümü */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-xl font-semibold text-zinc-900 mb-6">
                    {t('restaurants.availableMenus')}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {restaurant.menus.map((menu) => {
                        const lang = SUPPORTED_LANGUAGES.find(l => l.code === menu.language);
                        return (
                            <div 
                                key={menu.id}
                                onClick={() => {
                                    window.open(`/menu/${menu.id}`, '_blank', 'noopener,noreferrer');
                                }}
                                className="group cursor-pointer bg-white rounded-lg border border-zinc-200 p-4 
                                         transition-all duration-200 hover:shadow-md hover:border-zinc-300"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <span className="text-sm font-medium text-zinc-500">
                                            {lang?.flag} {lang?.name}
                                        </span>
                                        <h3 className="text-lg font-medium text-zinc-900 mt-1">
                                            {menu.name}
                                        </h3>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 
                                                          transition-colors duration-200" />
                                </div>
                                {menu.description && (
                                    <p className="text-zinc-600 text-sm line-clamp-2">{menu.description}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
} 