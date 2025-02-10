import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI.endsWith('/') 
            ? `${process.env.MONGODB_URI}${DB_NAME}` 
            : `${process.env.MONGODB_URI}/${DB_NAME}`;
        const connectionInstance = await mongoose.connect(uri);

        console.log(` \n MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Mongodb connection error", error);
        process.exit(1);
    }
}

export default connectDB;