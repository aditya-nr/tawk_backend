import mongoose from "mongoose"


const connectDB = async (DB_URL, DB_NAME) => {
    try {
        const instance = await mongoose.connect(`${DB_URL}/${DB_NAME}`);
        console.log(`DB connected :: `, instance.connection.host);
    } catch (error) {
        console.log(`DB connection error :: ${DB_URL}/${DB_NAME}`);
        throw error;
    }
}

export default connectDB