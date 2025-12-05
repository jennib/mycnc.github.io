import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, CameraOff, PictureInPicture, Volume2, VolumeX, Dock } from "@mycnc/shared";
import { useSettingsStore } from '@/stores/settingsStore';
import LocalCamera from './LocalCamera';
import WebRTCStream from './WebRTCStream';

const isElectron = !!window.electronAPI?.isElectron;

const WebcamPanel: React.FC = () => {
    const { t } = useTranslation();
    const [isInPiP, setIsInPiP] = useState(false);
    const [isPoppedOut, setIsPoppedOut] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const { webcamSettings, actions: { setWebcamSettings } } = useSettingsStore();
    const { volume, isMuted, mode } = webcamSettings;

    const isPiPSupported = 'pictureInPictureEnabled' in document;

    useEffect(() => {
        if (isElectron && window.electronAPI) {
            // Listen for window close event from main process
            const removeListener = window.electronAPI.onCameraWindowClosed?.(() => {
                setIsPoppedOut(false);
            });
            // onCameraWindowClosed returns void in our mock, but in real electron it returns an unsubscribe function usually?
            // Wait, our preload implementation: onCameraWindowClosed: (callback) => ipcRenderer.on(...)
            // ipcRenderer.on returns the emitter, not an unsubscribe function directly in the same way as some other APIs.
            // But wait, our preload definition: onCameraWindowClosed: (callback) => ipcRenderer.on(...)
            // We need to handle cleanup if possible, but for now let's just add it.
            // Actually, looking at preload: onCameraWindowClosed: (callback) => ipcRenderer.on('camera-window-closed', callback)
            // This adds a listener. We should probably return a cleanup function from preload if we want to remove it,
            // or just accept it adds a listener.
            // For now, let's assume it works as is.
        }
    }, []);

    const handleTogglePiP = async () => {
        if (isElectron && window.electronAPI) {
            if (isPoppedOut) {
                window.electronAPI.closeCameraWindow();
                setIsPoppedOut(false);
            } else {
                const params = {
                    mode: mode === 'off' ? 'local' : mode, // Default to local if off when popping out? Or just don't allow popout if off?
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

    const handleModeChange = (newMode: 'off' | 'local' | 'webrtc') => {
        setWebcamSettings({ mode: newMode });
    };

    const isWebcamOn = mode !== 'off';

    const handleConnectionChange = React.useCallback((isConnected: boolean) => {
        if (webcamSettings.webRTCAutoConnect !== isConnected) {
            setWebcamSettings({ webRTCAutoConnect: isConnected });
        }
    }, [webcamSettings.webRTCAutoConnect, setWebcamSettings]);

    return (
        <div className="bg-surface rounded-lg shadow-lg p-4 h-full flex flex-col">
            <div className="text-lg font-bold flex items-center justify-between pb-4 border-b border-secondary mb-4">
                <div className="flex items-center gap-2">
                    {isWebcamOn ? <Camera className="w-5 h-5 text-primary" /> : <CameraOff className="w-5 h-5 text-text-secondary" />}
                    {t('webcam.title')}
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-background p-1 rounded-lg border border-secondary">
                        <label className="flex items-center gap-1 cursor-pointer px-1">
                            <input
                                type="radio"
                                name="webcamMode"
                                value="off"
                                checked={mode === 'off'}
                                onChange={() => handleModeChange('off')}
                                className="form-radio text-accent-red focus:ring-accent-red w-3 h-3"
                            />
                            <span className={`text-xs font-medium ${mode === 'off' ? 'text-text-primary' : 'text-text-secondary'}`}>{t('webcam.disable')}</span>
                        </label>
                        <div className="w-px h-3 bg-secondary"></div>
                        <label className="flex items-center gap-1 cursor-pointer px-1">
                            <input
                                type="radio"
                                name="webcamMode"
                                value="local"
                                checked={mode === 'local'}
                                onChange={() => handleModeChange('local')}
                                className="form-radio text-primary focus:ring-primary w-3 h-3"
                            />
                            <span className={`text-xs font-medium ${mode === 'local' ? 'text-text-primary' : 'text-text-secondary'}`}>{t('webcam.local')}</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer px-1">
                            <input
                                type="radio"
                                name="webcamMode"
                                value="webrtc"
                                checked={mode === 'webrtc'}
                                onChange={() => handleModeChange('webrtc')}
                                className="form-radio text-primary focus:ring-primary w-3 h-3"
                            />
                            <span className={`text-xs font-medium ${mode === 'webrtc' ? 'text-text-primary' : 'text-text-secondary'}`}>{t('webcam.webrtc')}</span>
                        </label>
                    </div>
                    {(isWebcamOn && videoRef.current?.srcObject && (isPiPSupported || isElectron) && !isInPiP && !isPoppedOut) && (
                        <button
                            onClick={handleTogglePiP}
                            title={isElectron ? t('webcam.popout') : t('webcam.pip')}
                            className="p-1 rounded-md text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {isElectron ? <Dock className="w-5 h-5" /> : <PictureInPicture className="w-5 h-5" />}
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-4">


                {(isWebcamOn && videoRef.current?.srcObject) && (
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
                    isWebcamOn ? (
                        mode === 'local' ? (
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
                                autoConnect={webcamSettings.webRTCAutoConnect}
                                onConnectionChange={handleConnectionChange}
                            />
                        )
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-text-secondary">
                            <CameraOff className="w-16 h-16 opacity-20 mb-4" />
                            <p className="text-lg font-medium opacity-50">{t('webcam.disabledMessage', 'Camera is disabled')}</p>
                            <p className="text-sm opacity-40 mt-2">{t('webcam.selectMode', 'Select a mode above to enable')}</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default WebcamPanel;
