import jwt from "jsonwebtoken";
import { CONFIG } from "../config";



interface JwtPayload {
    id: number;
    email: string;
    role: string;
}

export const generateToken = (payload: JwtPayload) => {
    
    const token = jwt.sign(payload, CONFIG.JWT_SECRET_KEY as string, {
        expiresIn: '7d'
    });

    return token;
}


export const verifyToken = async (token: string) => {
    try {
        const decoded = await  jwt.verify(token, CONFIG.JWT_SECRET_KEY as string) as JwtPayload;
        return decoded;
    } catch (error) {
        throw new Error("Invalid token");
    }
}