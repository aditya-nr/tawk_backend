import aws from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';

import { env } from '../constant.js';

// create ses service object
const ses = new aws.SES({
    apiVersion: "2010-12-01",
    region: "us-east-1",
    credentials: {
        accessKeyId: env.SES_USER,
        secretAccessKey: env.SES_KEY
    }
})

// create Nodemailer SES transporter
let transporter = nodemailer.createTransport({
    SES: { ses, aws },
});

export class MailService {
    static sendMail = async (name, to, subject, html, fallbackText) => {
        console.log(fallbackText);
        return;
        const mailOptions = {
            from: {
                name,
                address: env.SMTP_SENDER
            },
            to: [to],
            subject,
            text: fallbackText,
            html,
        };

        try {
            let res = await transporter.sendMail(mailOptions);
            return res;
        } catch (error) {
            console.log(error);
            throw error;
        }

    }
};

