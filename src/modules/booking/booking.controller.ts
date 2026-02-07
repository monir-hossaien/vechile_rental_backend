
import { Request, Response } from 'express';
import * as bookingService from './booking.service';

// create booking 
export const createBooking = async (req: Request, res: Response) => {
    const result = await bookingService.createBooking(req);
    res.json(result);
}

// fetch bookings (admin can see all, customer can see their own)
export const fetchBookings = async (req: Request, res: Response) => {
    const result = await bookingService.fetchBookings(req);
    res.json(result);
}


// update bookings
export const updateBooking = async (req: Request, res: Response) => {
    const result = await bookingService.updateBooking(req);
    res.json(result);
}