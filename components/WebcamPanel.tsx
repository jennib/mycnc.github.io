import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, AlertTriangle, PictureInPicture, Dock } from './Icons';

const WebcamPanel: React.FC = () => {
    const [isWebcamOn, setIsWebcamOn] = useState(false);
    const [isInPiP, setIsInPiP] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

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
    
    const handleToggleWebcam = async () => {
        if (isWebcamOn && document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        }
        setIsWebcamOn(prev => !prev);
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
        const startWebcam = async () => {
            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setError(null);
            } catch (err) {
                console.error("Webcam Error:", err);
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setError("Webcam access denied. Please allow camera permissions in your browser settings.");
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    setError("No webcam found. Please connect a camera and try again.");
                } else {
                    setError("Could not access webcam.");
                }
                setIsWebcamOn(false);
            }
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

        if (isWebcamOn) {
            startWebcam();
        } else {
            stopWebcam();
        }

        return () => {
            stopWebcam();
        };
    }, [isWebcamOn]);

    const renderBody = () => {
        if (!isWebcamOn) {
            return null;
        }

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
            <div className="aspect-video bg-background rounded-md overflow-hidden flex items-center justify-center">
                {error && (
                    <div className="text-center text-accent-yellow p-4">
                        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-semibold">{error}</p>
                    </div>
                )}
                {!error && (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                )}
            </div>
        );
    };

    return (
        <div className="bg-surface rounded-lg shadow-lg p-4">
            <div className={`text-lg font-bold flex items-center justify-between ${isWebcamOn ? 'pb-4 border-b border-secondary mb-4' : ''}`}>
                <div className="flex items-center gap-2">
                    {isWebcamOn ? <Camera className="w-5 h-5 text-primary" /> : <CameraOff className="w-5 h-5 text-text-secondary" />}
                    Webcam
                </div>
                <div className="flex items-center gap-2">
                    {(isWebcamOn && isPiPSupported && !isInPiP) && (
                        <button
                            onClick={handleTogglePiP}
                            title="Picture-in-Picture"
                            className="p-1 rounded-md text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <PictureInPicture className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={handleToggleWebcam}
                        className={`flex items-center gap-2 px-3 py-1 ${isWebcamOn ? 'bg-accent-red hover:bg-red-700' : 'bg-secondary hover:bg-secondary-focus'} text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm`}
                    >
                        {isWebcamOn ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                        {isWebcamOn ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>
            {renderBody()}
        </div>
    );
};

export default WebcamPanel;