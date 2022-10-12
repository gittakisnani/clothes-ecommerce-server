import { CookieOptions, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { CreateSessionInput } from "../schema/session.schema"
import { createSession, findSessions, updateSession } from "../service/session.service"
import { validatePassword } from "../service/user.service"
import { signJWT } from "../utils/jwt.utils"
import config from 'config'
import { UserDocument } from "../model/user.model"
import Session from "../model/session.model"

export const cookiesOptions: CookieOptions = {
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 15,
    secure: true
}

//@ts-ignore
export const createSessionHandler = asyncHandler(async (req: Request<{}, {}, CreateSessionInput>, res: Response) => {
    const user = await validatePassword(req.body);
    if(!user) return res.status(400).json({ message: 'Something went wrong'});

    const session = await createSession(user._id, req.get('user-agent') || '');
    if(!session) return res.status(400).json({ message: 'Cannot create session'})

    const accessToken = signJWT(
        {...user, session: session._id },
        { expiresIn: config.get<string>('accessTokenTtl')}
    )


    const refreshToken = signJWT(
        {...user, session: session._id },
        { expiresIn: config.get<string>('refreshTokenTtl')}
    )


    res.cookie('accessToken', accessToken, cookiesOptions);
    res.cookie('refreshToken', refreshToken, {...cookiesOptions, maxAge: 3.154e10 })


    res.json({ accessToken, refreshToken})
})

//@ts-ignore 
export const getUserSessionsHandler = asyncHandler(async (req: Request, res: Response) => {
    const user = res.locals.user as UserDocument;
    const userSessions = await findSessions({ user: user._id});
    if(!userSessions) res.status(400).json({ message: 'Error getting user sessions'});

    res.json(userSessions);
})


export const deleteUserSessionHandler = asyncHandler(async (req: Request, res: Response) => {
    const _id = res.locals.user.session;
    await updateSession({_id }, { valid: false});

    res.clearCookie('accessToken', cookiesOptions);
    res.clearCookie('refreshToken', {...cookiesOptions, maxAge: 3.154e10 })
    res.json({
        accessToken: '',
        refreshToken: ''
    })
});

export const deleteAllUserSessionsHandler = asyncHandler(async (req: Request, res: Response) => {
    const user = res.locals.user as UserDocument;
    await Session.deleteMany({ user: user._id });

    res.json({ message: 'Sessions deleted'})
})