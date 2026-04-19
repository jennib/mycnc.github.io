import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Globe, Copy, Check, Wifi } from 'lucide-react';

export default function RemoteAccessButton() {
    const [open, setOpen] = useState(false);
    const [urls, setUrls] = useState<string[]>([]);
    const [copied, setCopied] = useState<string | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    const isElectron = !!window.electronAPI?.isElectron;
    const isRemote = window.electronAPI && !window.electronAPI.isElectron;

    useEffect(() => {
        if (open && isElectron) {
            window.electronAPI?.getServerUrls?.().then(setUrls);
        }
    }, [open, isElectron]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const copy = useCallback((url: string) => {
        const fallback = () => {
            const el = document.createElement('textarea');
            el.value = url;
            el.style.position = 'fixed';
            el.style.opacity = '0';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        };
        const finish = () => { setCopied(url); setTimeout(() => setCopied(null), 1500); };
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(url).then(finish).catch(fallback);
            finish();
        } else {
            fallback();
            finish();
        }
    }, []);

    if (isRemote) {
        return (
            <div className="flex items-center gap-1 text-[10px] text-green-400" title="Connected via remote access">
                <Wifi className="w-3 h-3" />
                <span>Remote</span>
            </div>
        );
    }

    if (!isElectron) return null;

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className="btn btn-secondary flex flex-col items-center gap-0.5 px-2 py-1 h-auto"
                title="Remote Access"
            >
                <Globe className="w-4 h-4" />
                <span className="text-[10px] leading-none text-text-secondary">Remote</span>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-72 bg-surface border border-white/10 rounded-lg shadow-xl z-50 p-3">
                    <p className="text-xs font-medium text-text-secondary mb-2">Open in a browser on your network:</p>
                    <div className="flex flex-col gap-1.5">
                        {urls.length === 0 && (
                            <p className="text-xs text-text-secondary">Loading…</p>
                        )}
                        {urls.map(url => (
                            <div key={url} className="flex items-center justify-between gap-2 bg-black/20 rounded px-2 py-1.5">
                                <span className="text-xs font-mono text-text-primary truncate">{url}</span>
                                <button
                                    onClick={() => copy(url)}
                                    className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
                                    title="Copy"
                                >
                                    {copied === url
                                        ? <Check className="w-3.5 h-3.5 text-green-400" />
                                        : <Copy className="w-3.5 h-3.5 text-text-secondary" />
                                    }
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
