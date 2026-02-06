import { Request } from "express";

import { pool } from "../../config/db";

// create vehicle (admin only)
export const createVehicle = async (req: Request) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = req.body;

  try {
    const existingVehicle = await pool.query(
      "SELECT * FROM vehicles WHERE registration_number = $1",
      [registration_number],
    );

    if (existingVehicle.rows.length > 0) {
      return {
        success: false,
        message: "Vehicle with this registration number already exists",
      };
    }

    const newVehicle = await pool.query(
      `
        INSERT INTO vehicles (
            vehicle_name,
            type,
            registration_number,
            daily_rent_price,
            availability_status
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status `,
      [
        vehicle_name,
        type.toLowerCase(),
        registration_number,
        daily_rent_price,
        availability_status,
      ],
    );

    if (newVehicle.rows.length === 0) {
      return {
        success: false,
        message: "Failed to register vehicle",
      };
    }

    return {
      success: true,
      message: "Vehicle created successfully",
      data: newVehicle.rows[0],
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    };
  }
};

// fetch all vehicles
export const fetchVehicles = async (req: Request) => {
  try {
    const vehicles = await pool.query(`SELECT 
            id, 
            vehicle_name, 
            type, 
            registration_number, 
            daily_rent_price, 
            availability_status FROM vehicles`);

    if (vehicles.rows.length === 0) {
      return {
        success: false,
        message: "No vehicles found",
      };
    }
    return {
      success: true,
      message: "Vehicles retrieved successfully",
      data: vehicles.rows,
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    };
  }
};

// fetch vehicle details
export const fetchVehicleDetails = async (req: Request) => {
  try {
    const vehicleId = req.params.vehicleId;

    const vehicle = await pool.query(
      ` SELECT 
            id, 
            vehicle_name, 
            type, 
            registration_number, 
            daily_rent_price, 
            availability_status 
        FROM vehicles WHERE id = $1`,
      [vehicleId],
    );

    if (vehicle.rows.length === 0) {
      return {
        success: false,
        message: "Vehicle not found",
      };
    }
    return {
      success: true,
      message: "Vehicle retrieved successfully",
      data: vehicle.rows[0],
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    };
  }
};

// update vehicle (admin only)
export const updateVehicleInfo = async (req: Request) => {
  const vehicleId = req.params.vehicleId;

  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE vehicles SET 
            vehicle_name = $1,
            type = $2,
            registration_number = $3,
            daily_rent_price = $4,
            availability_status = $5
       WHERE id = $6 RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status`,
      [
        vehicle_name,
        type.toLowerCase(),
        registration_number,
        daily_rent_price,
        availability_status,
        vehicleId,
      ],
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        message: "Vehicle not found",
      };
    }

    return {
      success: true,
      message: "Vehicle updated successfully",
      data: result.rows[0],
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    };
  }
};

// delete vehicle (admin only)
export const deleteVehicle = async (req: Request) => {
  try {
    const vehicleId = req.params.vehicleId;

    const vehicle = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [
      vehicleId,
    ]);

    if (vehicle.rows.length === 0) {
      return {
        success: false,
        message: "Vehicle not found",
      };
    }

    // check have any booking associated with this vehicle
    const bookingCheck = await pool.query(
      ` SELECT id FROM bookings WHERE vehicle_id = $1`,
      [vehicleId],
    );

    if (bookingCheck.rows.length > 0) {
      return {
        success: false,
        message: "Cannot delete vehicle with existing bookings",
      };
    }

    await pool.query(`DELETE FROM vehicles WHERE id = $1`, [vehicleId]);

    return {
      success: true,
      message: "Vehicle deleted successfully",
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    };
  }
};
