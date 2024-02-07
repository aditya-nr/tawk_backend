import express from 'express';
import http from 'http';
import morgan from 'morgan';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import { Server } from 'socket.io';
import { chatRouter, userRouter } from './routes/index.js';
import { ApiError } from './middleware/index.js';
import { isAuthSocket, createChatProfile, disconnectController, friendRequest, acceptFriendRequest, textMessage, FileMessage } from './socket/socket.js';


const app = express();

// socket.io 
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});


io.use(isAuthSocket);
io.use(createChatProfile);
io.on('connection', (socket) => {
    socket.on('hello', (prop) => {
        console.log(prop);
        socket.emit('reply', "success");
    });

    socket.on('disconnect', () => disconnectController(socket));
    socket.on('friend-request', (data, cb) => friendRequest(socket, data, cb));
    socket.on('friend-accept', (data, cb) => acceptFriendRequest(socket, data, cb));
    socket.on('text-message', (data, cb) => textMessage(socket, data, cb));
    socket.on('file-message', (data, cb) => FileMessage(socket, data, cb));
});



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
app.get('/', (req, res) => res.json({ status: 200, mesagge: "ALL OK" }))
app.use('/auth', userRouter);
app.use('/chat', chatRouter);


// error handler
app.use(ApiError);

export default server;
