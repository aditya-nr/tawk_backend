import { object, string } from 'yup';

import { UserModel } from '../models/index.js';
import { MailService, OtpService, SmsService } from '../services/index.js';
import { env } from '../constant.js';
import CustomError from '../utils/CustomError.js';

const AuthController = {
    /**
     * /api/login
     */
    login: async (req, res, next) => {

        // 1) take {username,password } from req.body and validate
        const { username, password } = req.body;

        // 1.2) validate
        try {
            await string().required('username is required').validate(username);
            await string().required('password is required').validate(password);
        } catch (error) {
            return next(error);
        }

        // 2) retrieve user doc form db
        let user;
        try {
            user = await UserModel.findOne({ username });
        } catch (error) {
            // TODO :: DB_ERROR
            return next(error);
        }

        // 3) compare password or email is not registed
        if (!user || !(await user.isValidPassword(password))) {
            // TODO :: unauthorised -> Email or password doesn't match
            return next(CustomError.unauthorised({ message: "Email or password doesn't match" }));
        }

        // 4) issue jwt and set jwt to auth header
        req.user = user;
        next();
    },


}

export default AuthController;