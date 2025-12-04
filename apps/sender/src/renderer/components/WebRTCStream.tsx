import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Dock, Maximize, Minimize } from "@mycnc/shared";
import { useSettingsStore } from '@/stores/settingsStore';

interface WebRTCStreamProps {
    volume: number;
    isMuted: boolean;
    isInPiP: boolean;
    onTogglePiP: () => void;
    onPiPChange: (isPiP: boolean) => void;
    videoRef: React.RefObject<HTMLVideoElement>;
    isPoppedOut?: boolean;
    url?: string;
    autoConnect?: boolean;
    onConnectionChange?: (isConnected: boolean) => void;
}

const WebRTCStream: React.FC<WebRTCStreamProps> = ({
    volume,
    isMuted,
    isInPiP,
    onTogglePiP,
    onPiPChange,
    videoRef,
    isPoppedOut = false,
    url,
    autoConnect = false,
    onConnectionChange
}) => {
    const { webcamSettings, actions: { setWebcamSettings } } = useSettingsStore();

    // Use URL from props (for popout) or settings (for main window), defaulting to settings if prop is missing
    const effectiveUrl = url || webcamSettings.webRTCUrl || 'ws://10.0.0.162:8888/webrtc';

    const [webRTCUrl, setWebRTCUrl] = useState(effectiveUrl);

    // Sync local state with settings if not popped out (popout uses url prop)
    useEffect(() => {
        if (!isPoppedOut && webcamSettings.webRTCUrl && webcamSettings.webRTCUrl !== webRTCUrl) {
            setWebRTCUrl(webcamSettings.webRTCUrl);
        }
    }, [webcamSettings.webRTCUrl, isPoppedOut]);

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value;
        setWebRTCUrl(newUrl);
        if (!isPoppedOut) {
            setWebcamSettings({ webRTCUrl: newUrl });
        }
    };
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

    // Auto-connect if requested
    useEffect(() => {
        if (autoConnect && !isConnected) {
            connect();
        }
    }, [autoConnect, isConnected, connect]);

    // Notify parent of connection change
    useEffect(() => {
        onConnectionChange?.(isConnected);
    }, [isConnected, onConnectionChange]);

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

    return (
        <div className="flex flex-col gap-4">
            <div className='flex items-center gap-2'>
                <input
                    type="text"
                    value={webRTCUrl}
                    onChange={handleUrlChange}
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


            <div className="aspect-video bg-background rounded-md overflow-hidden flex items-center justify-center relative group">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={isInPiP ? "w-px h-px opacity-0 absolute pointer-events-none" : "w-full h-full object-contain"}
                />

                {/* Controls Overlay */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {!isPoppedOut && (
                        <button
                            onClick={onTogglePiP}
                            className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-md backdrop-blur-sm transition-colors"
                            title={isInPiP ? "Exit Picture-in-Picture" : "Picture-in-Picture"}
                        >
                            {isInPiP ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                        </button>
                    )}
                </div>

                {/* Show overlay when in PiP mode */}
                {isInPiP && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background z-20">
                        <div className="text-center text-text-secondary p-4">
                            <Dock className="w-12 h-12 mx-auto mb-3 opacity-75" />
                            <p className="text-sm font-semibold mb-2">Video is in Picture-in-Picture mode</p>
                            <button
                                onClick={onTogglePiP}
                                className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                Exit Picture-in-Picture
                            </button>
                        </div>
                    </div>
                )}

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
