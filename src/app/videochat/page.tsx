'use client'
import { useEffect, useState } from 'react'
import {useSocket} from '../../helpers/useSocket'
 const Chat = () => {
    const {socket, isConnected} = useSocket()
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState<any[]>([])
    const [opponentId, setOpponentId] = useState(null)
    const [status, setStatus] = useState("waiting for a match...")
    const [localStream, setLocalStream] = useState<MediaStream|null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream|null>(null)
    const [role, setRole] = useState("")

    useEffect(() => {
        if (typeof window !== 'undefined') {
          navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
              setLocalStream(stream);
            })
            .catch((err) => console.error('Error accessing media devices:', err));
        }
      }, []);
      

    useEffect(() => {
        if (socket){

            socket.on('matched',({opponentId, role}:any) => {
                console.log("matched with opponent:",opponentId);
                setOpponentId(opponentId)
                setRole(role)
                setStatus(`Connected successfully with client ${opponentId}`)
            })
            console.log("localstream is,",localStream);
            
            if (opponentId && role){
                initializeWebRTC(opponentId,role)
                console.log("oppo and role and localstream all present");
                
            }

            socket.on('message',(data:any) => {
                if(socket.id === data.to)
                setMessages((prev) => [...prev, data.localmsg])
            })

            return () => {
                socket.off('message')
                socket.off('matched')
            }

        }
    },[socket,opponentId])

    const sendMessages = () => {
        
        if (message.trim() && opponentId){
            const localmsg = message
            setMessage("")
            console.log(localmsg);
            socket.emit("message",{to:opponentId, localmsg},() => {
                console.log("the message:",localmsg);
            })
        }
    }
    const initializeWebRTC = async (opponentId: any, role: string) => {
        const peerConnection = new RTCPeerConnection();
        const iceCandidateQueue: RTCIceCandidate[] = [];

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice-candidate', { to: opponentId, candidate: event.candidate });
          }
        };
      
        // Get local media (camera/microphone)

        if (localStream){
        localStream.getTracks().forEach((track) => {
            console.log("lets see if getTracks is being executed by role:",role);
            
            peerConnection.addTrack(track, localStream);
        });
    }   
        peerConnection.ontrack = (event) => {
            console.log("the ontrack is being executed on role:",role);
            
          console.log("Received remote stream:", event.streams[0]);
          setRemoteStream(event.streams[0]);
        };
      
        const processIceCandidates = () => {
          while (iceCandidateQueue.length > 0) {
            const candidate = iceCandidateQueue.shift();
            if (candidate) {
              peerConnection.addIceCandidate(candidate).catch((err) =>
                console.error('Failed to add ICE candidate:', err)
              );
            }
          }
        };
      

      
        if (role === 'caller') {
          // Caller creates and sends the offer
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          socket.emit('offer', { to: opponentId, offer });

          socket.on('answer', async ({ answer }:any) => {
            try {
              await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
              processIceCandidates();
            } catch (error) {
              console.error('Error handling answer:', error);
            }
          });

        } else if (role === 'callee') {
          // Callee waits for the offer, processes it, and sends an answer
          socket.on('offer', async ({ offer }:any) => {
            try {
              await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
              processIceCandidates();
      
              const answer = await peerConnection.createAnswer();
              await peerConnection.setLocalDescription(answer);
              socket.emit('answer', { to: opponentId, answer });
            } catch (error) {
              console.error('Error handling offer:', error);
            }
          });
        }
      

      
        socket.on('ice-candidate', async ({ candidate }:any) => {
          const iceCandidate = new RTCIceCandidate(candidate);
          if (peerConnection.remoteDescription) {
            await peerConnection.addIceCandidate(iceCandidate).catch((err) =>
              console.error('Failed to add ICE candidate:', err)
            );
          } else {
            iceCandidateQueue.push(iceCandidate);
          }
        });
        socket.on('offer', (data:any) => console.log('Offer received:', data));
        socket.on('answer', (data:any) => console.log('Answer received:', data));
        socket.on('ice-candidate', (data:any) => console.log('ICE candidate received:', data));
      };

    
    
    
    return (
        <div>
            <div>
                Chat Here
            </div>
            <div>
                {isConnected? "Connected" : "Disconnected"}
                
            </div>
            <div>
                {status} and i am {socket && socket.id}
            </div>
            <div className='text-white  border-2'>
                {messages && messages.map((msg:any,index:any) => (<div className='font-white' key={index}>{msg}</div>))}
            </div>
            <div>
                <video
                width="400px"
                height="400px"
                autoPlay
                muted
                playsInline
                ref={(video) => {
                    if (video && localStream) {
                    video.srcObject = localStream;
                    }
                }}
                />
                <video
                width="400px"
                height="400px"
                autoPlay
                playsInline
                ref={(video) => {
                    if (video && remoteStream) {
                    video.srcObject = remoteStream;
                    }
                }}
                />
            </div>
            <div>
                <input
                value={message}
                className='p-2 text-black'
                onKeyDown={(e) => {if(e.key==="Enter"){e.preventDefault(); sendMessages()}}}
                onChange={(e) => setMessage(e.target.value)}
                placeholder='Type a message'
                type='text'/>
                <button
                className='p-2 bg-green-400'
                onClick={sendMessages}>
                    send
                </button>
            </div>
        </div>
    )
}
export default Chat