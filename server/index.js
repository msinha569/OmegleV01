import express from 'express';
import http from 'http'
import { Server } from 'socket.io';
import { socketHandler } from './socket/socket.js';



const port =  3003

    const server = express();
    const httpServer = http.createServer(server);
    
    // Define trusted origins, possibly from environment variables
    const trustedOrigins = '*'
    
    const io = new Server(httpServer, {
      cors: {
        origin: trustedOrigins,
        methods: ["GET", "POST"]
      }
    });
    
    socketHandler(io);

    
    // Error handling middleware for Express
    server.use((err, req, res, next) => {
        console.error("Express error:", err)
        res.status(500).send("Internal Server Error")
    })
    
    httpServer.listen(port,'0.0.0.0', () => {
        console.log(`Server is listening on port ${port}`);
    })

