export default class CustomError extends Error {
    constructor({ status, message, errors }) {
        super();
        this.errors = errors || [];
        this.status = status || 500;
        this.message = message || 'Internal Server Error';
    }

    static InvalidOTP() {
        return new CustomError({ status: 401, message: 'Invalid OTP' });
    }
    static unauthorised(props) {
        return new CustomError({ status: 400, message: props?.message || "UNAUTHORISED" });
    }
}