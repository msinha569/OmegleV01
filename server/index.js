import express from 'express';
import http from 'http'
import { Server } from 'socket.io';
import { socketHandler } from './socket/socket.js';
import next from 'next';

const port = process.env.PORT || 3000
const app = next({dev: process.env.NODE_ENV !== 'production'})
app.prepare().then(() => {
    const server = express();
    const httpServer = http.createServer(server);
    const handle = app.getRequestHandler()
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    socketHandler(io);
    
    server.all('*', (req,res) => {
        return handle(req,res)
    })
    httpServer.listen(port, () => {
        console.log("server is listening on port",port);
        
    })

})    

