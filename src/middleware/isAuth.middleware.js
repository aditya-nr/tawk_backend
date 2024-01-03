import { string } from "yup";
import { JwtService } from "../services/index.js";

export default async (req, res, next) => {
    const { token } = req.body;

    try {
        // validate the data
        await string().required('Token is required').validate(token);
        // decode the jwt
        let user = JwtService.verify(token);
        req.user = user;
    } catch (error) {
        next(error);
    }

    next();
}