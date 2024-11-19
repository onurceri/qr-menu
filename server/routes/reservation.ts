import express, { Response, Router } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Reservation } from '../models/Reservation.js';
import { Restaurant } from '../models/Restaurant.js';
import { parseOpeningHours } from '../utils/dateUtils.js';
import { format } from 'date-fns';
import * as dateFnsLocales from 'date-fns/locale';
import { SUPPORTED_LANGUAGES } from '../../shared/constants/languages.js';

const router: Router = express.Router();


// Saat formatı için locale ayarları
const getTimeFormatLocale = (language: string): string => {
    // Her dil için özel saat formatı ayarları
    const timeFormatMap: { [key: string]: string } = {
        tr: 'tr-TR',
        en: 'en-US',
        fr: 'fr-FR',
        nl: 'nl-NL',
        ar: 'ar-SA',
        // Diğer diller için formatlar buraya eklenebilir
    };

    return timeFormatMap[language] || 'en-US';
};

// Müsait saatleri getir
router.get('/:restaurantId/availability', 
    async (req: AuthRequest<{ restaurantId: string }>, res: Response) => {
        try {
            const { restaurantId } = req.params;
            const { date, language } = req.query;

            if (!date || typeof date !== 'string') {
                res.status(400).json({ error: 'Date parameter is required' });
                return;
            }

            // Dil kontrolü ve varsayılan dil belirleme
            const userLanguage = typeof language === 'string' ? language : '';
            const defaultLanguage = SUPPORTED_LANGUAGES[0]?.code || 'en';
            const selectedLanguage = SUPPORTED_LANGUAGES.some(lang => lang.code === userLanguage)
                ? userLanguage
                : defaultLanguage;

            // Restoranı bul ve çalışma saatlerini kontrol et
            const restaurant = await Restaurant.findOne({ restaurantId });
            if (!restaurant) {
                res.status(404).json({ error: 'Restaurant not found' });
                return;
            }

            const schedule = parseOpeningHours(restaurant.openingHours);
            if (!schedule) {
                res.status(400).json({ error: 'Invalid opening hours' });
                return;
            }

            // Gün için çalışma saatlerini al - her zaman İngilizce gün adını kullan
            const dateObj = new Date(date);
            const dayName = format(dateObj, 'EEEE', { locale: dateFnsLocales.enUS }).toLowerCase();
            const daySchedule = schedule[dayName];

            if (!daySchedule?.isOpen) {
                res.json({ timeSlots: [] });
                return;
            }

            // Müsait saatleri oluştur
            const timeSlots = await generateTimeSlots(
                dateObj,
                daySchedule,
                restaurantId,
                date,
                selectedLanguage
            );

            res.json({ timeSlots });
        } catch (error) {
            console.error('Error getting availability:', error);
            res.status(500).json({ error: 'Failed to get availability' });
        }
    }
);

// Yardımcı fonksiyon - zaman dilimlerini oluştur
async function generateTimeSlots(
    dateObj: Date,
    daySchedule: { openTime: string; closeTime: string },
    restaurantId: string,
    date: string,
    language: string
) {
    const [startHour, startMinute] = daySchedule.openTime.split(':');
    const [endHour, endMinute] = daySchedule.closeTime.split(':');
    
    const startTime = new Date(dateObj);
    startTime.setHours(parseInt(startHour), parseInt(startMinute));
    
    const endTime = new Date(dateObj);
    endTime.setHours(parseInt(endHour), parseInt(endMinute));

    const timeSlots = [];
    const currentTime = new Date(startTime);

    // Dile göre saat formatı ayarlarını al
    const locale = getTimeFormatLocale(language);
    const timeFormatOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // 24 saat formatı
    };

    while (currentTime < endTime) {
        const timeString = currentTime.toLocaleTimeString(locale, timeFormatOptions);

        const existingReservation = await Reservation.findOne({
            restaurantId,
            date,
            time: timeString,
            status: { $ne: 'cancelled' }
        });

        timeSlots.push({
            time: timeString,
            available: !existingReservation
        });

        currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return timeSlots;
}

// Yeni rezervasyon oluştur
router.post('/', 
    async (req: AuthRequest, res: Response) => {
        try {
            const {
                restaurantId,
                date,
                time,
                numberOfGuests,
                customerName,
                customerEmail,
                customerPhone,
                specialRequests
            } = req.body;

            // Temel validasyonlar
            if (!restaurantId || !date || !time || !numberOfGuests || !customerName || !customerEmail || !customerPhone) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }

            // Restoranı kontrol et
            const restaurant = await Restaurant.findOne({ restaurantId });
            if (!restaurant) {
                res.status(404).json({ error: 'Restaurant not found' });
                return;
            }

            // Müsaitlik kontrolü
            const existingReservation = await Reservation.findOne({
                restaurantId,
                date,
                time,
                status: { $ne: 'cancelled' }
            });

            if (existingReservation) {
                res.status(400).json({ error: 'Time slot is not available' });
                return;
            }

            // Yeni rezervasyon oluştur
            const reservation = new Reservation({
                restaurantId,
                userId: req.user?.uid || null,
                date,
                time,
                numberOfGuests,
                customerName,
                customerEmail,
                customerPhone,
                specialRequests,
                status: 'pending'
            });

            await reservation.save();
            res.status(201).json(reservation);
        } catch (error) {
            console.error('Error creating reservation:', error);
            res.status(500).json({ error: 'Failed to create reservation' });
        }
    }
);

export default router; 