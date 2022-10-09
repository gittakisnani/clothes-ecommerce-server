import { CookieOptions, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import { CreateSessionInput } from "../schema/session.schema"
import { createSession } from "../service/session.service"
import { validatePassword } from "../service/user.service"
import { signJWT } from "../utils/jwt.utils"


const cookiesOptions: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 15,
    secure: false
}

//@ts-ignore
export const createSessionHandler = asyncHandler(async (req: Request<{}, {}, CreateSessionInput>, res: Response) => {
    const user = await validatePassword(req.body);
    if(!user) return res.status(400).json({ message: 'Something went wrong'});

    const session = await createSession(user._id, req.get('user-agent') || '');
    if(!session) return res.status(400).json({ message: 'Cannot create session'})

    const accessToken = signJWT({
        ...user, session: session._id
    }, { expiresIn: '15m'}
    )

    const refreshToken = signJWT({
        ...user, session: session._id
    }, { expiresIn: '1y'})


    res.cookie('accessToken', accessToken, cookiesOptions);
    res.cookie('refreshToken', refreshToken, {...cookiesOptions, maxAge: 3.154e10 })


    res.json({ accessToken, refreshToken})
})