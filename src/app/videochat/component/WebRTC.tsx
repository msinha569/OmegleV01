'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useSocket } from '../../../helpers/useSocket'

const ContextRTC =  createContext({} as any)

export const useRTC = () => useContext(ContextRTC)

export const WebRTC = ({children}:any) => {
    const { socket } = useSocket()
    const [opponentId, setOpponentId] = useState<string | null>(null)
    const [status, setStatus] = useState("waiting for a match...")
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [role, setRole] = useState<"caller" | "callee" | "">("")
    
    
  // Ref to store the RTCPeerConnection instance
  const pcRef = useRef<RTCPeerConnection | null>(null)

  // Ref to store a pending offer if callee hasn't got localStream yet
  const pendingOfferRef = useRef<any>(null)

  // 1. Acquire local media
  useEffect(() => {
    if (typeof window !== 'undefined') {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          console.log('Local stream acquired')
          setLocalStream(stream)
        })
        .catch((err) => console.error('Error accessing media devices:', err))
    }
  }, [])

  // 2. Listen for 'matched' and 'message' events
  useEffect(() => {
    if (!socket) return

    // Handle 'matched' event
    const handleMatched = ({ opponentId, role }: any) => {
      console.log("Matched with opponent:", opponentId, "as", role)
      setOpponentId(opponentId)
      setRole(role)
      setStatus(` I am ${socket.id} Connected successfully with client ${opponentId} as ${role}`)
    }
    socket.on('matched', handleMatched)

    return () => {
      socket.off('matched', handleMatched)
    }
  }, [socket])

  // 3. Initialize RTCPeerConnection and set up event listeners
  useEffect(() => {
    if (!socket || !opponentId || !role) return

    // Initialize RTCPeerConnection if not already
    if (!pcRef.current) {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }, // Google's public STUN server
        ]
      })
      pcRef.current = pc
      console.log('RTCPeerConnection created')

      // Handle incoming remote tracks
      pc.ontrack = (event) => {
        console.log("Received remote stream:", event.streams[0])
        setRemoteStream(event.streams[0])
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { candidate: event.candidate })
          console.log('Sent ICE candidate')
        }
      }

      // Listen for ICE candidates from peer
      socket.on('ice-candidate', async ({ candidate }: any) => {
        if (candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
            console.log('Added received ICE candidate')
          } catch (err) {
            console.error('Error adding received ICE candidate:', err)
          }
        }
      })
    }

    const peerConnection = pcRef.current

    if (role === 'caller') {
      // Caller: add local tracks and create/send offer
      if (localStream) {
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream)
        })
        console.log('Added local tracks to peer connection')
      } else {
        console.warn('Local stream not available for caller')
      }

      // Create and send offer
      const createAndSendOffer = async () => {
        try {
          const offer = await peerConnection.createOffer()
          await peerConnection.setLocalDescription(offer)
          socket.emit('offer', { offer })
          console.log('Offer created and sent')
        } catch (err) {
          console.error('Error creating/sending offer:', err)
        }
      }

      createAndSendOffer()

      // Listen for 'answer' event
      const handleAnswer = async ({ answer }: any) => {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
          console.log('Remote description set with answer')
        } catch (err) {
          console.error('Error setting remote description with answer:', err)
        }
      }

      socket.on('answer', handleAnswer)

      return () => {
        socket.off('answer', handleAnswer)
      }

    } else if (role === 'callee') {
      // Callee: listen for 'offer' and respond with 'answer'
      const handleOffer = async ({ offer }: any) => {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
          console.log('Remote description set with offer')

          if (localStream) {
            localStream.getTracks().forEach(track => {
              peerConnection.addTrack(track, localStream)
            })
            console.log('Added local tracks to peer connection')
          } else {
            console.warn('Local stream not available yet for callee to add tracks')
            pendingOfferRef.current = offer
            return
          }

          const answer = await peerConnection.createAnswer()
          await peerConnection.setLocalDescription(answer)
          socket.emit('answer', { answer })
          console.log('Answer created and sent')
        } catch (err) {
          console.error('Error handling offer:', err)
        }
      }

      // Listen for 'offer' event
      socket.on('offer', handleOffer)

      // If a pending offer exists (received before localStream was ready), handle it now
      if (pendingOfferRef.current && localStream) {
        handleOffer({ offer: pendingOfferRef.current })
        pendingOfferRef.current = null
      }

      return () => {
        socket.off('offer', handleOffer)
      }
    }

  }, [socket, opponentId, role, localStream])

  // 4. Handle pending offer when localStream becomes available for callee
  useEffect(() => {
    if (role !== 'callee' || !pendingOfferRef.current || !localStream || !pcRef.current) return

    const peerConnection = pcRef.current

    const handlePendingOffer = async () => {
      try {
        const offer = pendingOfferRef.current
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        console.log('Remote description set with pending offer')

        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream)
        })
        console.log('Added local tracks to peer connection after pending offer')

        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        socket.emit('answer', { answer })
        console.log('Answer created and sent after pending offer')
      } catch (err) {
        console.error('Error handling pending offer:', err)
      }
    }

    handlePendingOffer()
    pendingOfferRef.current = null
  }, [localStream, role, socket, opponentId])


  console.log(remoteStream);
  
  // Clean up RTCPeerConnection on component unmount
  useEffect(() => {
    return () => {
      if (pcRef.current) {
        pcRef.current.close()
        pcRef.current = null
        console.log('RTCPeerConnection closed')
      }
    }
  }, [])



  return (
      <ContextRTC.Provider value={{localStream, remoteStream,socket,opponentId,status}}>
      {children}
      </ContextRTC.Provider>
  )
}

