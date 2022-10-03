import { Request, Response } from "express";
import { omit } from "lodash";
import privateFileds from "../config/privateFileds";
import { LoginInput } from "../schema/auth.schema";
import { findUser } from "../service/user.service";
import asyncHandler from 'async-handler'
export async function loginHandler (req: Request<{}, {}, LoginInput>, res: Response) {
    try {
        const { email, password } = req.body;
        const user = await findUser({ email });
        if(!user) throw new Error('User not found')

        const match = await user.comparePassword(password);
        if(!match) throw new Error('Invalid credentials')

        res.json({ user: omit(user.toJSON(), privateFileds)})
    } catch(err: any) {
        res.status(400).json({ message: err.message })
    }
}


export function logoutHandler(req: Request, res: Response) {
    res.json({ message: 'Logged out'})
}