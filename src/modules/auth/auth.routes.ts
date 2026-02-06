import express from "express";
import * as authController from "./auth.controller";


const router = express.Router();

router.post('/auth/signup', authController.signUp);
router.post('/auth/signin', authController.signIn);
    



export default router;