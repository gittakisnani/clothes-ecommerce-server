import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import config from 'config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import logger from './utils/logger'
import corsOptions from './config/corsOption'
import userRouter from './routes/user.route'
import authRouter from './routes/auth.route'
import connect from './config/connectDB'
const PORT = config.get<number>('PORT') || 1337


const app = express();

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())


app.use(userRouter)
app.use(authRouter)

app.listen(PORT, () => {
    logger.info('Listening')
    connect()
})

