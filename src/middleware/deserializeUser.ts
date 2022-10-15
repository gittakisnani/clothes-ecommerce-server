import { NextFunction, Request, Response } from "express";
import { get } from "lodash";
import { cookiesOptions } from "../controller/session.controller";
import { reIssueAccessToken } from "../service/session.service";
import { verifyJWT } from "../utils/jwt.utils";

export async function deserializeUser(req: Request, res: Response, next: NextFunction) {
    const accessToken = get(req, 'cookies.accessToken', '')
    const refreshToken = get(req, 'cookies.refreshToken')
    if(!accessToken) return next();
    
    const { decoded, expired } = verifyJWT(accessToken);
    if(decoded) {
        res.locals.user = decoded;
        return next()
    }

    if(expired && refreshToken) {
        const newAccessToken = await reIssueAccessToken({ refreshToken });
        if(!newAccessToken) return next();
        //@ts-ignore
        const { decoded } = verifyJWT(newAccessToken);


        res.clearCookie('accessToken', cookiesOptions);
        res.cookie('accessToken', newAccessToken, cookiesOptions)
        res.locals.user = decoded

        return next()
    }

    return next()
}