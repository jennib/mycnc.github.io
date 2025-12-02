import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send } from './Icons';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) {
            setError(t('contact.errors.required'));
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError(t('contact.errors.email'));
            return;
        }
        setError('');

        const subject = encodeURIComponent("Contact from mycnc.app");
        const body = encodeURIComponent(
            `Name: ${name}
Email: ${email}

Message:
${message}`
        );

        window.location.href = `mailto:tutti.studios@gmail.com?subject=${subject}&body=${body}`;
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-surface/95 backdrop-blur-xl rounded-xl shadow-2xl w-full max-w-lg border border-white/10 transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-text-primary">{t('contact.title')}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                        aria-label="Close contact form"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="bg-accent-red/20 text-accent-red p-3 rounded-lg text-sm font-semibold border border-accent-red/20">
                                {error}
                            </div>
                        )}
                        <div>
                            <label htmlFor="contact-name" className="block text-sm font-medium text-text-secondary mb-1">
                                {t('contact.name')}
                            </label>
                            <input
                                id="contact-name"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                className="w-full bg-background/50 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="contact-email" className="block text-sm font-medium text-text-secondary mb-1">
                                {t('contact.email')}
                            </label>
                            <input
                                id="contact-email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="w-full bg-background/50 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="contact-message" className="block text-sm font-medium text-text-secondary mb-1">
                                {t('contact.message')}
                            </label>
                            <textarea
                                id="contact-message"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                required
                                rows={5}
                                className="w-full bg-background/50 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-text-primary"
                            />
                        </div>
                        <p className="text-xs text-text-secondary">
                            {t('contact.clientInfo')}
                        </p>
                    </div>
                    <div className="bg-background/30 px-6 py-4 flex justify-end items-center gap-4 rounded-b-xl border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-secondary/80 text-text-primary font-semibold rounded-lg hover:bg-secondary border border-white/5 transition-all active:scale-95"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-focus flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            <Send className="w-5 h-5" />
                            {t('contact.send')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactModal;
