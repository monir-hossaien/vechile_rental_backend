import { Request, Response } from "express";
import * as userService from "./user.service";

// fetch all users (admin only)

export const fetchUsers = async (req: Request, res: Response) => {
  const result = await userService.fetchUsers(req);
  res.json(result);
};


// update user (own profile for customer and any user for admin)
export const updateUser = async (req: Request, res: Response) => {
  const result = await userService.updateUser(req);
  res.json(result);
};


// delete user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  const result = await userService.deleteUser(req);
  res.json(result);
};