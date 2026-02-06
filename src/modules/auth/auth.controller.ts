import { Request, Response } from 'express';
import * as authService from './auth.service';

// signup
export const signUp = async (req: Request, res: Response) => {
    const result =  await authService.signUp(req);
    res.json(result);
}


// signin
export const signIn = async (req: Request, res: Response) => {
    const result =  await authService.signIn(req);
    res.json(result);
}