import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connectionInstance  = await mongoose.connect("mongodb://localhost:27017/brainly");
        console.log(`\n MongoDB connected !! DB host: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGODB connection Failed",error);
        process.exit(1);
    }
}