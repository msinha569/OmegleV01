'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Socket } from 'socket.io-client';
import { useSocket } from '../../../helpers/useSocket';

interface WebRTCProps {
  children: ReactNode;
}

interface MatchedEvent {
  opponentId: string;
  role: 'caller' | 'callee';
}

interface MessageEvent {
  from: string;
  message: string;
}

interface IceCandidateEvent {
  candidate: RTCIceCandidateInit;
}

interface OfferEvent {
  offer: RTCSessionDescriptionInit;
}

interface AnswerEvent {
  answer: RTCSessionDescriptionInit;
}

interface RTCContext {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  socket: Socket | null;
  opponentId: string | null;
  status: string;
}

const ContextRTC = createContext<RTCContext>({
  localStream: null,
  remoteStream: null,
  socket: null,
  opponentId: null,
  status: '',
});

export const useRTC = () => useContext(ContextRTC);

export const WebRTC: React.FC<WebRTCProps> = ({ children }) => {
  const { socket } = useSocket();
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [status, setStatus] = useState('waiting for a match...');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [role, setRole] = useState<'caller' | 'callee' | ''>('');

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);

  const [reloadTriggered, setReloadTriggered] = useState(false);

  // 1. Acquire local media
  useEffect(() => {
    if (typeof window !== 'undefined') {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          console.log('Local stream acquired');
          setLocalStream(stream);
        })
        .catch((err) => console.error('Error accessing media devices:', err));
    }
  }, []);

  // 2. Listen for events: 'matched', 'message', and 'peer-disconnected'
  useEffect(() => {
    if (!socket) return;

    const handleMatched = ({ opponentId, role }: MatchedEvent) => {
      console.log('Matched with opponent:', opponentId, 'as', role);
      setOpponentId(opponentId);
      setRole(role);
      setStatus(`I am ${socket.id}. Connected successfully with client ${opponentId} as ${role}`);
    };


    const handlePeerDisconnected = () => {
      console.log('Peer has disconnected.');
      setStatus('Your peer has disconnected. Waiting for a new match...');
      setOpponentId(null);
      setRemoteStream(null);
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
        console.log('RTCPeerConnection closed due to peer disconnection');
      }
    };

    socket.on('matched', handleMatched);
    socket.on('peer-disconnected', handlePeerDisconnected);

    return () => {
      socket.off('matched', handleMatched);
      socket.off('peer-disconnected', handlePeerDisconnected);
    };
  }, [socket, opponentId]);

  // 3. Reload if no remote stream
  useEffect(() => {
    if (localStream && !remoteStream && !reloadTriggered) {
      const timeout = setTimeout(() => {
        if (!remoteStream) {
          setReloadTriggered(true);
          window.location.reload();
        }
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [localStream, remoteStream, reloadTriggered]);

  // 4. Initialize RTCPeerConnection
  useEffect(() => {
    if (!socket || !opponentId || !role) return;

    if (!pcRef.current) {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      pcRef.current = pc;

      pc.ontrack = (event) => {
        console.log('Received remote stream:', event.streams[0]);
        setRemoteStream(event.streams[0]);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { candidate: event.candidate });
          console.log('Sent ICE candidate');
        }
      };

      socket.on('ice-candidate', async ({ candidate }: IceCandidateEvent) => {
        if (candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('Added received ICE candidate');
          } catch (err) {
            console.error('Error adding received ICE candidate:', err);
          }
        }
      });
    }

    const peerConnection = pcRef.current;

    if (role === 'caller') {
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });
        console.log('Added local tracks to peer connection');
      }

      const createAndSendOffer = async () => {
        try {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          socket.emit('offer', { offer });
          console.log('Offer created and sent');
        } catch (err) {
          console.error('Error creating/sending offer:', err);
        }
      };

      createAndSendOffer();

      const handleAnswer = async ({ answer }: AnswerEvent) => {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          console.log('Remote description set with answer');
        } catch (err) {
          console.error('Error setting remote description with answer:', err);
        }
      };

      socket.on('answer', handleAnswer);

      return () => {
        socket.off('answer', handleAnswer);
      };
    } else if (role === 'callee') {
      const handleOffer = async ({ offer }: OfferEvent) => {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          console.log('Remote description set with offer');

          if (localStream) {
            localStream.getTracks().forEach((track) => {
              peerConnection.addTrack(track, localStream);
            });
          } else {
            pendingOfferRef.current = offer;
            return;
          }

          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socket.emit('answer', { answer });
          console.log('Answer created and sent');
        } catch (err) {
          console.error('Error handling offer:', err);
        }
      };

      socket.on('offer', handleOffer);

      if (pendingOfferRef.current && localStream) {
        handleOffer({ offer: pendingOfferRef.current });
        pendingOfferRef.current = null;
      }

      return () => {
        socket.off('offer', handleOffer);
      };
    }
  }, [socket, opponentId, role, localStream]);

  // Handle pending offer for callee
  useEffect(() => {
    if (role !== 'callee' || !pendingOfferRef.current || !localStream || !pcRef.current) return;

    const peerConnection = pcRef.current;

    const handlePendingOffer = async () => {
      try {
        const offer = pendingOfferRef.current;
        if (offer)
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        localStream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStream);
        });

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer', { answer });
      } catch (err) {
        console.error('Error handling pending offer:', err);
      }
    };

    handlePendingOffer();
    pendingOfferRef.current = null;
  }, [localStream, role, socket, opponentId]);

  

  useEffect(() => {
    return () => {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, []);

  return (
    <ContextRTC.Provider value={{ localStream, remoteStream, socket, opponentId, status }}>
      {children}
    </ContextRTC.Provider>
  );
};

export default WebRTC;
