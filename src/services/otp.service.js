import crypto from 'crypto';

export class OtpService {
    static generateOTP = (owner, ttl, salt) => {
        const otp = crypto.randomInt(1000, 9999);
        const validity = Date.now() + (1000 * 60 * Number(ttl));
        const dataToHash = `${otp}.${owner}.${validity}`;
        const hash = crypto.createHmac('sha256', salt).update(dataToHash).digest('hex');
        const token = `${hash}.${validity}`

        return { otp, token };
    }

    static verifyOTP = (otp, token, owner, salt) => {
        const [hash, validity] = token.split('.');

        if (validity < Date.now())
            return false;

        const dataToHash = `${otp}.${owner}.${validity}`;
        const newHash = crypto.createHmac('sha256', salt).update(dataToHash).digest('hex');

        if (newHash !== hash)
            return false;

        return true;
    }
};
