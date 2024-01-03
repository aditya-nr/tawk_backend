import connectDB from "./src/config/db.config.js";
import { env } from "./src/constant.js";
import server from "./src/server.js"
import { MongooseError } from 'mongoose';

; (async () => {
    try {
        await connectDB(env.DB_URL, env.DB_NAME);
        server.listen(env.PORT, () => {
            console.log(`server is running : ${env.BASE_URL}:${env.PORT}`);
        })
    } catch (error) {
        console.log(`Server error :: index.js :: `, error);
        if (error instanceof MongooseError)
            console.log(error.reason);
        process.exit(1);
    }
})()