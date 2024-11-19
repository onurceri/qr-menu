import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
    status?: number;
}

export const errorHandler = (
    err: ErrorWithStatus,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        status: err.status
    });

    // Varsayılan hata mesajı ve durumu
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    // Hata yanıtını gönder
    res.status(status).json({
        error: message,
        status
    });
}; 