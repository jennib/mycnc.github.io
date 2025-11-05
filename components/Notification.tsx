
import React from 'react';
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
    const icon = type === 'success' ? <CheckCircle className="w-12 h-12 text-accent-green" /> : type === 'error' ? <AlertTriangle className="w-12 h-12 text-accent-red" /> : <Info className="w-12 h-12 text-accent-blue" />;

    return (
        <div className={`max-w-4xl w-full bg-background shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-2 ${type === 'success' ? 'border-accent-green' : type === 'error' ? 'border-accent-red' : 'border-accent-blue'} mb-4`}>
            <div className="p-8">
                <div className="flex items-start">
                    <div className="flex-shrink-0">{icon}</div>
                    <div className="ml-5 w-0 flex-1 pt-1">
                        <p className="text-3xl font-medium text-text-primary">{message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={() => onDismiss(id)}
                            className="rounded-md inline-flex text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-8 w-8" />
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
            className="fixed inset-x-0 top-0 flex items-center justify-center px-4 py-6 pointer-events-none z-50"
        >
            <div className="w-full max-w-4xl flex flex-col items-center space-y-4">
                {notifications.map(notification => (
                    <NotificationItem key={notification.id} notification={notification} onDismiss={onDismiss} />
                ))}
            </div>
        </div>
    );
};
