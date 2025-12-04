import React, { useRef } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUIStore } from '@/stores/uiStore';
import LocalCamera from './LocalCamera';
import WebRTCStream from './WebRTCStream';
import { X } from "@mycnc/shared";

const WebcamPeek: React.FC = () => {
    const { webcamSettings } = useSettingsStore();
    const { isWebcamPeekOpen, actions: { toggleWebcamPeek } } = useUIStore();
    const videoRef = useRef<HTMLVideoElement>(null);

    // We don't need full PiP/Popout logic here, just a simple view
    const noop = () => { };

    if (!isWebcamPeekOpen) return null;

    return (
        <div className="fixed bottom-14 right-4 w-80 h-60 bg-surface border border-white/20 rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col">
            <div className="bg-background/80 p-1 flex justify-between items-center border-b border-white/10">
                <span className="text-xs font-bold px-2 text-text-secondary">Webcam Peek</span>
                <button
                    onClick={toggleWebcamPeek}
                    className="p-1 hover:bg-white/10 rounded text-text-secondary hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-grow relative bg-black flex items-center justify-center">
                {webcamSettings.mode === 'local' ? (
                    <LocalCamera
                        volume={0}
                        isMuted={true}
                        isInPiP={false}
                        onTogglePiP={noop}
                        onPiPChange={noop}
                        videoRef={videoRef}
                    />
                ) : webcamSettings.mode === 'webrtc' ? (
                    <WebRTCStream
                        volume={0}
                        isMuted={true}
                        isInPiP={false}
                        onTogglePiP={noop}
                        onPiPChange={noop}
                        videoRef={videoRef}
                    />
                ) : (
                    <div className="text-text-secondary text-sm opacity-50">Camera Disabled</div>
                )}
            </div>
        </div>
    );
};

export default WebcamPeek;
