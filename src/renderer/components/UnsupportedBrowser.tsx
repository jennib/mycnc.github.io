import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { AlertTriangle } from './Icons';

const UnsupportedBrowser: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-background text-text-primary min-h-screen flex flex-col items-center justify-center p-8 text-center">
            <div className="max-w-2xl">
                <svg viewBox="0 0 420 100" className="h-16 w-auto mx-auto mb-8" aria-label="mycnc.app logo">
                    <g transform="translate(48,48)" fill="none" stroke="var(--color-text-primary)" strokeWidth="4">
                        <circle r="48" cx="0" cy="0" />
                        <path d="M 0,-48 A 48,48 0 0 1 30,16 L 10,6 A 12,12 0 0 0 0,-12 Z" />
                        <path d="M 0,-48 A 48,48 0 0 1 30,16 L 10,6 A 12,12 0 0 0 0,-12 Z" transform="rotate(120)" />
                        <path d="M 0,-48 A 48,48 0 0 1 30,16 L 10,6 A 12,12 0 0 0 0,-12 Z" transform="rotate(-120)" />
                        <circle r="12" cx="0" cy="0" />
                    </g>
                    <text
                        x="108"
                        y="66"
                        fontFamily="Inter, 'Segoe UI', Roboto, Arial, sans-serif"
                        fontWeight="700"
                        fontSize="64px"
                        letterSpacing="-0.02em"
                        fill="var(--color-text-primary)"
                    >
                        <tspan style={{ fill: 'var(--color-primary)' }}>mycnc</tspan>
                        .app
                    </text>
                </svg>
                <div className="bg-accent-yellow/20 border-l-4 border-accent-yellow text-accent-yellow p-4 m-4 flex items-start" role="alert">
                    <AlertTriangle className="h-8 w-8 mr-4 flex-shrink-0" />
                    <div className="text-left">
                        <h2 className="text-lg font-bold mb-2">{t('unsupported.title')}</h2>
                        <p className="mb-2">{t('unsupported.message1')}</p>
                        <p className="mb-2">{t('unsupported.message2')}</p>
                        <p>{t('unsupported.message3')}</p>
                        <div className="mt-4">
                            <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">{t('unsupported.checkCompat')}</a>
                            <span className="mx-2">|</span>
                            <a href="https://caniuse.com/serial" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">{t('unsupported.viewCanIUse')}</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnsupportedBrowser;