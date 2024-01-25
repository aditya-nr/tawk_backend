import { ValidationError } from "yup"
import { Error as Mongoose, MongooseError } from 'mongoose';
import { CustomError } from "../utils/index.js";
import { env } from "../constant.js";
import jwt from 'jsonwebtoken';


export default (err, req, res, next) => {

    const data = {
        status: "ERROR",
        message: 'Internal Server Error',
        errors: []
    };
    let status = 500;

    if (err instanceof ValidationError) {
        data.message = err.message;
        status = 400;
    }

    else if (err instanceof Mongoose.ValidationError) {

        const arr = [];
        arr.push()
        for (const field in err.errors) {
            if (Object.hasOwnProperty.call(err.errors, field)) {
                const message = err.errors[field].message;
                data.errors.push({ field, message });
            }
        }
        data.message = err._message;
        status = 400;
    }

    else if (err instanceof Mongoose.MongooseServerSelectionError) {
        env.NODE_ENV && console.log(`MongooseServerSelectionError ::  \n`, err);
    }
    else if (err instanceof MongooseError) {
        env.NODE_ENV && console.log(`MongooseError ::  \n`, err);
    }

    else if (err instanceof CustomError) {
        status = err.status;
        data.message = err.message;
        data.errors = err.errors;
    }

    else if (err instanceof jwt.JsonWebTokenError) {
        data.message = err.message;
        status = 401
    }

    else if (err instanceof jwt.TokenExpiredError) {
        data.message = err.message;
        status = 401
    }

    else if (err instanceof jwt.NotBeforeError) {
        data.message = err.message;
        status = 401
    }

    else {
        env.NODE_ENV && console.log(err);
    }

    res.status(status).json(data);
}