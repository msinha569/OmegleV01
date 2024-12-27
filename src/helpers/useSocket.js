'use client'
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext()

export const useSocket = () => {
    const context = useContext(SocketContext)
    if(!context){
        throw new Error("useSocket must be used in a socket provider")
    }
    return context
}
 export const SocketProvider = ({serverUrl, children}) => {
    const [socket, setSocket] = useState(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        const newSocket = io(serverUrl)
        setSocket(newSocket)

        newSocket.on('connect',() => {
            console.log("socket is this",newSocket);
            
            console.log("connection established with:",newSocket.id);
            setIsConnected(true)
        })
        newSocket.on('disconnect',() => {
            console.log("disconnected:",newSocket.id);
            setIsConnected(false)
        })

        return () => {
            newSocket.disconnect()
        }
    },[serverUrl])

    return (
        <SocketContext.Provider value={{isConnected, socket}}>
            {children}
        </SocketContext.Provider>
    )

}