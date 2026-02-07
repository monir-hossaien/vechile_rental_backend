import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../helpers/jwt";
import { JwtPayload } from "jsonwebtoken";
import { User} from "../modules/user/user.interface";

export interface AuthRequest extends Request {
    user?: User
}

export const authenticateUser = (...roles: string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

            if (!token) {
                return res.status(401).json({ 
                    success: false, 
                    message: "You must be logged in to access this resource" 
                });
            }

            // token decode
            const tokenDecode = await verifyToken(token) as JwtPayload;
        

            if (!tokenDecode) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Invalid token. Please log in again." 
                });
            }

            req.user = {
                id: tokenDecode.id,
                role: tokenDecode.role,
                email: tokenDecode.email,
            };

    
            if (roles.length > 0 && !roles.includes(tokenDecode.role)) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Access denied. Requires one of the following roles: ${roles.join(", ")}` 
                });
            }

            next();
        } catch (error: any) {
            return res.status(500).json({ 
                success: false, 
                message: "Internal Server Error", 
                error: error.message 
            });
        }
    };
};