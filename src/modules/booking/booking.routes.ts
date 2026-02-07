
import express from "express";
import * as bookingController from "./booking.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";


const router = express.Router();

router.post("/bookings", authenticateUser(), bookingController.createBooking);
router.get("/bookings", authenticateUser(), bookingController.fetchBookings);
router.put("/bookings/:bookingId", authenticateUser(), bookingController.updateBooking);




export default router;