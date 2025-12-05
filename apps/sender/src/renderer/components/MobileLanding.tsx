import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Monitor, Smartphone, Zap, Github } from 'lucide-react';

const MobileLanding: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        const checkDesktop = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
            const isIPad = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

            if (!isMobile && !isIPad) {
                navigate('/');
            }
        };
        checkDesktop();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="z-10 max-w-md w-full flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-700">
                {/* Logo / Icon */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-xl opacity-50 rounded-full" />
                    <div className="relative bg-surface p-4 rounded-2xl border border-white/10 shadow-2xl">
                        <img src="./mycnclogo.svg" alt="myCNC" className="w-16 h-16" />
                    </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                        myCNC.app
                    </h1>
                    <p className="text-lg text-text-secondary leading-relaxed">
                        {t('unsupported.message1', 'Professional CNC control, right in your browser.')}
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 gap-4 w-full">
                    <div className="bg-surface/50 backdrop-blur-md border border-white/5 p-4 rounded-xl flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Monitor className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-text-primary">Desktop Optimized</h3>
                            <p className="text-sm text-text-secondary">Designed for large screens</p>
                        </div>
                    </div>

                    <div className="bg-surface/50 backdrop-blur-md border border-white/5 p-4 rounded-xl flex items-center gap-4">
                        <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-text-primary">Real-time Control</h3>
                            <p className="text-sm text-text-secondary">Low latency communication</p>
                        </div>
                    </div>
                </div>

                {/* Call to Action / Warning */}
                <div className="bg-gradient-to-br from-surface to-surface/80 border border-white/10 p-6 rounded-2xl shadow-xl w-full">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-500 mb-2">
                            <Smartphone className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Desktop Required</h2>
                        <p className="text-sm text-text-secondary">
                            {t('unsupported.message3', 'For the best experience and safety, please access this application from a desktop computer.')}
                        </p>

                        <div className="w-full pt-4 border-t border-white/5 mt-4">
                            <p className="text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-2">
                                Why Desktop?
                            </p>
                            <ul className="text-sm text-text-secondary space-y-2 text-left px-4">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Web Serial API Support
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Keyboard Shortcuts
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Complex 3D Visualization
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col items-center gap-4 mt-4">
                    <a
                        href="https://github.com/jennib/mycnc.github.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-text-tertiary hover:text-primary transition-colors"
                    >
                        <Github className="w-4 h-4" />
                        <span>View on GitHub</span>
                    </a>
                    <div className="text-xs text-text-tertiary">
                        &copy; {new Date().getFullYear()} myCNC.app
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileLanding;
