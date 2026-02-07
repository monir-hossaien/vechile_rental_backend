import { Pool, types } from "pg";
import { CONFIG } from "./index";

types.setTypeParser(1082, (val) => val);

export const pool = new Pool({
  connectionString: CONFIG.CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const connectDB = async () => {

    try {
        // user table
    await pool.query(`

        DO $$ 
            BEGIN
                CREATE TYPE role_type AS ENUM ('admin', 'customer');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;

        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(15) NOT NULL,
            role role_type DEFAULT 'customer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            CONSTRAINT email_lowercase CHECK (email = LOWER(email)),
            CONSTRAINT password_min_length CHECK (LENGTH(password) >= 6)
        );
    `);

    // vehicle
    await pool.query(`
        
        DO $$ BEGIN
            CREATE TYPE vehicle_category AS ENUM ('car', 'bike', 'van');
            CREATE TYPE status_type AS ENUM ('available', 'booked');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;

        CREATE TABLE IF NOT EXISTS vehicles (
            id SERIAL PRIMARY KEY,
            vehicle_name VARCHAR(255) NOT NULL,
            type vehicle_category NOT NULL,
            registration_number VARCHAR(50) UNIQUE NOT NULL,
            daily_rent_price DECIMAL(10, 2) NOT NULL CHECK (daily_rent_price > 0),
            availability_status status_type DEFAULT 'available',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // booking table

    await pool.query(`

        DO $$ BEGIN
            CREATE TYPE booking_status AS ENUM ('active', 'cancelled', 'returned');
        EXCEPTION   
            WHEN duplicate_object THEN null;
        END $$;

        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            customer_id INT REFERENCES users(id),
            vehicle_id INT REFERENCES vehicles(id),
            rent_start_date DATE NOT NULL,
            rent_end_date   DATE NOT NULL,
            total_price DECIMAL(10, 2) NOT NULL CHECK (total_price > 0),
            status booking_status DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `)

    console.log("Database connected successfully.");
    }   catch (error: any) {
        console.error("Error creating tables:", error);
    }
};
