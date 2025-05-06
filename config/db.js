import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connectionObject = await mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING);
        console.log(`DB connection was successful at mongoDB server cluster Hostname: ${connectionObject.connection.host}\n\n`)
    } catch (error) {
        console.log(`This error was thrown in an attempt to connect to the DB: ${error.message}\n\n`)
    }
}