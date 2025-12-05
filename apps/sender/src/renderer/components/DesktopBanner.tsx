import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DesktopBanner: React.FC = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(true);

    // Don't show if running in Electron
    if (window.electronAPI?.isElectron) {
        return null;
    }

    if (!isVisible) {
        return null;
    }

    return (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between gap-4 text-sm animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3 flex-1 justify-center">
                <div className="p-1.5 bg-primary/20 rounded-full text-primary shrink-0">
                    <Download className="w-4 h-4" />
                </div>
                <p className="text-text-primary">
                    <span className="font-semibold hidden sm:inline">Get the full experience.</span>{' '}
                    <span className="text-text-secondary">Download the desktop app for better performance, offline support, and TCP connections.</span>
                </p>
                <a
                    href="https://github.com/jennib/mycnc.github.io/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap px-3 py-1 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors text-xs"
                >
                    Download App
                </a>
            </div>

            <button
                onClick={() => setIsVisible(false)}
                className="text-text-tertiary hover:text-text-primary transition-colors p-1 hover:bg-white/5 rounded-full"
                aria-label="Dismiss banner"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default DesktopBanner;
