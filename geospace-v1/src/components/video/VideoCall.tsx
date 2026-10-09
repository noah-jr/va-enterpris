"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useVideoCallSocket, useSocket } from '@/hooks/use-socket';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoCallProps {
    roomId: string; // usually tripId or emergencyId
    onClose: () => void;
    className?: string;
}

const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

export const VideoCall: React.FC<VideoCallProps> = ({ roomId, onClose, className }) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
    const [mediaError, setMediaError] = useState<string | null>(null);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    const { socket } = useSocket();
    const { sendOffer, sendAnswer, sendIceCandidate, endCall } = useVideoCallSocket(roomId, {}); // Pass empty object to avoid re-subscription loop

    // Initialize Local Media
    useEffect(() => {
        const startLocalStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (err: any) {
                console.error("Error accessing media devices:", err);
                if (err.name === 'NotFoundError') {
                    setMediaError("Nenhuma câmera ou microfone detectado. Verifique o hardware.");
                } else if (err.name === 'NotAllowedError') {
                    setMediaError("Permissão de acesso à câmera/microfone negada.");
                } else {
                    setMediaError("Erro ao acessar dispositivos de mídia.");
                }
            }
        };

        startLocalStream();

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
    }, []);

    // Initialize WebRTC Peer Connection
    const createPeerConnection = useCallback(() => {
        if (peerConnectionRef.current) return peerConnectionRef.current;

        const pc = new RTCPeerConnection(RTC_CONFIG);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendIceCandidate(event.candidate);
            }
        };

        pc.ontrack = (event) => {
            console.log("Received remote track");
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        pc.onconnectionstatechange = () => {
            console.log("Connection state:", pc.connectionState);
            if (pc.connectionState === 'connected') {
                setConnectionStatus('connected');
            } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                setConnectionStatus('disconnected');
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    }, [sendIceCandidate]);

    // Attach remote stream to video element when it changes
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);


    // Socket Event Listeners
    useEffect(() => {
        if (!socket) return;

        const handleUserJoined = async () => {
            console.log("User joined, creating offer");
            const pc = createPeerConnection();

            const stream = localStreamRef.current;
            if (stream) {
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
            }

            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                sendOffer(offer);
            } catch (err) {
                console.error("Error creating offer:", err);
            }
        };

        const handleOffer = async (data: { offer: RTCSessionDescriptionInit }) => {
            console.log("Received offer");
            const pc = createPeerConnection();

            const stream = localStreamRef.current;
            if (stream) {
                stream.getTracks().forEach(track => {
                    // Check specific track addition logic if needed
                    if (!pc.getSenders().find(s => s.track && s.track.kind === track.kind)) {
                        pc.addTrack(track, stream);
                    }
                });
            }

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                sendAnswer(answer);
            } catch (err) {
                console.error("Error handling offer:", err);
            }
        };

        const handleAnswer = async (data: { answer: RTCSessionDescriptionInit }) => {
            console.log("Received answer");
            const pc = peerConnectionRef.current;
            if (pc) {
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                } catch (err) {
                    console.error("Error setting remote description:", err);
                }
            }
        };

        const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
            const pc = peerConnectionRef.current;
            if (pc) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (err) {
                    console.error("Error adding ice candidate:", err);
                }
            }
        };

        const handleCallEnded = () => {
            handleEndCall();
        };

        // Attach listeners directly to socket instance to bypass hook circular dependency
        // Assuming socketService emits events with these names locally as per my previous edit
        // Note: socket.on in `useSocket` returns the socket instance from client, 
        // but `SocketService` wraps it. `useSocket` returns `socket` which is the `Socket` instance 
        // IF `socketService.getSocket()` is called. 
        // My `useSocket` hook returns `socket: socketService.getSocket()`.
        // My `SocketService.on` attaches to `this.socket.on` AND internal listeners.
        // Wait, `SocketService.on` attaches to `this.socket.on`.
        // The events I added to `SocketService` were: `this.socket.on('video:offer', ... this.emitLocalEvent('video:offer' ...))`
        // So I should listen to the LOCAL event names if I use `socketService.on`.
        // But `useSocket` exposes `socket` which is the raw socket io instance.
        // If I use `socket.on`, I am listening to raw socket events. 
        // BUT my `SocketService` forwards them to local events with SAME names.
        // So using `socket.on` (raw) works if the backend emits them.

        socket.on('video:user-joined', handleUserJoined);
        socket.on('video:offer', handleOffer);
        socket.on('video:answer', handleAnswer);
        socket.on('video:ice-candidate', handleIceCandidate);
        socket.on('video:call-ended', handleCallEnded);

        return () => {
            socket.off('video:user-joined', handleUserJoined);
            socket.off('video:offer', handleOffer);
            socket.off('video:answer', handleAnswer);
            socket.off('video:ice-candidate', handleIceCandidate);
            socket.off('video:call-ended', handleCallEnded);
        };
    }, [socket, createPeerConnection, sendOffer, sendAnswer]);

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    const handleEndCall = () => {
        endCall();
        onClose();
    };

    return (
        <div className={cn("relative bg-zinc-900 overflow-hidden rounded-lg shadow-2xl border-2 border-slate-700/50 flex flex-col", className)}>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse",
                        connectionStatus === 'connected' ? 'bg-green-500' :
                            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500')} />
                    <span className="text-xs font-bold font-mono text-white/80 uppercase tracking-widest">
                        {connectionStatus === 'connected' ? 'LINK_ESTABLISHED' : 'CONNECTING...'}
                    </span>
                </div>
                <div className="text-xs font-mono text-white/50">{roomId.split('-')[0]}</div>
            </div>

            {/* Remote Video (Main) */}
            <div className="flex-1 relative bg-black flex items-center justify-center">
                {/* Ensure video element is always present to attach stream to */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className={cn("w-full h-full object-cover", !remoteStream && "hidden")}
                />
                {!remoteStream && (
                    <div className="flex flex-col items-center gap-4 opacity-50 absolute">
                        <div className="w-16 h-16 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        <span className="text-xs font-mono text-white uppercase tracking-widest">Aguardando Feed...</span>
                    </div>
                )}
            </div>

            {/* Media Error Overlay */}
            {mediaError && (
                <div className="absolute inset-x-0 bottom-24 z-30 px-6">
                    <div className="bg-red-500/90 backdrop-blur-md p-4 rounded-lg border border-red-400/50 flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <VideoOff className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-white uppercase tracking-wider mb-0.5">Falha de Periférico</p>
                            <p className="text-[11px] text-white/90 font-medium">{mediaError}</p>
                        </div>
                        <button
                            onClick={() => setMediaError(null)}
                            className="text-[10px] font-black text-white/50 hover:text-white uppercase transition-colors"
                        >
                            IGNORAR
                        </button>
                    </div>
                </div>
            )}

            {/* Local Video (PiP) */}
            <div className="absolute top-16 right-4 w-32 h-48 bg-zinc-800 rounded-md overflow-hidden border border-white/10 shadow-lg z-10 transition-transform hover:scale-105">
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn("w-full h-full object-cover", isVideoOff && "hidden")}
                />
                <div className={cn("absolute inset-0 flex items-center justify-center bg-zinc-800", !isVideoOff && "hidden")}>
                    <VideoOff className="w-8 h-8 text-white/20" />
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20 px-6 py-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                <button
                    onClick={toggleMute}
                    className={cn("p-3 rounded-full transition-all hover:scale-110", isMuted ? "bg-red-500/20 text-red-500" : "bg-white/10 text-white hover:bg-white/20")}
                >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                    onClick={handleEndCall}
                    className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20 transition-all hover:scale-110"
                >
                    <PhoneOff className="w-6 h-6" />
                </button>

                <button
                    onClick={toggleVideo}
                    className={cn("p-3 rounded-full transition-all hover:scale-110", isVideoOff ? "bg-red-500/20 text-red-500" : "bg-white/10 text-white hover:bg-white/20")}
                >
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
};
