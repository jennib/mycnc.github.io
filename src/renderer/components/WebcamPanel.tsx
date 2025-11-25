import React, { useState, useRef, useEffect } from 'react';
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
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    const { webcamSettings, actions: { setWebcamSettings } } = useSettingsStore();
    const { selectedDeviceId, selectedAudioDeviceId, volume, isMuted } = webcamSettings;

    const [webRTCUrl, setWebRTCUrl] = useState('ws://10.0.0.162:8888/webrtc');
    const [isWebRTCConnected, setIsWebRTCConnected] = useState(false);
    const [webcamMode, setWebcamMode] = useState<'local' | 'webrtc'>('local');

    const isPiPSupported = 'pictureInPictureEnabled' in document;

    const handleTogglePiP = async () => {
        if (!videoRef.current || !isPiPSupported) return;
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (videoRef.current.srcObject) {
                await videoRef.current.requestPictureInPicture();
            }
        } catch (pipError) {
            console.error("PiP Error:", pipError);
            setError("Could not enter Picture-in-Picture mode.");
        }
    };
    
    const getDevices = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            tempStream.getTracks().forEach(track => track.stop());

            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
            const audioInputDevices = allDevices.filter(device => device.kind === 'audioinput');
            
            setDevices(videoDevices);
            setAudioInputDevices(audioInputDevices);

            if (videoDevices.length > 0 && !selectedDeviceId) {
                setWebcamSettings({ selectedDeviceId: videoDevices[0].deviceId });
            }
            if (audioInputDevices.length > 0 && !selectedAudioDeviceId) {
                setWebcamSettings({ selectedAudioDeviceId: audioInputDevices[0].deviceId });
            }
            if (videoDevices.length === 0) {
                setError("No webcam found. Please connect a camera and try again.");
            }
        } catch (err) {
            handleStreamError(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedDeviceId, selectedAudioDeviceId, setWebcamSettings]);

    const handleToggleWebcam = () => {
        if (isWebcamOn && document.pictureInPictureElement) {
            document.exitPictureInPicture();
        }
        setIsWebcamOn(prev => !prev);
    };

    const stopWebcam = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const handleStreamError = (err: any) => {
        console.error("Webcam Error:", err);
        if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
            setError("Webcam access denied. Please allow camera permissions in your OS settings.");
        } else if (err instanceof Error && (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError')) {
            setError("No webcam found. Please connect a camera and try again.");
        } else {
            setError("Could not access webcam. The device may be in use by another application.");
        }
        setIsWebcamOn(false);
    };

    const connectWebRTC = () => {
        if (!isElectron) return;
        setIsLoading(true);
        setError(null);
        const peerConnection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        peerConnectionRef.current = peerConnection;
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
            if (peerConnection.iceConnectionState === 'connected') {
                setIsWebRTCConnected(true);
                setIsLoading(false);
            } else if (peerConnection.iceConnectionState === 'failed') {
                setError('WebRTC connection failed.');
                setIsLoading(false);
                setIsWebRTCConnected(false);
            }
        };
        const ws = new WebSocket(webRTCUrl);
        ws.onopen = async () => {};
        ws.onmessage = async (event) => {
            if (typeof event.data === 'string') {
                const message = JSON.parse(event.data);
                if (message.type === 'offer') {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: message.sdp }));
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    ws.send(JSON.stringify(peerConnection.localDescription));
                } else if (message.type === 'iceCandidate') {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
                }
            }
        };
        peerConnection.addTransceiver('video', { direction: 'recvonly' });
        peerConnection.addTransceiver('audio', { direction: 'recvonly' });
        ws.onerror = (err) => {
            setError('WebSocket connection error. Check the server URL and make sure the server is running.');
            setIsLoading(false);
        };
    };

    const disconnectWebRTC = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsWebRTCConnected(false);
    };

    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;
        const onEnterPiP = () => setIsInPiP(true);
        const onLeavePiP = () => setIsInPiP(false);
        videoElement.addEventListener('enterpictureinpicture', onEnterPiP);
        videoElement.addEventListener('leavepictureinpicture', onLeavePiP);
        return () => {
            videoElement.removeEventListener('enterpictureinpicture', onEnterPiP);
            videoElement.removeEventListener('leavepictureinpicture', onLeavePiP);
        };
    }, []);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
            videoRef.current.volume = volume;
        }
    }, [isMuted, volume]);

    useEffect(() => {
        const startLocalWebcam = async () => {
            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined },
                    audio: { deviceId: selectedAudioDeviceId ? { exact: selectedAudioDeviceId } : undefined }
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.muted = isMuted;
                }
                setError(null);
            } catch (err) {
                handleStreamError(err);
            }
        };

        if (isWebcamOn) {
            if (webcamMode === 'local') {
                disconnectWebRTC();
                if (devices.length === 0) {
                    if (!isLoading && !error) {
                        getDevices();
                    }
                } else if (selectedDeviceId) {
                    startLocalWebcam();
                }
            } else if (webcamMode === 'webrtc') {
                stopWebcam();
            }
        } else {
            stopWebcam();
            disconnectWebRTC();
            setDevices([]);
        }

        return () => {
            stopWebcam();
            disconnectWebRTC();
        };
    }, [isWebcamOn, selectedDeviceId, selectedAudioDeviceId, devices.length, webcamMode, isMuted, getDevices, isLoading, error]);

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
