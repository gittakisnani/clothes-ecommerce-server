import { CorsOptions } from 'cors'
import whiteList from './whiteList'

const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
        if(whiteList.indexOf(origin as string) !== -1 || !origin ) {
            callback(null, true)
        }
        else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

export default corsOptions