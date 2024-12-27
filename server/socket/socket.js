
import {handlequeue} from './queue.js'

export const socketHandler = (io) => {
    io.on('connection',(socket) => {
        console.log("connected to:",socket.id);
        handlequeue(socket,io)

        socket.on('message',(data) => {
            const {to, message} = data
            console.log("message:",data);
            console.log("to:",to);
            io.to(to).emit('message',{to, message})
        })

        socket.on('disconnect',() => {
            console.log("user disconnected",socket.id);
            handlequeue(socket,io,'disconnect')
        })
    })
}