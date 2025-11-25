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

    // Get settings from the store
    const { webcamSettings, actions: { setWebcamSettings } } = useSettingsStore();
    const { selectedDeviceId, selectedAudioDeviceId, volume, isMuted } = webcamSettings;

    // WebRTC specific state
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
    
    const getDevices = async () => {
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
            if(videoDevices.length === 0) {
                setError("No webcam found. Please connect a camera and try again.");
            }
        } catch (err) {
            handleStreamError(err);
        } finally {
            setIsLoading(false);
        }
    };

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

    const connectWebRTC = () => { /* ... unchanged ... */ };
    const disconnectWebRTC = () => { /* ... unchanged ... */ };

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
    }, [isWebcamOn, selectedDeviceId, selectedAudioDeviceId, devices.length, webcamMode, isMuted]); // isMuted added to dependency array

    const renderBody = () => { /* ... unchanged ... */ };

    return (
        <div className="bg-surface rounded-lg shadow-lg p-4">
            {/* Header */}
            <div className="text-lg font-bold flex items-center justify-between pb-4 border-b border-secondary mb-4">
                {/* ... */}
            </div>

            {isWebcamOn && isElectron && (
                <div className="mb-4">
                    {/* ... radio buttons ... */}
                    {/* ... webrtc url input ... */}

                    {/* Audio Controls */}
                    <div className="flex items-center gap-2 mt-4">
                        <button
                            onClick={() => setWebcamSettings({ isMuted: !isMuted })}
                            title={isMuted ? "Unmute" : "Mute"}
                            className="p-1 rounded-md text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        >
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
