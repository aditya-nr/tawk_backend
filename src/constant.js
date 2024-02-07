
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
    DEBUG_MODE,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_SENDER,
    SES_USER,
    SES_KEY,
    AWS_S3_KEY_ID,
    AWS_S3_KEY,
    AWS_S3_BUCKET,
    AWS_S3_REGION
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
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_SENDER,
    SES_USER,
    SES_KEY,
    AWS_S3_KEY_ID,
    AWS_S3_KEY,
    AWS_S3_BUCKET,
    AWS_S3_REGION
};

// constant ========================
export const constant = {
    emailRegEx: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
};