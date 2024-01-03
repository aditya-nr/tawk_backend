import jwt from "jsonwebtoken"
import { env } from "../constant.js"

export class JwtService {
    static sign = (payload, ttl) => {
        return jwt.sign(payload, env.ACCESS_TOKEN_SALT, {
            expiresIn: 60 * (Number(ttl)),
        })
    }

    static verify = (token) => {
        try {
            return jwt.verify(token, env.ACCESS_TOKEN_SALT);
        } catch (error) {
            if ((error instanceof jwt.JsonWebTokenError) || (error instanceof jwt.TokenExpiredError))
                throw error;
            throw new jwt.NotBeforeError('Invalid Token');
        }
    }
};