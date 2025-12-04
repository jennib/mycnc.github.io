import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, CameraOff, PictureInPicture, Volume2, VolumeX, Dock } from "@mycnc/shared";
import { useSettingsStore } from '@/stores/settingsStore';
import LocalCamera from './LocalCamera';
import WebRTCStream from './WebRTCStream';

const isElectron = !!window.electronAPI?.isElectron;

const WebcamPanel: React.FC = () => {
    const { t } = useTranslation();
    const [isWebcamOn, setIsWebcamOn] = useState(false);
    const [activeTab, setActiveTab] = useState<'local' | 'webrtc'>('local');
    const [isInPiP, setIsInPiP] = useState(false);
    const [isPoppedOut, setIsPoppedOut] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const { webcamSettings, actions: { setWebcamSettings } } = useSettingsStore();
    const { volume, isMuted } = webcamSettings;

    const isPiPSupported = 'pictureInPictureEnabled' in document;

    useEffect(() => {
        if (isElectron && window.electronAPI) {
            // Listen for window close event from main process if needed
        }
    }, []);

    const handleToggleWebcam = () => {
        setIsWebcamOn(prev => !prev);
    };

    const handleTogglePiP = async () => {
        if (isElectron && window.electronAPI) {
            if (isPoppedOut) {
                window.electronAPI.closeCameraWindow();
                setIsPoppedOut(false);
            } else {
                const params = {
                    mode: activeTab,
                    deviceId: webcamSettings.selectedDeviceId,
                    url: 'ws://10.0.0.162:8888/webrtc' // TODO: Get actual URL from WebRTC component if possible, or store in settings
                };
                window.electronAPI.openCameraWindow(params);
                setIsPoppedOut(true);
            }
        } else {
            // Web Mode: Native PiP
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                    setIsInPiP(false);
                } else if (videoRef.current) {
                    await videoRef.current.requestPictureInPicture();
                    setIsInPiP(true);
                }
            } catch (err) {
                console.error("Failed to toggle PiP:", err);
            }
        }
    };

    const handlePiPChange = (isPiP: boolean) => {
        setIsInPiP(isPiP);
    };

    return (
        <div className="bg-surface rounded-lg shadow-lg p-4 h-full flex flex-col">
            <div className="text-lg font-bold flex items-center justify-between pb-4 border-b border-secondary mb-4">
                <div className="flex items-center gap-2">
                    {isWebcamOn ? <Camera className="w-5 h-5 text-primary" /> : <CameraOff className="w-5 h-5 text-text-secondary" />}
                    {t('webcam.title')}
                </div>
                <div className="flex items-center gap-2">
                    {(isWebcamOn && videoRef.current?.srcObject && (isPiPSupported || isElectron) && !isInPiP && !isPoppedOut) && (
                        <button
                            onClick={handleTogglePiP}
                            title={isElectron ? t('webcam.popout') : t('webcam.pip')}
                            className="p-1 rounded-md text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {isElectron ? <Dock className="w-5 h-5" /> : <PictureInPicture className="w-5 h-5" />}
                        </button>
                    )}
                    <button onClick={handleToggleWebcam} className={`flex items-center gap-2 px-3 py-1 ${isWebcamOn ? 'bg-accent-red hover:bg-red-700' : 'bg-secondary hover:bg-secondary-focus'} text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm`}>
                        {isWebcamOn ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                        {isWebcamOn ? t('webcam.disable') : t('webcam.enable')}
                    </button>
                </div>
            </div>

            {isWebcamOn && isElectron && !isPoppedOut && (
                <div className="mb-4">
                    <div className="flex items-center gap-4 mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="webcamMode" value="local" checked={activeTab === 'local'} onChange={() => setActiveTab('local')} className="form-radio text-primary focus:ring-primary" />
                            <span className="text-sm font-medium text-text-secondary">{t('webcam.local')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="webcamMode" value="webrtc" checked={activeTab === 'webrtc'} onChange={() => setActiveTab('webrtc')} className="form-radio text-primary focus:ring-primary" />
                            <span className="text-sm font-medium text-text-secondary">{t('webcam.webrtc')}</span>
                        </label>
                    </div>

                    {(isWebcamOn && videoRef.current?.srcObject && (activeTab === 'webrtc' || activeTab === 'local')) && (
                        <div className="flex items-center gap-2 mt-4">
                            <button onClick={() => setWebcamSettings({ isMuted: !isMuted })} title={isMuted ? t('webcam.unmute') : t('webcam.mute')} className="p-1 rounded-md text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
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
                                    setWebcamSettings({ volume: newVolume, isMuted: newVolume === 0 });
                                    if (videoRef.current) videoRef.current.volume = newVolume;
                                }}
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="flex-1 min-h-0 bg-background-secondary rounded-lg border border-secondary p-4 overflow-y-auto">
                {isPoppedOut ? (
                    <div className="h-full flex flex-col items-center justify-center text-text-secondary space-y-4">
                        <Dock className="w-16 h-16 opacity-50" />
                        <p className="text-lg font-medium">Camera is popped out</p>
                        <button
                            onClick={() => {
                                if (window.electronAPI) {
                                    window.electronAPI.closeCameraWindow();
                                    setIsPoppedOut(false);
                                }
                            }}
                            className="px-4 py-2 bg-secondary hover:bg-secondary-focus text-white rounded-md transition-colors"
                        >
                            Restore Camera
                        </button>
                    </div>
                ) : (
                    isWebcamOn && (
                        activeTab === 'local' ? (
                            <LocalCamera
                                volume={volume}
                                isMuted={isMuted}
                                isInPiP={isInPiP}
                                onTogglePiP={handleTogglePiP}
                                onPiPChange={handlePiPChange}
                                videoRef={videoRef}
                            />
                        ) : (
                            <WebRTCStream
                                volume={volume}
                                isMuted={isMuted}
                                isInPiP={isInPiP}
                                onTogglePiP={handleTogglePiP}
                                onPiPChange={handlePiPChange}
                                videoRef={videoRef}
                            />
                        )
                    )
                )}
            </div>
        </div>
    );
};

export default WebcamPanel;
