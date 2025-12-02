import React, { useEffect, useState } from 'react';
import { CheckCircle, X, AlertTriangle, Info } from './Icons';

interface Notification {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
    timerId?: number;
}

interface NotificationItemProps {
    notification: Notification;
    onDismiss: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
    const { id, message, type } = notification;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        // Wait for exit animation to finish before removing
        setTimeout(() => onDismiss(id), 300);
    };

    const icon = type === 'success' ? <CheckCircle className="w-5 h-5 text-accent-green" /> :
        type === 'error' ? <AlertTriangle className="w-5 h-5 text-accent-red" /> :
            <Info className="w-5 h-5 text-accent-blue" />;

    const borderColor = type === 'success' ? 'border-accent-green/50' :
        type === 'error' ? 'border-accent-red/50' :
            'border-accent-blue/50';

    const bgColor = type === 'success' ? 'bg-accent-green/10' :
        type === 'error' ? 'bg-accent-red/10' :
            'bg-accent-blue/10';

    return (
        <div
            className={`
                w-full max-w-sm bg-surface/95 backdrop-blur-xl shadow-lg rounded-lg pointer-events-auto
                border ${borderColor} overflow-hidden mb-3 transition-all duration-300 ease-in-out transform
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            `}
            role="alert"
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className={`flex-shrink-0 p-1 rounded-full ${bgColor}`}>
                        {icon}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-text-primary">{message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={handleDismiss}
                            className="rounded-md inline-flex text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface NotificationContainerProps {
    notifications: Notification[];
    onDismiss: (id: number) => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onDismiss }) => {
    return (
        <div
            aria-live="assertive"
            className="fixed inset-0 flex flex-col items-end justify-end px-4 py-6 pointer-events-none z-[100] sm:p-6"
        >
            <div className="w-full flex flex-col items-end space-y-2">
                {notifications.map(notification => (
                    <NotificationItem key={notification.id} notification={notification} onDismiss={onDismiss} />
                ))}
            </div>
        </div>
    );
};
