import express from "express";
import * as userController from "./user.controller";
import { authenticateUser } from "../../middlewares/auth.middleware";


const router = express.Router();

router.get("/users", authenticateUser("admin"), userController.fetchUsers);
router.put("/users/:userId", authenticateUser("admin", "customer"), userController.updateUser);
router.delete("/users/:userId", authenticateUser("admin"), userController.deleteUser);

export default router;