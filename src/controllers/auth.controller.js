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
    /**
     * /api/send-otp
     */
    sendOtp: async (req, res, next) => {
        // constant
        const PHONE = "PHONE"
        const EMAIL = "EMAIL"

        // 1) take {email,phone} from req.body
        const { email, phone, mode } = req.body;
        let owner;

        // 2) validate the data
        // 2.1) check if {email/phone already registered with other account or not}
        try {
            await string()
                .oneOf([PHONE, EMAIL], 'mode is invalid')
                .required('mode is required')
                .validate(mode);

            if (mode == EMAIL)
                owner = await string()
                    .email('Email is invalid')
                    .required('Email is required')
                    .test('is-unique-email', 'Email is already taken', async (email) => {
                        try {
                            let user = await UserModel.findOne({ email }, 'email');
                            console.log(user);
                            return !!user ? false : true;
                        } catch (error) {
                            throw error;
                        }
                    })
                    .validate(email);
            else
                owner = await string()
                    .required('Phone Number is required')
                    .test('is-number', 'Phone number is invalid', (value) => !isNaN(Number(value.replace(/\s/g, ''))))
                    .test('is-unique-phone', 'Phone Number is already in use', async (phone) => {
                        try {
                            let user = await UserModel.findOne({ phone }, 'phone');
                            console.log(user);
                            return !!user ? false : true;
                        } catch (error) {
                            throw error;
                        }
                    })
                    .validate(phone);

        } catch (error) {
            // ValidationError : yup
            return next(error);
        }



        // 3) generate otp,token 
        const { otp, token } = OtpService.generateOTP(owner, env.OTP_TTL, env.OTP_SALT);

        // 4) send otp to {email/phone}
        try {
            if (mode == EMAIL) {
                let body = `Your otp is <OTP>. Valid upto ${Number(env.OTP_TTL)} min`;
                body = body.replace('<OTP>', otp.toString());
                await MailService.sendMail(body);
            } else {
                let body = `Your otp is <OTP>. Valid upto ${Number(env.OTP_TTL)} min`;
                body = body.replace('<OTP>', otp.toString());
                await SmsService.sendSms(body);
            }
        } catch (error) {
            return next(error);
        }

        // 5) send token as res
        res.json({ status: 200, data: { token } });
    },

}

export default AuthController;