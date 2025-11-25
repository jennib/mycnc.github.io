import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, CameraOff, AlertTriangle, PictureInPicture, Dock, RefreshCw, Volume2, VolumeX } from './Icons';
import { useSettingsStore } from '@/stores/settingsStore';

const isElectron = !!window.electronAPI?.isElectron;

const WebcamPanel: React.FC = () => {
    const [isWebcamOn, setIsWebcamOn] = useState(false);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
    const [isInPiP, setIsInPiP] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const iceCandidateQueueRef = useRef<RTCIceCandidate[]>([]);
    const pcRef = useRef<RTCPeerConnection | null>(null); // Ref to store RTCPeerConnection
    const wsRef = useRef<WebSocket | null>(null); // Ref to store WebSocket

    const { webcamSettings, actions: { setWebcamSettings } } = useSettingsStore();
    const { selectedDeviceId, selectedAudioDeviceId, volume, isMuted } = webcamSettings;

    const [webRTCUrl, setWebRTCUrl] = useState('ws://10.0.0.162:8888/webrtc');
    const [isWebRTCConnected, setIsWebRTCConnected] = useState(false);
    const [webcamMode, setWebcamMode] = useState<'local' | 'webrtc'>('local');

    const isPiPSupported = 'pictureInPictureEnabled' in document;

    const disconnectWebRTC = useCallback(() => {
        console.log("disconnectWebRTC called. pcRef:", pcRef.current, "wsRef:", wsRef.current);
        if (pcRef.current) {
            console.log("Attempting to close peer connection:", pcRef.current);
            pcRef.current.close();
            pcRef.current = null;
        }
        if (wsRef.current) {
            console.log("Attempting to close WebSocket:", wsRef.current);
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsWebRTCConnected(false);
    }, []);

    const handleToggleWebcam = useCallback(() => {
        setIsWebcamOn(prev => !prev);
    }, []);

    const handleTogglePiP = useCallback(async () => {
        if (videoRef.current) {
            try {
                if (!document.pictureInPictureElement) {
                    // Clear the video element's source object before entering PiP
                    // This ensures the main video element is blank while in PiP
                    // and allows a clean re-initialization upon exiting PiP.
                    videoRef.current.srcObject = null;

                    // If in WebRTC mode, proactively disconnect to allow clean re-connection later
                    if (webcamMode === 'webrtc' && isWebRTCConnected) {
                        disconnectWebRTC();
                    }

                    await videoRef.current.requestPictureInPicture();
                    setIsInPiP(true);
                } else {
                    await document.exitPictureInPicture();
                    setIsInPiP(false);
                }
            } catch (error) {
                console.error("PiP action failed:", error);
                // Even if request/exit fails, try to update state as it might be out of sync
                setIsInPiP(!!document.pictureInPictureElement);
            }
        }
    }, [isWebRTCConnected, webcamMode, disconnectWebRTC]);


    const connectWebRTC = useCallback(() => {
        if (!isElectron || isWebRTCConnected) return; // Prevent multiple connections
        setIsLoading(true);
        setError(null);
        console.log("Attempting WebRTC connection...");

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
                }
            };

            peerConnection.oniceconnectionstatechange = () => {
                console.log("ICE Connection State:", peerConnection.iceConnectionState);
                if (peerConnection.iceConnectionState === 'connected') {
                    setIsLoading(false);
                    setIsWebRTCConnected(true);
                    setError(null);
                } else if (['failed', 'disconnected', 'closed'].includes(peerConnection.iceConnectionState)) {
                    setError('WebRTC connection failed, disconnected, or closed.');
                    setIsLoading(false);
                    setIsWebRTCConnected(false);
                    disconnectWebRTC(); // Clean up on failure/disconnection
                }
            };

            ws.onopen = async () => {
                // Not creating offer here, waiting for server to send one
            };
            ws.onmessage = async (event) => {
                if (typeof event.data === 'string') {
                    const message = JSON.parse(event.data);
                    if (message.type === 'offer') {
                        if (peerConnection.signalingState === 'closed') {
                            console.warn('Peer connection is closed, cannot set remote description for offer.');
                            return;
                        }
                        await peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: message.sdp }));
                        const answer = await peerConnection.createAnswer();
                        await peerConnection.setLocalDescription(answer);
                        ws.send(JSON.stringify(peerConnection.localDescription));

                        while (iceCandidateQueueRef.current.length > 0) {
                            const candidate = iceCandidateQueueRef.current.shift();
                            if (candidate) {
                                await peerConnection.addIceCandidate(candidate);
                            }
                        }

                    } else if (message.type === 'iceCandidate') {
                        if (peerConnection.signalingState === 'closed') {
                            console.warn('Peer connection is closed, cannot add ICE candidate.');
                            return;
                        }
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
            ws.onerror = (err) => {
                console.error("WebSocket error:", err);
                setError('WebSocket connection error. Check the server URL and make sure the server is running.');
                setIsLoading(false);
                setIsWebRTCConnected(false);
                disconnectWebRTC(); // Ensure full cleanup
            };
            ws.onclose = () => {
                console.log("WebSocket closed.");
                if (isWebRTCConnected) { // Only trigger disconnect if it was actually connected
                    disconnectWebRTC();
                }
            };

        } catch (e) {
            console.error("Failed to initiate WebRTC connection:", e);
            setError('Failed to initiate WebRTC connection.');
            setIsLoading(false);
            setIsWebRTCConnected(false);
            disconnectWebRTC(); // Clean up if initial setup fails
        }
    }, [isElectron, isWebRTCConnected, setIsLoading, setError, webRTCUrl, isMuted, disconnectWebRTC, isWebcamOn]);

    const getDevices = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        console.log("getDevices: Starting device enumeration...");
        try {
            const mediaDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = mediaDevices.filter(device => device.kind === 'videoinput');
            const audioInputDevices = mediaDevices.filter(device => device.kind === 'audioinput');
            setDevices(videoDevices);
            setAudioInputDevices(audioInputDevices);
            console.log("getDevices: Found video devices:", videoDevices);
            console.log("getDevices: Found audio input devices:", audioInputDevices);

            let selectedVideoDeviceId = selectedDeviceId;
            if (!selectedVideoDeviceId || !videoDevices.some(d => d.deviceId === selectedVideoDeviceId)) {
                selectedVideoDeviceId = videoDevices[0]?.deviceId || '';
                setWebcamSettings({ selectedDeviceId: selectedVideoDeviceId });
                console.log("getDevices: No saved video device or not found, selecting first available:", selectedVideoDeviceId);
            } else {
                console.log("getDevices: Using saved video device:", selectedVideoDeviceId);
            }

            let selectedAudioInputDeviceId = selectedAudioDeviceId;
            if (!selectedAudioInputDeviceId || !audioInputDevices.some(d => d.deviceId === selectedAudioInputDeviceId)) {
                selectedAudioInputDeviceId = audioInputDevices[0]?.deviceId || '';
                setWebcamSettings({ selectedAudioDeviceId: selectedAudioInputDeviceId });
                console.log("getDevices: No saved audio device or not found, selecting first available:", selectedAudioInputDeviceId);
            } else {
                console.log("getDevices: Using saved audio device:", selectedAudioInputDeviceId);
            }

            if (selectedVideoDeviceId) {
                // Stop any existing stream first to avoid conflicts
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                    if (videoRef.current) videoRef.current.srcObject = null;
                    console.log("getDevices: Stopped existing stream.");
                }

                console.log("getDevices: Attempting getUserMedia with videoDeviceId:", selectedVideoDeviceId, "audioDeviceId:", selectedAudioInputDeviceId);
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: selectedVideoDeviceId ? { exact: selectedVideoDeviceId } : undefined },
                    audio: { deviceId: selectedAudioInputDeviceId ? { exact: selectedAudioInputDeviceId } : undefined }
                });
                console.log("getDevices: getUserMedia successful, stream:", stream);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.muted = isMuted; // Apply mute setting
                    videoRef.current.volume = isMuted ? 0 : volume; // Apply volume setting
                    await videoRef.current.play(); // Explicitly play to ensure metadata loads and video starts
                    console.log("getDevices: Video element srcObject set and play attempted.");
                }
                streamRef.current = stream;
                setError(null);
            } else {
                setError('No camera found.');
                console.log("getDevices: No selected video device, cannot start stream.");
            }
        } catch (err) {
            console.error("getDevices: Error accessing media devices:", err);
            setError(`Failed to access camera: ${err instanceof Error ? err.message : String(err)}`);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        } finally {
            setIsLoading(false);
            console.log("getDevices: Finished device enumeration and stream attempt.");
        }
    }, [selectedDeviceId, selectedAudioDeviceId, setWebcamSettings, isMuted, volume, videoRef]);

    // --- End of reordered useCallback definitions ---

    const handleLeavePiP = useCallback(() => {
        console.log("handleLeavePiP: PiP window closed. isWebcamOn:", isWebcamOn, "webcamMode:", webcamMode);
        setIsInPiP(false);
        // Force re-initialization of the stream in the main component
        if (isWebcamOn) {
            if (webcamMode === 'local') {
                console.log("handleLeavePiP: Re-initializing local webcam.");
                getDevices(); // Call getDevices to restart local stream
            } else if (webcamMode === 'webrtc') {
                console.log("handleLeavePiP: Re-initializing WebRTC stream.");
                connectWebRTC(); // Call connectWebRTC to restart WebRTC stream
            }
        }
    }, [isWebcamOn, webcamMode, getDevices, connectWebRTC]);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement) {
            videoElement.addEventListener('leavepictureinpicture', handleLeavePiP);
            return () => {
                videoElement.removeEventListener('leavepictureinpicture', handleLeavePiP);
            };
        }
    }, [handleLeavePiP]);

    // New useEffect to manage webcam stream lifecycle
    useEffect(() => {
        if (isWebcamOn) {
            if (webcamMode === 'local') {
                console.log("Stream Effect: Starting local webcam via getDevices().");
                getDevices();
            } else if (webcamMode === 'webrtc') {
                console.log("Stream Effect: Starting WebRTC connection.");
                connectWebRTC();
            }
        } else {
            console.log("Stream Effect: isWebcamOn is false, stopping all streams.");
            // Stop local stream if active
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
                if (videoRef.current) videoRef.current.srcObject = null;
            }
            // Disconnect WebRTC if active
            if (isWebRTCConnected) {
                disconnectWebRTC();
            }
            setError(null); // Clear any errors
        }

        // Cleanup function for the effect
        return () => {
            console.log("Stream Effect Cleanup: Stopping all streams.");
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
                if (videoRef.current) videoRef.current.srcObject = null;
            }
            if (isWebRTCConnected) {
                disconnectWebRTC();
            }
        };
    }, [isWebcamOn, webcamMode, getDevices, connectWebRTC, disconnectWebRTC, isWebRTCConnected, streamRef, videoRef]);

    const renderBody = () => {
        if (!isWebcamOn) return null;
        if (isInPiP) {
            return (
                <div className="relative aspect-video bg-background rounded-md">
                    <button
                        onClick={handleTogglePiP}
                        title="Dock to Panel"
                        className="absolute top-2 right-2 flex items-center gap-2 p-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <Dock className="w-5 h-5" />
                    </button>
                </div>
            );
        }
        return (
            <div className="aspect-video bg-background rounded-md overflow-hidden flex items-center justify-center relative">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full" />
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-75 z-10">
                        <div className="text-center text-text-secondary p-4">
                            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                            <p className="text-sm font-semibold">{webcamMode === 'webrtc' ? 'Connecting to WebRTC...' : 'Searching for cameras...'}</p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-75 z-10">
                        <div className="text-center text-accent-yellow p-4">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm font-semibold">{error}</p>
                            <button onClick={webcamMode === 'webrtc' ? connectWebRTC : getDevices} className="mt-4 px-3 py-1 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus text-sm">
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-surface rounded-lg shadow-lg p-4">
            <div className="text-lg font-bold flex items-center justify-between pb-4 border-b border-secondary mb-4">
                <div className="flex items-center gap-2">
                    {isWebcamOn ? <Camera className="w-5 h-5 text-primary" /> : <CameraOff className="w-5 h-5 text-text-secondary" />}
                    Webcam
                </div>
                <div className="flex items-center gap-2">
                    {(isWebcamOn && isPiPSupported && !isInPiP) && (
                        <button onClick={handleTogglePiP} title="Picture-in-Picture" className="p-1 rounded-md text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                            <PictureInPicture className="w-5 h-5" />
                        </button>
                    )}
                    <button onClick={handleToggleWebcam} className={`flex items-center gap-2 px-3 py-1 ${isWebcamOn ? 'bg-accent-red hover:bg-red-700' : 'bg-secondary hover:bg-secondary-focus'} text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm`}>
                        {isWebcamOn ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                        {isWebcamOn ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>

            {isWebcamOn && isElectron && (
                <div className="mb-4">
                     <div className="flex items-center gap-4 mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="webcamMode" value="local" checked={webcamMode === 'local'} onChange={() => setWebcamMode('local')} className="form-radio text-primary focus:ring-primary"/>
                            <span className="text-sm font-medium text-text-secondary">Local Camera</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="webcamMode" value="webrtc" checked={webcamMode === 'webrtc'} onChange={() => setWebcamMode('webrtc')} className="form-radio text-primary focus:ring-primary"/>
                            <span className="text-sm font-medium text-text-secondary">WebRTC Stream</span>
                        </label>
                    </div>

                    {webcamMode === 'webrtc' && (
                        <div className='flex items-center gap-2'>
                             <input type="text" value={webRTCUrl} onChange={(e) => setWebRTCUrl(e.target.value)} placeholder="e.g., ws://localhost:8080" className="w-full p-2 bg-background border border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary" disabled={isWebRTCConnected} />
                            <button onClick={isWebRTCConnected ? disconnectWebRTC : connectWebRTC}  className={`px-3 py-1 ${isWebRTCConnected ? 'bg-accent-red hover:bg-red-700' : 'bg-secondary hover:bg-secondary-focus'} text-white font-semibold rounded-md`}>
                                {isWebRTCConnected ? 'Disconnect' : 'Connect'}
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                        <button onClick={() => setWebcamSettings({ isMuted: !isMuted })} title={isMuted ? "Unmute" : "Mute"} className="p-1 rounded-md text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => {
                                const newVolume = parseFloat(e.target.value);
                                setWebcamSettings({ volume: newVolume });
                                if (newVolume > 0) setWebcamSettings({ isMuted: false });
                            }}
                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            disabled={isMuted}
                        />
                    </div>
                </div>
            )}

            {isWebcamOn && webcamMode === 'local' && (devices.length > 1 || audioInputDevices.length > 1) && (
                <div className="flex gap-2 mb-4">
                    {devices.length > 1 && (
                        <div className="w-1/2">
                            <label htmlFor="camera-select" className="block text-xs font-medium text-text-secondary mb-1">Select Camera</label>
                            <select
                                id="camera-select"
                                value={selectedDeviceId}
                                onChange={(e) => setWebcamSettings({ selectedDeviceId: e.target.value })}
                                className="w-full p-1 bg-background border border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                {devices.map(device => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Camera ${devices.indexOf(device) + 1}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {audioInputDevices.length > 1 && (
                        <div className="w-1/2">
                            <label htmlFor="audio-input-select" className="block text-xs font-medium text-text-secondary mb-1">Select Microphone</label>
                            <select
                                id="audio-input-select"
                                value={selectedAudioDeviceId}
                                onChange={(e) => setWebcamSettings({ selectedAudioDeviceId: e.target.value })}
                                className="w-full p-1 bg-background border border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                {audioInputDevices.map(device => (
                                    <option key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Microphone ${audioInputDevices.indexOf(device) + 1}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}
            {renderBody()}
        </div>
    );
};

export default WebcamPanel;
