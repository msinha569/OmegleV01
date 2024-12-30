'use client'
import { useEffect } from 'react'
import Messaging from './component/Messaging'
import WebRTC from './component/WebRTC'


const Chat = () => {
 const { socket ,remoteStream, localStream, opponentId,status} = WebRTC()
  return (
    <div>
      <div>
        {status}
      </div>
     <div>
     <Messaging socket={socket} opponentId={opponentId} />
     </div>

      {/* Video Streams */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        {/* Local Video */}
        <video
          width="400px"
          height="400px"
          autoPlay
          muted
          playsInline
          ref={(video) => {
            if (video && localStream) {
              video.srcObject = localStream
            }
          }}
          style={{ border: '1px solid #ccc' }}
        />
        {/* Remote Video */}
        <video
          width="400px"
          height="400px"
          autoPlay
          playsInline
          ref={(video) => {
            if (video && remoteStream) {
              video.srcObject = remoteStream
            }
          }}
          style={{ border: '1px solid #ccc' }}
        />
      </div>

    </div>
  )
}

export default Chat