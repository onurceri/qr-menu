import express, { Response, Router } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Reservation } from '../models/Reservation.js';
import { Restaurant } from '../models/Restaurant.js';
import { parseOpeningHours } from '../utils/dateUtils.js';
import { format } from 'date-fns';
import * as dateFnsLocales from 'date-fns/locale';

const router: Router = express.Router();

// Müsait saatleri getir - Public route olmalı
router.get('/:restaurantId/availability', 
    async (req, res: Response) => {
        try {
            const { restaurantId } = req.params;
            const { date, language = 'tr' } = req.query;

            if (!date || typeof date !== 'string') {
                res.status(400).json({ error: 'Date parameter is required' });
                return;
            }

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

            // Gün için çalışma saatlerini al
            const dateObj = new Date(date);
            const dayName = format(dateObj, 'EEEE', { locale: dateFnsLocales.enUS }).toLowerCase();
            const daySchedule = schedule[dayName];

            if (!daySchedule?.isOpen) {
                res.json({ timeSlots: [] });
                return;
            }

            // Sadece dolu olan saatleri getir
            const bookedSlots = await Reservation.find({
                restaurantId,
                date,
                status: { $ne: 'cancelled' }
            }).select('time').lean();

            // Dolu saatleri Set'e dönüştür
            const bookedTimes = new Set(bookedSlots.map(slot => slot.time));

            // Tüm zaman dilimlerini oluştur
            const timeSlots = generateTimeSlots(
                dateObj,
                daySchedule,
                bookedTimes,
                typeof language === 'string' ? language : 'tr'
            );

            res.json({ timeSlots });
        } catch (error) {
            console.error('Error getting availability:', error);
            res.status(500).json({ error: 'Failed to get availability' });
        }
    }
);

// Yardımcı fonksiyon - zaman dilimlerini oluştur
function generateTimeSlots(
    dateObj: Date,
    daySchedule: { openTime: string; closeTime: string },
    bookedTimes: Set<string>,
    language: string
): { time: string; available: boolean }[] {
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
        hour12: false
    };

    // Şimdiki zamanı al
    const now = new Date();
    const isToday = dateObj.toDateString() === now.toDateString();

    while (currentTime < endTime) {
        const timeString = currentTime.toLocaleTimeString(locale, timeFormatOptions);

        // Eğer bugünse ve saat geçmişse, slot'u unavailable yap
        const isAvailable = isToday 
            ? (currentTime > now && !bookedTimes.has(timeString))
            : !bookedTimes.has(timeString);

        timeSlots.push({
            time: timeString,
            available: isAvailable
        });

        currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return timeSlots;
}

// Saat formatı için locale ayarları
function getTimeFormatLocale(language: string): string {
    const timeFormatMap: { [key: string]: string } = {
        tr: 'tr-TR',
        en: 'en-US',
        fr: 'fr-FR',
        nl: 'nl-NL',
        ar: 'ar-SA',
    };

    return timeFormatMap[language] || 'en-US';
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