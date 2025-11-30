import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, CameraOff, PictureInPicture, Volume2, VolumeX } from './Icons';
import { useSettingsStore } from '@/stores/settingsStore';
import LocalCamera from './LocalCamera';
import WebRTCStream from './WebRTCStream';

const isElectron = !!window.electronAPI?.isElectron;

const WebcamPanel: React.FC = () => {
    const { t } = useTranslation();
    const [isWebcamOn, setIsWebcamOn] = useState(false);
    const [webcamMode, setWebcamMode] = useState<'local' | 'webrtc'>('local');
    const [isInPiP, setIsInPiP] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const { webcamSettings, actions: { setWebcamSettings } } = useSettingsStore();
    const { volume, isMuted } = webcamSettings;

    const isPiPSupported = 'pictureInPictureEnabled' in document;

    const handleToggleWebcam = () => {
        setIsWebcamOn(prev => !prev);
    };

    const handleTogglePiP = async () => {
        if (!videoRef.current) return;
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else if (isPiPSupported) {
            await videoRef.current.requestPictureInPicture();
        }
    };

    return (
        <div className="bg-surface rounded-lg shadow-lg p-4">
            <div className="text-lg font-bold flex items-center justify-between pb-4 border-b border-secondary mb-4">
                <div className="flex items-center gap-2">
                    {isWebcamOn ? <Camera className="w-5 h-5 text-primary" /> : <CameraOff className="w-5 h-5 text-text-secondary" />}
                    {t('webcam.title')}
                </div>
                <div className="flex items-center gap-2">
                    {(isWebcamOn && videoRef.current?.srcObject && isPiPSupported && !isInPiP) && (
                        <button onClick={handleTogglePiP} title={t('webcam.pip')} className="p-1 rounded-md text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                            <PictureInPicture className="w-5 h-5" />
                        </button>
                    )}
                    <button onClick={handleToggleWebcam} className={`flex items-center gap-2 px-3 py-1 ${isWebcamOn ? 'bg-accent-red hover:bg-red-700' : 'bg-secondary hover:bg-secondary-focus'} text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm`}>
                        {isWebcamOn ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                        {isWebcamOn ? t('webcam.disable') : t('webcam.enable')}
                    </button>
                </div>
            </div>

            {isWebcamOn && isElectron && (
                <div className="mb-4">
                    <div className="flex items-center gap-4 mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="webcamMode" value="local" checked={webcamMode === 'local'} onChange={() => setWebcamMode('local')} className="form-radio text-primary focus:ring-primary" />
                            <span className="text-sm font-medium text-text-secondary">{t('webcam.local')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="webcamMode" value="webrtc" checked={webcamMode === 'webrtc'} onChange={() => setWebcamMode('webrtc')} className="form-radio text-primary focus:ring-primary" />
                            <span className="text-sm font-medium text-text-secondary">{t('webcam.webrtc')}</span>
                        </label>
                    </div>

                    {(isWebcamOn && videoRef.current?.srcObject && (webcamMode === 'webrtc' || webcamMode === 'local')) && (
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

            {isWebcamOn && (
                webcamMode === 'local' ? (
                    <LocalCamera
                        volume={volume}
                        isMuted={isMuted}
                        isInPiP={isInPiP}
                        onTogglePiP={handleTogglePiP}
                        onPiPChange={setIsInPiP}
                        videoRef={videoRef}
                    />
                ) : (
                    <WebRTCStream
                        volume={volume}
                        isMuted={isMuted}
                        isInPiP={isInPiP}
                        onTogglePiP={handleTogglePiP}
                        onPiPChange={setIsInPiP}
                        videoRef={videoRef}
                    />
                )
            )}
        </div>
    );
};

export default WebcamPanel;
