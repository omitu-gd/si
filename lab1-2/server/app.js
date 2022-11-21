import express from 'express';
import dotenv from 'dotenv';
import logger from 'morgan';
import http from 'http';
import path from 'path';

import initDatabase from './libs/Database';
import apiRouter from './routes/api';
import socketIO from './socket';

const app = express();

global.rootDir = path.resolve(__dirname);

dotenv.config();

initDatabase().then(function () {
    console.log('Connect to MongoDB database');
}).catch(function (err) {
    console.log('Cannot connect to MongoDB data'); 
    console.log(err);
});

const PORT = process.env.PORT || 5001;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join('client', 'build')));
    app.use('*', (req, res) => res.sendFile(path.join(__dirname, 'client', 'build', 'index.html')));
}

app.use(function (err, req, res, next) {
    res.status(err.status || 500);

    console.log(err);
    if (err.message) {
        res.send(err);
    } else {
        res.send(err.stack);
    }
});

const server = http.createServer(app);
socketIO(server);

server.listen(PORT, function () {
    console.log('Listening on port', PORT); 
});