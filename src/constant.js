
// env =============================
import dotenv from 'dotenv';
dotenv.config();

const {
    PORT,
    BASE_URL,
    DB_URL,
    DB_NAME
} = process.env;

export const env = {
    PORT,
    BASE_URL,
    DB_URL,
    DB_NAME
};

// constant ========================
export const constant = {
    emailRegEx: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
};