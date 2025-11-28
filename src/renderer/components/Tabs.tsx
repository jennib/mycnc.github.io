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

    const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Tab Headers */}
            <div className="flex border-b border-secondary bg-surface rounded-t-lg overflow-hidden flex-shrink-0">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab.id
                                ? 'border-primary bg-background text-text-primary'
                                : 'border-transparent text-text-secondary hover:bg-secondary hover:text-text-primary'
                            }`}
                    >
                        {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-grow overflow-hidden">
                {activeTabContent}
            </div>
        </div>
    );
};

export default Tabs;
