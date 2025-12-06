import {mongoose} from 'mongoose';
import { pino } from 'pino';

const logger = pino();

const connectDB = async () => { 
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        logger.error(`Error: ${err.message}`);
        process.exit(1);
    }
}

export default connectDB;