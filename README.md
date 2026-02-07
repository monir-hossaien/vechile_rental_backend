# Car Rental Reservation System

A professional, secure, and automated car rental platform built with Node.js, TypeScript, and PostgreSQL.

## Key Features
* **Role-Based Access:** Separate actions for Admin and Customers.
* **Transaction Safety:** Atomic booking process using PostgreSQL transactions to prevent race conditions.
* **Auto-Return Logic:** Integrated `node-cron` job to automatically mark expired bookings as returned.
* **Dynamic Pricing:** Real-time total price calculation with date validation.

## Technology Stack
* **Backend:** Node.js, Express.js, TypeScript
* **Database:** PostgreSQL (with `pg` pool)
* **Scheduling:** Node-cron
* **Authentication:** JWT (JSON Web Tokens)

## Setup Instructions
1. Clone the repo: `git clone https://github.com/monir-hossaien/vechile_rental_backend.git`

2. Install dependencies: `npm install`
3. Set up `.env` (include DB credentials, PORT, and JWT_SECRET)
4. Start the server: `npm run dev`

