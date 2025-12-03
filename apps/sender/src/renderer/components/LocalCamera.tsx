import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, RefreshCw, Dock } from "@mycnc/shared";
import { useSettingsStore } from '@/stores/settingsStore';

interface LocalCameraProps {
    volume: number;
    isMuted: boolean;
    isInPiP: boolean;
    onTogglePiP: () => void;
    onPiPChange: (isPiP: boolean) => void;
    videoRef: React.RefObject<HTMLVideoElement>;
}

const isElectron = !!window.electronAPI?.isElectron;

const LocalCamera: React.FC<LocalCameraProps> = ({
    volume,
    isMuted,
    isInPiP,
    onTogglePiP,
    onPiPChange,
    videoRef
}) => {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const { webcamSettings, actions: { setWebcamSettings } } = useSettingsStore();
    const { selectedDeviceId, selectedAudioDeviceId } = webcamSettings;

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, [videoRef]);

    const getDevices = useCallback(async () => {
        // if (!isElectron) return; // Allow in browser
        setIsLoading(true);
        setError(null);
        try {
            // Request permission first
            const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            tempStream.getTracks().forEach(track => track.stop());

            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
            const audioDevices = allDevices.filter(device => device.kind === 'audioinput');

            setDevices(videoDevices);
            setAudioInputDevices(audioDevices);

            if (videoDevices.length > 0 && !selectedDeviceId) {
                setWebcamSettings({ selectedDeviceId: videoDevices[0].deviceId });
            }
            if (audioDevices.length > 0 && !selectedAudioDeviceId) {
                setWebcamSettings({ selectedAudioDeviceId: audioDevices[0].deviceId });
            }
            if (videoDevices.length === 0) {
                setError("No camera found.");
            }
        } catch (err) {
            console.error("Error enumerating devices:", err);
            setError("Could not access camera. Check permissions.");
        } finally {
            setIsLoading(false);
        }
    }, [isElectron, selectedDeviceId, selectedAudioDeviceId, setWebcamSettings]);

    const startStream = useCallback(async () => {
        if (!selectedDeviceId) return; // Removed !isElectron check
        stopStream();

        try {
            const constraints = {
                video: { deviceId: { exact: selectedDeviceId } },
                audio: selectedAudioDeviceId ? { deviceId: { exact: selectedAudioDeviceId } } : false
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(e => console.error("Autoplay failed:", e));
                videoRef.current.volume = volume;
                videoRef.current.muted = isMuted;
            }
        } catch (err) {
            console.error('Error starting local stream:', err);
            setError('Failed to start camera.');
        }
    }, [selectedDeviceId, selectedAudioDeviceId, isElectron, stopStream, videoRef, volume, isMuted]);

    // Initial load
    useEffect(() => {
        if (devices.length === 0) {
            getDevices();
        }
    }, [getDevices, devices.length]);

    // Start stream when device changes
    useEffect(() => {
        if (devices.length > 0) {
            startStream();
        }
        return () => stopStream();
    }, [startStream, stopStream, devices.length]);

    // Update volume
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
            videoRef.current.muted = isMuted;
        }
    }, [volume, isMuted, videoRef]);

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
            <div className="flex gap-2">
                {devices.length > 0 && (
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
                {audioInputDevices.length > 0 && (
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

            <div className="aspect-video bg-background rounded-md overflow-hidden flex items-center justify-center relative">
                {/* Video element is always rendered here, even when in PiP */}
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />

                {/* Show overlay when in PiP mode */}
                {isInPiP && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-90 z-20">
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
                            <p className="text-sm font-semibold">Searching for cameras...</p>
                        </div>
                    </div>
                )}
                {error && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-75 z-10">
                        <div className="text-center text-accent-yellow p-4 max-w-xs">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm font-semibold">{error}</p>
                            <button onClick={getDevices} className="mt-4 px-3 py-1 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus text-sm">
                                Try Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocalCamera;
