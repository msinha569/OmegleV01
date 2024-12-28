'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Socket } from 'socket.io-client'

interface MessagingProps {
  socket: Socket | null
  opponentId: string | null
}
interface MessageData {
    to: string;
    message: string;
  }

const Messaging: React.FC<MessagingProps> = ({ socket, opponentId }) => {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<string[]>([])

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return

    const handleMessage = (data: MessageData) => {
      // Only add messages that are intended for this user
      
      if (data.to === socket.id) {
        setMessages(prev => [...prev, data.message])
      }
    }

    socket.on('message', handleMessage)

    return () => {
      socket.off('message', handleMessage)
    }
  }, [socket])

  // Send a message to the opponent
  const sendMessages = useCallback(() => {
    if (!message.trim() || !opponentId) return
    const localmsg = message.trim()
    setMessage("")

    // Send the message via socket
    if (socket){
    socket.emit("message", { to: opponentId, message: localmsg }, () => {
      // Once the server confirms sending, show it in our local chat
      setMessages(prev => [...prev, `Me: ${localmsg}`])
    })}
  }, [message, opponentId, socket])

  return (
    <div style={{ marginTop: '20px' }} className='space-y-3'>
      {/* Chat Messages */}
      <div className='text-white bg-black border-2 p-2 overflow-y-scroll h-64 '>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>

      {/* Message Input */}
      <div style={{ marginTop: '10px' }}>
        <input
          value={message}
          className='p-2 text-black'
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              sendMessages()
            }
          }}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Type a message'
          type='text'
          style={{ width: '80%', padding: '10px' }}
        />
        <button
          className='p-2 bg-green-400 text-white'
          onClick={sendMessages}
          style={{ padding: '10px 20px', marginLeft: '10px' }}
        >
          Send
        </button>
      </div>
      <button
        className='p-2 bg-red-400 text-white'
        onClick={() => window.location.reload()}>
            Reconnect
        </button>
    </div>
  )
}

export default Messaging
