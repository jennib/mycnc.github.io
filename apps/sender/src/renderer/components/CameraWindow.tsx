import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LocalCamera from './LocalCamera';
import WebRTCStream from './WebRTCStream';
import { useSettingsStore } from '@/stores/settingsStore';

const CameraWindow: React.FC = () => {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') as 'local' | 'webrtc' || 'local';
    const deviceId = searchParams.get('deviceId');
    const url = searchParams.get('url');

    const videoRef = useRef<HTMLVideoElement>(null);
    const { webcamSettings, actions: { setWebcamSettings } } = useSettingsStore();
    const { volume, isMuted } = webcamSettings;

    // Sync settings if provided in URL (optional, but good for initial state)
    useEffect(() => {
        if (deviceId && mode === 'local') {
            setWebcamSettings({ selectedDeviceId: deviceId });
        }
    }, [deviceId, mode, setWebcamSettings]);

    return (
        <div className="h-screen w-screen bg-black flex items-center justify-center overflow-hidden">
            <div className="w-full h-full">
                {mode === 'local' ? (
                    <LocalCamera
                        volume={volume}
                        isMuted={isMuted}
                        isInPiP={false} // Popout window is not "PiP" in the browser sense
                        onTogglePiP={() => { }} // No-op
                        onPiPChange={() => { }} // No-op
                        videoRef={videoRef}
                        isPoppedOut={true} // New prop to hide controls
                    />
                ) : (
                    <WebRTCStream
                        volume={volume}
                        isMuted={isMuted}
                        isInPiP={false}
                        onTogglePiP={() => { }}
                        onPiPChange={() => { }}
                        videoRef={videoRef}
                        isPoppedOut={true}
                        url={url || undefined}
                        autoConnect={true}
                    />
                )}
            </div>
        </div>
    );
};

export default CameraWindow;
