import { get, omit } from "lodash";
import { FilterQuery, UpdateQuery } from "mongoose";
import privateFileds from "../config/privateFileds";
import Session, { SessionDocument } from "../model/session.model";
import { signJWT, verifyJWT } from "../utils/jwt.utils";
import { findUser } from "./user.service";

export async function createSession(userId: string, userAgent: string) : Promise<SessionDocument> {
    return Session.create({ user: userId, userAgent})
}

export async function updateSession(query: FilterQuery<SessionDocument>, update: UpdateQuery<SessionDocument>, options?: {}): Promise<UpdateQuery<SessionDocument>> {
    return Session.updateOne(query, update, {...(options && options), new: true })
}


export async function findSessions(query: FilterQuery<SessionDocument>) {
    return Session.find(query).lean().exec()
}

export async function reIssueAccessToken({ refreshToken } : { refreshToken: string }) : Promise<boolean | string > {
    const { decoded } = verifyJWT(refreshToken);
    if(!decoded || !get(decoded, 'session')) return false;

    const session = await Session.findById(get(decoded, 'session')).lean().exec();
    if(!session || !session.valid) return false;

    const user = await findUser({ _id: session.user });
    if(!user) return false;

    const newAccessToken = signJWT({
        ...omit(user.toJSON(), privateFileds), session: session._id
    }, {expiresIn: '10m' })

    return newAccessToken
} 