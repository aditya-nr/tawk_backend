import fs from 'fs';
import path from 'path';
import { object, string } from 'yup';

import { UserModel } from '../models/index.js';
import { MailService, OtpService, SmsService } from '../services/index.js';
import { env } from '../constant.js';
import CustomError from '../utils/CustomError.js';

let otpTemplate = fs.readFileSync(`${path.resolve('./src/utils/')}/otpTemplate.html`, { encoding: 'utf-8' });

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
                    .test('is-unique-email', 'This email is associated with another account.', async (email) => {
                        try {
                            let user = await UserModel.findOne({ email }, 'email');
                            // console.log({ src: "authController:email validation: 90", user });
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
                            // console.log({ src: "authController:phone validation: 90", user });
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
                otpTemplate = otpTemplate.replace("{{TIME}}", `${Number(env.OTP_TTL)}`).replace("{{OTP}}", otp)
                let fallbackText = `Your otp is ${otp}. Valid upto ${Number(env.OTP_TTL)} min`;
                await MailService.sendMail('Akite', email, "OTP verification", otpTemplate, fallbackText);
            } else {
                let text = `Your otp is ${otp}. Valid upto ${Number(env.OTP_TTL)} min`;
                await SmsService.sendSms(phone, text);
            }
        } catch (error) {
            return next(error);
        }

        // 5) send token as res
        res.json({ status: "OK", data: { token } });
    },

    /**
     * /api/register
     */
    register: async (req, res, next) => {
        // 1) take {name,username,password} from body
        let { firstName, lastName, username, password } = req.body;
        let { mode, email, phone } = req.body;

        // 2) validate data
        let data;
        try {
            data = await object({
                firstName: string().matches(/^[A-Za-z ]+$/, "First name can only contain alphabet"),
                lastName: string().matches(/^[A-Za-z ]+$/, "Last name can only contain alphabet"),
                username: string().matches(/^[a-zA-Z][a-zA-Z1-9_\-\.]*$/, "Invalid Username").required('Username is Required'),
                password: string()
                    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/, "Invalid Password").required('Password is required')
            })
                .validate({ firstName, lastName, username, password })
        } catch (error) {
            return next(error);
        }
        if (mode == "PHONE")
            data = { ...data, phone };
        else
            data = { ...data, email };

        // 3) check if user already exist or mode already exist or not
        // TODO :: add this feature to UserModel itself

        // 4) save the user 
        let user = new UserModel({ ...data });
        try {
            user = await user.save();
        } catch (error) {
            return next(error);
        }

        // 5) issue jwt
        req.user = user;
        next();
    },

    /**
     *  /api/avilable-username
     */
    isUsernameAvilable: async (req, res, next) => {
        let { username } = req.body;
        try {
            username = await string()
                .required('Username is Required')
                .matches(/^[a-zA-Z][a-zA-Z1-9_\-\.]*$/, "Invalid Username")
                .validate(username);
            username = await string()
                .test('is-unique-username', 'Username is already taken', async (username) => {
                    try {
                        let user = await UserModel.findOne({ username }, 'username');
                        // console.log({ src: "authController:isUsernameAvilabe: 90", user });
                        return !!user ? false : true;
                    } catch (error) {
                        throw error;
                    }
                })
                .validate(username)
        } catch (error) {
            return next(error);
        }

        res.status(200).json({ status: "OK" });
    }
}

export default AuthController;