import jwt, { JsonWebTokenError } from "jsonwebtoken";;
import config from 'config'
import logger from "./logger";

const privateKey = config.get<string>('privateKey');
const publicKey = config.get<string>('publicKey');


export const signJWT = (object: object, options?: jwt.SignOptions) => {
    return jwt.sign(object, privateKey, {
        ...(options && options),
        algorithm: 'RS256'
    })
}


export const verifyJWT = (token: string) => {
    try {
    const decoded = jwt.verify(token, publicKey);
    return {
        decoded,
        valid: true,
        expired: false
    }
    } catch(err) {
        return {
            valid: false,
            expired: (err as JsonWebTokenError).message.includes('jwt expired'),
            decoded: null
        }
    }
}