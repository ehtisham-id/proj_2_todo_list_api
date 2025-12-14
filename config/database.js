import mongoose from 'mongoose';
import pino from 'pino';

const logger = pino();

const connectDB = async () => { 
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        logger.error(`Error: ${err.message}`);

        // Wait 5 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 5000));

        return connectDB(); // Retry
    }
};

export default connectDB;
