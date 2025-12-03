import React, { useState } from 'react';

interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    defaultTab?: string;
    className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, className = '' }) => {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Tab Headers */}
            <div className="flex border-b border-white/20 bg-surface/80 backdrop-blur-md rounded-t-xl overflow-hidden flex-shrink-0 mx-2 mt-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-all border-b-2 flex-1 justify-center ${activeTab === tab.id
                            ? 'border-primary bg-primary/20 text-primary shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)]'
                            : 'border-transparent text-text-secondary hover:bg-white/10 hover:text-text-primary'
                            }`}
                    >
                        {tab.icon && <span className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : 'opacity-70'}`}>{tab.icon}</span>}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content - All tabs are always mounted, just hidden with CSS */}
            <div className="flex-grow overflow-hidden relative bg-surface/60 backdrop-blur-md rounded-b-xl mx-2 mb-2 border-x border-b border-white/20 shadow-inner">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        className="absolute inset-0 p-2"
                        style={{ display: activeTab === tab.id ? 'block' : 'none' }}
                    >
                        {tab.content}
                    </div>
                ))}
            </div>
        </div>
    );
};

export { Tabs };
