import { io } from "socket.io-client";

const socket = io(`http://localhost:${process.env.PORT}`)

socket.on('connect', () => {
  console.log("connected to server:",socket.id);
})
socket.on('message', () => {
  console.log("message from server:",data);
})
socket.emit('message','hello from client')