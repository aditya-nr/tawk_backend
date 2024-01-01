import { UserModel } from '../models';
import { JwtService } from '../services';

const AuthController = {
    /**
     * /api/login
     */
    login: async (req, res, next) => {

        // 1) take {username,password } from req.body and validate
        const { username, password } = req.body;
        if (!username || !password) {
            // TODO :: unsufficent data
        }

        // 2) retrieve user doc form db
        let user;
        try {
            user = await UserModel.findOne({ username });
        } catch (error) {
            // TODO :: DB_ERROR
        }

        // 3) compare password or email is not registed
        if (!user || !(await user.isValidPassword(password))) {
            // TODO :: unauthorised -> Email or password doesn't match
        }

        // 4) issue jwt and set jwt to auth header
        // TODO::
    },

    /**
     * /api/send-otp
     */
    sendOtp: async (req, res, next) => {
        // 1) take {email,phone} from req.body
        // 2) validate the data
        // 3) generate otp,token 
        // 4) send otp to {email/phone}
        // 5) send token as res
    },

    /**
     * /api/register
     */
    register: async (req, res, next) => {
        // 1) take {name,username,password,otp,token} from body
        // 2) validate data
        // 3) verify otp
        // 4) check if user already exist
        // 5) save the user
        // 6) issue jwt
    },
}