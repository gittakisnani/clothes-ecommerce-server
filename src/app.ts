import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
dotenv.config()
import config from 'config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import logger from './utils/logger'
import corsOptions from './config/corsOption'
import userRouter from './routes/user.route'
import authRouter from './routes/auth.route'
import productRoute from './routes/product.route'
import connect from './config/connectDB'
import multer from 'multer';
const PORT = config.get<number>('PORT') || 1337

export const upload = multer({ dest: 'src/assets/images' })

const app = express();

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('assets/images'))


app.use(userRouter)
app.use(authRouter)
app.use(productRoute)

app.listen(PORT, () => {
    logger.info('Listening')
    connect()
})

