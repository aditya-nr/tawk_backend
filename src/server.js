import express from 'express';
import http from 'http';
import morgan from 'morgan';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';

const app = express();

// cors
app.use(cors({
    origin: '*',
}))
// logger : morgan
if (process.env.NODE_ENV == 'DEV') {
    app.use(morgan('dev'));
}

// security headers
app.use(helmet());

// rate limit
const limiter = rateLimit({
    windowMs: 1000 * 60 * 15,
    max: 200,
    message: (req, res) => {
        res.send(`<h2>Too Many request. Try again in 15 minutes</h2>`)
    }
})
app.use(limiter);

// parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// santizie req
app.use(mongoSanitize({ replaceWith: '_' }));

// routes
app.get('/', (req, res) => {
    res.json({ status: 200 })
})

const server = http.createServer(app);
export default server;
