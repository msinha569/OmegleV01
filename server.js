// process.on('uncaughtException', (error) => {
//   console.error('Uncaught Exception:', error);
//   // Optionally, perform clean-up tasks before shutting down
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
//   // Optionally, perform clean-up tasks
// });



// import { Server } from "socket.io"
// import express from "express"
// import http from "http"
// import next from "next"

// const port = process.env.PORT || 3000
// const app = next({dev: process.env.NODE_ENV !== 'production'})

// const handle = app.getRequestHandler()

// app.prepare().then(() => {
//   const server = express()
//   const httpServer = http.createServer(server)

//   const io = new Server(httpServer, {
//     cors: {
//       origin: '*',
//       methods: ['GET','POST']
//     }
//   })
//   io.on('connection', (socket) => {
//     console.log("connection is established with client:",socket.id)
    
//     socket.on('message',(data) => {
//       console.log("message received:",data);
//       socket.broadcast.emit("message",data)
//     })
//     socket.on('disconnect', () => {
//       console.log("client disconnected",socket.id);
      
//     })
//   })

//   server.all('*', (req,res)=>{
//     return handle(req, res)
//   })

//   httpServer.listen(port, () => {
//     console.log("server listening on port",port);
    
//   })

// })