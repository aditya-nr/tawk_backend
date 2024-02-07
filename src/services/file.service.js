import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../constant.js';




const client = new S3Client({
    region: env.AWS_S3_REGION,
    credentials: {
        accessKeyId: env.AWS_S3_KEY_ID,
        secretAccessKey: env.AWS_S3_KEY
    }
})
export class FileServie {
    static getObjectUrl = async (Key) => {
        const command = new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET,
            Key
        })
        const url = await getSignedUrl(client, command, {
            expiresIn: 500
        });
        return url;
    }

    static putObjectUrl = async (path, filename, contentType) => {
        const key = `${path}/${filename}`;
        const command = new PutObjectCommand({
            Bucket: env.AWS_S3_BUCKET,
            Key: key,
            ContentType: contentType
        })

        const url = await getSignedUrl(client, command);
        return { url, key };
    }
}