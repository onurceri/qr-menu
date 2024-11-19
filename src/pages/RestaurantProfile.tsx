import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { restaurantService } from '../services/restaurantService';
import type { Restaurant } from '../types/restaurant';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Clock, ChevronRight, Trash2, ChevronDown, ChevronUp, Info, MenuIcon } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import { RestaurantReservation } from '../components/RestaurantReservation';
import { parseOpeningHours } from '../utils/dateUtils';

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
    if (address.postalCode || address.city) {
        const cityPart = [address.postalCode, address.city].filter(Boolean).join(' ');
        if (cityPart) parts.push(cityPart);
    }
    if (address.country) parts.push(address.country);

    return parts.join(', ') || t('restaurants.noLocation');
};


export function RestaurantProfile() {
    const { restaurantId } = useParams();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();
    const { user } = useAuth();
    const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    useEffect(() => {
        async function fetchRestaurant() {
            if (!restaurantId) return;

            try {
                const data = await restaurantService.getRestaurant(restaurantId);
                setRestaurant(data);

                // Sadece geçerli konum bilgisi varsa koordinatlar ayarla
                if (data.location?.coordinates &&
                    data.location.coordinates.length === 2 &&
                    data.location.coordinates[0] !== 0 &&
                    data.location.coordinates[1] !== 0) {
                    setCoordinates([data.location.coordinates[1], data.location.coordinates[0]]);
                } else if (data.address?.street && data.address?.city && data.address?.country) {
                    // Sadece tam adres bilgisi varsa geocoding yap
                    const address = formatAddress(data.address, t);
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
                                {/* Adres/Konum ve Harita Kartı */}
                                <div className="bg-white rounded-lg border border-zinc-200 p-4 md:col-span-2">
                                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                                        {/* Sol Kolon: Konum ve Çalışma Saatleri */}
                                        <div className="lg:w-[350px] space-y-6">
                                            {/* Konum Bilgileri */}
                                            <div>
                                                <div className="flex items-start gap-3">
                                                    <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                                                        <MapPin className="w-5 h-5 text-zinc-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-zinc-900 mb-3">
                                                            {t('restaurants.location')}
                                                        </h3>
                                                        {restaurant.address && Object.values(restaurant.address).some(value => value) ? (
                                                            <div className="space-y-2">
                                                                {restaurant.address.street && (
                                                                    <div className="flex items-baseline gap-2">
                                                                        <span className="text-zinc-500 text-sm min-w-[60px]">
                                                                            {t('restaurants.street')}
                                                                        </span>
                                                                        <span className="text-zinc-800 font-medium">
                                                                            {restaurant.address.street}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {(restaurant.address.city || restaurant.address.postalCode) && (
                                                                    <div className="flex items-baseline gap-2">
                                                                        <span className="text-zinc-500 text-sm min-w-[60px]">
                                                                            {t('restaurants.city')}
                                                                        </span>
                                                                        <span className="text-zinc-800 font-medium">
                                                                            {[restaurant.address.postalCode, restaurant.address.city]
                                                                                .filter(Boolean)
                                                                                .join(' ')}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {restaurant.address.country && (
                                                                    <div className="flex items-baseline gap-2">
                                                                        <span className="text-zinc-500 text-sm min-w-[60px]">
                                                                            {t('restaurants.country')}
                                                                        </span>
                                                                        <span className="text-zinc-800 font-medium">
                                                                            {restaurant.address.country}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <p className="text-zinc-400 italic text-sm mt-1">
                                                                {t('restaurants.noLocation')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Çalışma Saatleri */}
                                            <div className="pt-6 border-t border-zinc-100">
                                                <div className="flex items-start gap-3">
                                                    <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                                                        <Clock className="w-5 h-5 text-zinc-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-zinc-900 mb-3">
                                                            {t('restaurants.hours')}
                                                        </h3>
                                                        <div className="space-y-2">
                                                            {parseOpeningHours(restaurant.openingHours) ? (
                                                                Object.entries(parseOpeningHours(restaurant.openingHours)!).map(([day, schedule]) => (
                                                                    <div key={day} className="flex items-center justify-between text-sm">
                                                                        <span className="text-zinc-600 w-[100px] capitalize">
                                                                            {t(`common.days.${day}`)}
                                                                        </span>
                                                                        <span className={`${schedule.isOpen ? 'text-zinc-800' : 'text-zinc-400 italic'}`}>
                                                                            {schedule.isOpen 
                                                                                ? `${schedule.openTime} - ${schedule.closeTime}`
                                                                                : t('restaurants.closed')}
                                                                        </span>
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
                                        </div>

                                        {/* Separator */}
                                        <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-zinc-200 to-transparent self-stretch mx-2" />

                                        {/* Harita */}
                                        {coordinates && coordinates[0] !== 0 && coordinates[1] !== 0 && (
                                            <div className="flex-1">
                                                <div className="w-full h-[250px] md:h-[400px] rounded-lg overflow-hidden border border-zinc-200">
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
                                                                        {formatAddress(restaurant.address, t)}
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Menüler Bölümü */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg border border-zinc-200 p-4">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                        {/* Sol Kolon: Menü Başlığı ve Açıklama */}
                        <div className="lg:w-[350px]">
                            <div className="flex items-start gap-3">
                                <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                                    <MenuIcon className="w-5 h-5 text-zinc-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-zinc-900 mb-3">
                                        {t('restaurants.availableMenus')}
                                    </h3>
                                    <p className="text-sm text-zinc-500">
                                        {t('restaurants.menuDescription')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-zinc-200 to-transparent self-stretch mx-2" />

                        {/* Sağ Kolon: Menü Kartları */}
                        <div className="flex-1">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {restaurant.menus.map((menu) => {
                                    const lang = SUPPORTED_LANGUAGES.find(l => l.code === menu.language);
                                    return (
                                        <div
                                            key={menu.id}
                                            onClick={() => {
                                                window.open(`/menu/${menu.id}`, '_blank', 'noopener,noreferrer');
                                            }}
                                            className="group cursor-pointer bg-zinc-50 rounded-lg p-4 
                                                     transition-all duration-200 hover:bg-zinc-100"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500">
                                                        {lang?.flag} {lang?.name}
                                                    </span>
                                                    <h4 className="text-base font-medium text-zinc-900 mt-1">
                                                        {menu.name}
                                                    </h4>
                                                    {menu.description && (
                                                        <p className="text-sm text-zinc-600 mt-1 line-clamp-2">
                                                            {menu.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center 
                                                  group-hover:bg-zinc-200 transition-colors">
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

            {/* Rezervasyon Bölümü */}
            {restaurant && (
                <div className="pt-0">
                    <RestaurantReservation
                        restaurantId={restaurant.restaurantId}
                        schedule={parseOpeningHours(restaurant.openingHours) || {}}
                    />
                </div>
            )}
        </div>
    );
} 