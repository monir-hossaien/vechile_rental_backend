import { pool } from "../../config/db";
import { Request} from 'express';
import { UserRole } from "../user/user.interface";
import { log } from "node:console";


interface AuthRequest extends Request {
    user?: { id: number; role: UserRole };
}

// create booking
export const createBooking = async (req: AuthRequest) => {
    const { vehicle_id, rent_start_date, rent_end_date } = req.body;

    
    const customer_id = req.user?.id; 

    if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date) {
        return { success: false, message: "All fields are required" };
    }

    const rentStart = new Date(rent_start_date);
    const rentEnd = new Date(rent_end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison

    // Validations
    if (rentStart >= rentEnd) return { success: false, message: "End date must be after start date" };
    if (rentStart < today) return { success: false, message: "Start date cannot be in the past" };

    const client = await pool.connect(); // Get a client from the pool for the transaction

    try {
        await client.query('BEGIN');

        // 1. Lock the vehicle row for update to prevent race conditions
        const vehicleResult = await client.query(
            "SELECT * FROM vehicles WHERE id = $1 AND availability_status = 'available' FOR UPDATE",
            [vehicle_id]
        );

        if (vehicleResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return { success: false, message: "Vehicle is no longer available" };
        }

        const vehicle = vehicleResult.rows[0];
    

        // 2. Calculate price
        const number_of_days  = Math.ceil((rentEnd.getTime() - rentStart.getTime()) / (1000 * 3600 * 24));
        const total_price = number_of_days * parseFloat(vehicle.daily_rent_price);


        // 3. Create Booking
        const bookingResult = await client.query(
            `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status`,
            [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
        );

        // 4. Update Vehicle Status
        await client.query(
            "UPDATE vehicles SET availability_status = 'booked' WHERE id = $1",
            [vehicle_id]
        );

        await client.query('COMMIT');

        return {
            success: true,
            message: "Booking created successfully",
            data: {
                ...bookingResult.rows[0],
                vehicle: {
                    vehicle_name: vehicle.vehicle_name,
                    daily_rent_price: vehicle.daily_rent_price,
                }
            },
        };

    } catch (error: any) {
        await client.query('ROLLBACK');
        return {
            success: false,
            message: "Internal Server Error",
            error: error.message,
        };
    } finally {
        client.release();
    }
};


// fetch bookings (admin can see all, customer can see their own)
export const fetchBookings = async (req: AuthRequest) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    try {
        let result;
        if (userRole === UserRole.ADMIN) {
            result = await pool.query(
                `SELECT b.*, v.vehicle_name, v.registration_number, u.name as customer_name, u.email as customer_email
                 FROM bookings b 
                 JOIN vehicles v ON b.vehicle_id = v.id
                 JOIN users u ON b.customer_id = u.id
                 ORDER BY b.created_at DESC
                `
            );
        } else {
            result = await pool.query(
                `SELECT b.*, v.vehicle_name, v.registration_number, v.type 
                 FROM bookings b 
                 JOIN vehicles v ON b.vehicle_id = v.id 
                 WHERE b.customer_id = $1
                 ORDER BY b.created_at DESC
                `,
                [userId]
            );
        }

        if(result.rowCount === 0){
            return { 
                success: true,
                message: "No bookings found",
                data: []
            };
        }
        
        const formateData = result.rows.map((row)=>{
            const commonData = {
                id: row.id,
                vehicle_id: row.vehicle_id,
                rent_start_date: row.rent_start_date,
                rent_end_date: row.rent_end_date,
                total_price: row.total_price,
                status: row.status
            }

            if(userRole === UserRole.ADMIN){
                return {
                    ...commonData,
                    customer_id: row.customer_id,
                    customer: {
                        name: row.customer_name,
                        email: row.customer_email
                    },
                    vehicle: {
                        vehicle_name: row.vehicle_name,
                        registration_number: row.registration_number
                    }
                    
                }
            }else{
                return {
                    ...commonData,
                    vehicle: {
                        vehicle_name: row.vehicle_name,
                        registration_number: row.registration_number,
                        type: row.type
                    }
                }
            }
        })


        return { 
            success: true,
            message: userRole === UserRole.ADMIN ? "Bookings retrieved successfully" : "Your bookings retrieved successfully", 
            data: formateData
        };
    } catch (error: any) {
        return { success: false, message: "Internal Server Error", error: error.message };
    }
}


// update bookings
export const updateBooking = async (req: AuthRequest) => {
    const { bookingId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { status } = req.body;

    if(!status || !["cancelled", "returned"].includes(status)){
        return { success: false, message: "Status field is required and must be either 'cancelled' or 'returned'" };
    }

    const client = await pool.connect();

    try{
        await client.query('BEGIN');

        // 1. Fetch the booking with lock
        const bookingCheck = await client.query(
            `SELECT * FROM bookings WHERE id = $1 FOR UPDATE`,
            [bookingId]
        );

        if(bookingCheck.rowCount === 0){
            await client.query('ROLLBACK');
            return { success: false, message: "Booking not found" };
        }

        const booking = bookingCheck.rows[0];

        // 2. Authorization check
        if(userRole === UserRole.CUSTOMER){

            if(booking.customer_id !== userId){
                 await client.query('ROLLBACK');
                 return { success: false, message: "You are not authorized to update this booking" };
            }

            if( status !== "cancelled"){
                await client.query('ROLLBACK');
                return { success: false, message: "Customers can only cancel their bookings" };
            }     
        }

        // 3. Update the booking status
        const updatedBooking = await client.query(
            `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status`,
            [status, bookingId]
        );

        if(updatedBooking.rowCount !== 0){
            if(status === "cancelled" || status === "returned"){
                await client.query(
                    `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
                    [booking.vehicle_id]
                );
            }
        }

        await client.query('COMMIT');
        let message = status === 'cancelled' 
            ? "Booking cancelled successfully" 
            : "Booking marked as returned. Vehicle is now available";

        const responseData = {
            ...updatedBooking.rows[0],
            ...(status === 'returned' && { vehicle: { availability_status: 'available' } })
        };
        return { success: true, message, data: responseData };
    } catch (error: any) {
        await client.query('ROLLBACK');
        return { success: false, message: "Internal Server Error", error: error.message };
    } finally {
        client.release();
    }
}