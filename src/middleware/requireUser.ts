import { NextFunction, Request, Response } from "express";

export function requireUser(req: Request, res: Response, next: NextFunction) {
    const user = res.locals.user;
    if(!user) return res.status(400).json({ message: 'No user'});
    return next()
}