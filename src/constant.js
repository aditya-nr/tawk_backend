
// env =============================
import dotenv from 'dotenv';
dotenv.config();

const {
    NODE_ENV,
    PORT,
    BASE_URL,
    DB_URL,
    DB_NAME,
    OTP_TTL,
    OTP_SALT,
    ACCESS_TOKEN_SALT,
    ACCESS_TOKEN_TTL,
    DEBUG_MODE
} = process.env;

export const env = {
    NODE_ENV: NODE_ENV || false,
    PORT,
    BASE_URL,
    DB_URL,
    DB_NAME,
    OTP_TTL,
    OTP_SALT,
    ACCESS_TOKEN_SALT,
    ACCESS_TOKEN_TTL,
    DEBUG_MODE: DEBUG_MODE || false,
};

// constant ========================
export const constant = {
    emailRegEx: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
};