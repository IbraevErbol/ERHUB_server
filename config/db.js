import mongoose from 'mongoose'

export const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connect to NativeDB');
    } catch (error) {
        console.log(`DB connection error: ${error}`);
        process.exit(1);
    }
}