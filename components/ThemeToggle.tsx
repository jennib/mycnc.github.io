import React from 'react';
import { Sun, Moon } from './Icons';

interface ThemeToggleProps {
    isLightMode: boolean;
    onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isLightMode, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
            className="p-2 rounded-md bg-secondary text-text-primary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
        >
            {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
    );
};

export default ThemeToggle;