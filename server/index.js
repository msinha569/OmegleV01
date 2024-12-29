import express from 'express';
import http from 'http'
import { Server } from 'socket.io';
import { socketHandler } from './socket/socket.js';
import next from 'next';

const port = process.env.PORT || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })

app.prepare().then(() => {
    const server = express();
    const httpServer = http.createServer(server);
    const handle = app.getRequestHandler()
    
    // Define trusted origins, possibly from environment variables
    const trustedOrigins = '*'
    
    const io = new Server(httpServer, {
      cors: {
        origin: trustedOrigins,
        methods: ["GET", "POST"]
      }
    });
    
    socketHandler(io);
    
    // Handle all other routes with Next.js
    server.all('*', (req, res) => {
        return handle(req, res)
    })
    
    // Error handling middleware for Express
    server.use((err, req, res, next) => {
        console.error("Express error:", err)
        res.status(500).send("Internal Server Error")
    })
    
    httpServer.listen(port,'0.0.0.0', () => {
        console.log(`Server is listening on port ${port}`);
    })
}) 
