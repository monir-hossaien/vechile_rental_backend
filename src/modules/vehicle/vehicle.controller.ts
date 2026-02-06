import { Request, Response } from "express";
import * as vehicleService from "./vehicle.service";


// create vehicle (admin only)
export const createVehicle = async (req: Request, res: Response) => {
    const result = await vehicleService.createVehicle(req);
    res.json(result);
}

// fetch all vehicles
export const fetchVehicles = async (req: Request, res: Response) => {
    const result = await vehicleService.fetchVehicles(req);
    res.json(result);
}

// fetch vehicle details
export const fetchVehicleDetails = async (req: Request, res: Response) => {
    const result = await vehicleService.fetchVehicleDetails(req);
    res.json(result);
}

// update vehicle (admin only)
export const updateVehicleInfo = async (req: Request, res: Response) => {
    const result = await vehicleService.updateVehicleInfo(req);
    res.json(result);
}


// delete vehicle (admin only)
export const deleteVehicle = async (req: Request, res: Response) => {
    const result = await vehicleService.deleteVehicle(req);
    res.json(result);
}