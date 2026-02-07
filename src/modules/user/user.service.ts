import { pool } from "../../config/db";
import { Request} from "express";
import { User, UserRole } from "./user.interface";

export interface AuthRequest extends Request {
    user?: User;
}


// fetch all users (admin only)
export const fetchUsers = async (req: Request) => {

    try{

        const users = await pool.query(`SELECT id, name, email, phone, role FROM users ORDER BY CREATED_AT DESC`);

        if(users.rowCount === 0){
            return {
                status: false,
                message: "No users found"
            }
        }

        return {
            status: true,
            message: "Users retrieved successfully",
            data: users.rows
        }

    }catch(error: any){
        return {
            status: false,
            message: "Internal server error",
            error: error.message
        }
    }

}

// update user 
export const updateUser = async (req: AuthRequest) => {

    const {userId} = req.params;
    const {name, email, phone, role} = req.body;

    try{


        if(!Object.values(UserRole).includes(role as UserRole)){
            return {
                status: false,
                message: "Invalid role"
            }
        }

        const isAdmin = req?.user?.role === UserRole.ADMIN ;
        const isOwnProfile = req?.user?.id === Number(userId);
    

        if(!isAdmin && !isOwnProfile){
            return {
                status: false,
                message: "You are not authorized to update this user"
            }
        }

        const currentUser = await pool.query(` SELECT role FROM users where id = $1`, [userId]);
        if(currentUser.rowCount === 0){
            return {
                status: false,
                message: "User not found"
            }
        }

        const final_role = isAdmin ? role : currentUser.rows[0].role;

        const result = await pool.query(`UPDATE users SET name= $1, email= $2, phone= $3, role= $4, updated_at= NOW() WHERE id = $5 
            RETURNING id, name, email, phone, role`, [name, email, phone, final_role, userId]);

        if(result.rowCount === 0){
            return {
                status: false,
                message: "User not found"
            }
        }
        return {
            status: true,
            message: "User updated successfully",
            data: result.rows[0]
        }
    }
    catch(error: any){
        return {
            status: false,
            message: "Internal server error",
            error: error.message
        }
    }   
}



// delete user (admin only)
export const deleteUser = async (req: Request) => {
    const {userId} = req.params;

    try{
        const result = await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);

        if(result.rowCount === 0){
            return {
                status: false,
                message: "User not found"
            }
        }   

        return {
            status: true,
            message: "User deleted successfully",
        }
    }catch(error: any){
        return {
            status: false,
            message: "Internal server error",
            error: error.message
        }
    }
 }