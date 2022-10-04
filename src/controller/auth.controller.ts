import { Request, Response } from "express";
import { omit } from "lodash";
import privateFileds from "../config/privateFileds";
import { LoginInput } from "../schema/auth.schema";
import { findUser } from "../service/user.service";
import asyncHandler from 'express-async-handler'
//@ts-ignore
export const loginHandler = asyncHandler(async (req: Request<{}, {}, LoginInput>, res: Response) => {
    const { email, password } = req.body
    const user = await findUser({ email });
    if(!user) return res.status(404).json({message: 'User not found'})
    const match = await user.comparePassword(password);
    if(!match) return res.status(400).json({ message: 'Password incorrect.'})
    res.json(omit(user.toJSON(), privateFileds))
})


export function logoutHandler(req: Request, res: Response) {
    res.json({ message: 'Logged out'})
}