import express from "express";
import * as vehicleController from "./vehicle.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";

const router = express.Router();

router.post("/vehicles", authenticateUser("admin"), vehicleController.createVehicle);
router.get("/vehicles", vehicleController.fetchVehicles);
router.get("/vehicles/:vehicleId", vehicleController.fetchVehicleDetails);
router.put("/vehicles/:vehicleId", authenticateUser("admin"), vehicleController.updateVehicleInfo);
router.delete("/vehicles/:vehicleId", authenticateUser("admin"), vehicleController.deleteVehicle);


export default router;