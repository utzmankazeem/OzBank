import dotenv from 'dotenv'
dotenv.config()
import mongoose from "mongoose";
const isProduction = process.env.NODE_ENV === 'production'
const dbUri = isProduction ? process.env.DATABASE_URI : process.env.DATABASE_URI_LOCAL

const connectDB = async () => {
    mongoose.set('strictQuery', true)
    try {
        await mongoose.connect(dbUri, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            family:4
        });
    } catch (err) {
        throw err
    }
}

export default connectDB