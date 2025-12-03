import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Dock } from "@mycnc/shared";

interface WebRTCStreamProps {
    volume: number;
    isMuted: boolean;
    isInPiP: boolean;
    onTogglePiP: () => void;
    onPiPChange: (isPiP: boolean) => void;
    videoRef: React.RefObject<HTMLVideoElement>;
}

const WebRTCStream: React.FC<WebRTCStreamProps> = ({
    volume,
    isMuted,
    isInPiP,
    onTogglePiP,
    onPiPChange,
    videoRef
}) => {
    const [webRTCUrl, setWebRTCUrl] = useState('ws://10.0.0.162:8888/webrtc');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const warmupStreamRef = useRef<MediaStream | null>(null);
    const iceCandidateQueueRef = useRef<RTCIceCandidate[]>([]);

    const disconnect = useCallback(() => {
        if (warmupStreamRef.current) {
            warmupStreamRef.current.getTracks().forEach(track => track.stop());
            warmupStreamRef.current = null;
        }
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsConnected(false);
    }, []);

    const connect = useCallback(async () => {
        if (isConnected) return;
        setIsLoading(true);
        setError(null);

        // Request permission/warm up media devices
        try {
            warmupStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (err) {
            console.warn("Permission/Device check failed:", err);
        }

        if (!videoRef.current) {
            if (warmupStreamRef.current) {
                warmupStreamRef.current.getTracks().forEach(track => track.stop());
                warmupStreamRef.current = null;
            }
            setIsLoading(false);
            return;
        }

        try {
            const peerConnection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
            const ws = new WebSocket(webRTCUrl);

            pcRef.current = peerConnection;
            wsRef.current = ws;

            peerConnection.ontrack = (event) => {
                if (videoRef.current) {
                    let stream = videoRef.current.srcObject as MediaStream | null;
                    if (!stream) {
                        stream = new MediaStream();
                        videoRef.current.srcObject = stream;
                    }
                    stream.addTrack(event.track);
                    if (videoRef.current.paused) {
                        videoRef.current.play().catch(e => console.error("Autoplay failed:", e));
                    }
                    videoRef.current.muted = isMuted;
                    videoRef.current.volume = volume;
                }
            };

            peerConnection.oniceconnectionstatechange = () => {
                if (peerConnection.iceConnectionState === 'connected') {
                    setIsLoading(false);
                    setIsConnected(true);
                    setError(null);
                    if (warmupStreamRef.current) {
                        warmupStreamRef.current.getTracks().forEach(track => track.stop());
                        warmupStreamRef.current = null;
                    }
                } else if (['failed', 'disconnected', 'closed'].includes(peerConnection.iceConnectionState)) {
                    setError('WebRTC connection failed.');
                    setIsLoading(false);
                    setIsConnected(false);
                    disconnect();
                }
            };

            ws.onmessage = async (event) => {
                if (typeof event.data === 'string') {
                    const message = JSON.parse(event.data);
                    if (message.type === 'offer') {
                        if (peerConnection.signalingState === 'closed') return;
                        await peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: message.sdp }));
                        const answer = await peerConnection.createAnswer();
                        await peerConnection.setLocalDescription(answer);
                        ws.send(JSON.stringify(peerConnection.localDescription));

                        while (iceCandidateQueueRef.current.length > 0) {
                            const candidate = iceCandidateQueueRef.current.shift();
                            if (candidate) await peerConnection.addIceCandidate(candidate);
                        }
                    } else if (message.type === 'iceCandidate') {
                        if (peerConnection.signalingState === 'closed') return;
                        if (!peerConnection.remoteDescription) {
                            iceCandidateQueueRef.current.push(new RTCIceCandidate(message.candidate));
                        } else {
                            await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
                        }
                    }
                }
            };

            peerConnection.addTransceiver('video', { direction: 'recvonly' });
            peerConnection.addTransceiver('audio', { direction: 'recvonly' });

            ws.onerror = () => {
                setError('WebSocket connection error.');
                setIsLoading(false);
                setIsConnected(false);
                disconnect();
            };

            ws.onclose = () => {
                if (isConnected) disconnect();
            };

        } catch (e) {
            console.error("Failed to connect:", e);
            setError('Failed to initiate connection.');
            setIsLoading(false);
            setIsConnected(false);
            disconnect();
        }
    }, [isConnected, webRTCUrl, isMuted, volume, disconnect, videoRef]);

    // Update volume/mute when props change
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
            videoRef.current.muted = isMuted;
        }
    }, [volume, isMuted, videoRef]);

    // Cleanup on unmount
    useEffect(() => {
        return () => disconnect();
    }, [disconnect]);

    // Handle PiP events
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const handleEnterPiP = () => onPiPChange(true);
        const handleLeavePiP = () => onPiPChange(false);

        videoElement.addEventListener('enterpictureinpicture', handleEnterPiP);
        videoElement.addEventListener('leavepictureinpicture', handleLeavePiP);

        return () => {
            videoElement.removeEventListener('enterpictureinpicture', handleEnterPiP);
            videoElement.removeEventListener('leavepictureinpicture', handleLeavePiP);
        };
    }, [videoRef, onPiPChange]);

    if (isInPiP) {
        return (
            <div className="relative aspect-video bg-background rounded-md">
                <button
                    onClick={onTogglePiP}
                    title="Dock to Panel"
                    className="absolute top-2 right-2 flex items-center gap-2 p-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <Dock className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className='flex items-center gap-2'>
                <input
                    type="text"
                    value={webRTCUrl}
                    onChange={(e) => setWebRTCUrl(e.target.value)}
                    placeholder="e.g., ws://localhost:8080"
                    className="w-full p-2 bg-background border border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isConnected}
                />
                <button
                    onClick={isConnected ? disconnect : connect}
                    className={`px-3 py-1 ${isConnected ? 'bg-accent-red hover:bg-red-700' : 'bg-secondary hover:bg-secondary-focus'} text-white font-semibold rounded-md`}
                >
                    {isConnected ? 'Disconnect' : 'Connect'}
                </button>
            </div>

            <div className="aspect-video bg-background rounded-md overflow-hidden flex items-center justify-center relative">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-75 z-10">
                        <div className="text-center text-text-secondary p-4">
                            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                            <p className="text-sm font-semibold">Connecting to WebRTC...</p>
                        </div>
                    </div>
                )}
                {error && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-75 z-10">
                        <div className="text-center text-accent-yellow p-4 max-w-xs">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm font-semibold">{error}</p>
                            <button onClick={connect} className="mt-4 px-3 py-1 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus text-sm">
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WebRTCStream;
