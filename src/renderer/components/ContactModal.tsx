import React, { useState } from 'react';
import { Send } from './Icons';
import Modal from './Modal'; // Import the new generic Modal component

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) {
            setError('All fields are required.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address.');
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

    const footer = (
        <>
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-secondary text-white font-semibold rounded-md hover:bg-secondary-focus"
            >
                Cancel
            </button>
            <button
                type="submit"
                form="contact-form" // Associate the button with the form
                className="px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-primary-focus flex items-center gap-2"
            >
                <Send className="w-5 h-5" />
                Send Message
            </button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Contact Us"
            footer={footer}
            size="lg"
        >
            <form onSubmit={handleSubmit} id="contact-form">
                <div className="space-y-4">
                    {error && (
                        <div className="bg-accent-red/20 text-accent-red p-3 rounded-md text-sm font-semibold">
                            {error}
                        </div>
                    )}
                    <div>
                        <label htmlFor="contact-name" className="block text-sm font-medium text-text-secondary mb-1">
                            Your Name
                        </label>
                        <input
                            id="contact-name"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            className="w-full bg-background border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="contact-email" className="block text-sm font-medium text-text-secondary mb-1">
                            Your Email
                        </label>
                        <input
                            id="contact-email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full bg-background border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="contact-message" className="block text-sm font-medium text-text-secondary mb-1">
                            Message
                        </label>
                        <textarea
                            id="contact-message"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            required
                            rows={5}
                            className="w-full bg-background border border-secondary rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <p className="text-xs text-text-secondary">
                        This will open your default email client to send the message.
                    </p>
                </div>
            </form>
        </Modal>
    );
};

export default ContactModal;