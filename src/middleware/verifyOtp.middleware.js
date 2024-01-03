import { OtpService } from '../services/index.js';
import { env } from '../constant.js';
import { string } from 'yup';
import CustomError from '../utils/CustomError.js';

export default async (req, res, next) => {
    // constant
    const PHONE = "PHONE"
    const EMAIL = "EMAIL"

    // 1) take {email,phone} from req.body
    const { otp, token, email, phone, mode } = req.body;
    let owner;

    // 2) validate the data
    try {
        await string()
            .oneOf([PHONE, EMAIL], '"mode" is invalid')
            .required('mode is required')
            .validate(mode);

        if (mode == EMAIL)
            owner = await string()
                .email('Email is invalid')
                .required('Email is required')
                .validate(email);
        else
            owner = await string()
                .required('Phone Number is required')
                .test('is-number', 'Phone number is invalid', (value) => !isNaN(Number(value.replace(/\s/g, ''))))
                .validate(phone);
        await string().required('OTP is required').validate(otp);
        await string().required('Token is required')
            .matches(/^[^.]+\.(\d+)$/, 'Token is invalid')
            .validate(token);
    } catch (error) {
        // ValidationError : yup
        return next(error);
    }

    // 3) verify otp
    if (!OtpService.verifyOTP(otp, token, owner, env.OTP_SALT)) {
        // TODO :: otp verification error
        return next(CustomError.InvalidOTP());
    }

    // 4) go to register :: user is verifed
    next();
}