import mongoose from "mongoose";
import config from 'config'
import logger from "../utils/logger";
export default async function connect() {
    try {
        await mongoose.connect(config.get<string>('databaseUri'))
        logger.info('Connected to DB')
    } catch(err) {
        logger.error('Error connecting to DB')
        process.exit(1)
    }
}