import cron from 'node-cron';
import { pool } from "../config/db";

// প্রতিদিন রাত ১২:০১ মিনিটে এই টাস্কটি রান হবে
export const initAutoReturnJob = () => {
    cron.schedule('1 0 * * *', async () => {
        console.log("Checking for expired bookings...");
        
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const expiredBookings = await client.query(
                `UPDATE bookings 
                 SET status = 'returned', updated_at = NOW()
                 WHERE rent_end_date < CURRENT_DATE 
                 AND status = 'active'
                 RETURNING vehicle_id`
            );

            if (expiredBookings.rowCount && expiredBookings.rowCount > 0) {
                const vehicleIds = expiredBookings.rows.map(row => row.vehicle_id);

                await client.query(
                    `UPDATE vehicles 
                     SET availability_status = 'available', updated_at = NOW()
                     WHERE id = ANY($1)`,
                    [vehicleIds]
                );

                console.log(`Auto-returned ${expiredBookings.rowCount} bookings.`);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Auto-return cron job error:", error);
        } finally {
            client.release();
        }
    });
};