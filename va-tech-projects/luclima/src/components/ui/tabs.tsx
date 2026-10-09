'use client';

import * as React from 'react';

interface TabsProps {
    defaultValue: string;
    children: React.ReactNode;
}

interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
}

const TabsContext = React.createContext<{
    activeTab: string;
    setActiveTab: (value: string) => void;
} | null>(null);

export function Tabs({ defaultValue, children }: TabsProps) {
    const [activeTab, setActiveTab] = React.useState(defaultValue);

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className="w-full">{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({ children, className = '' }: TabsListProps) {
    return (
        <div className={`p-1 bg-gray-100 dark:bg-gray-800 rounded-lg inline-flex ${className}`}>
            {children}
        </div>
    );
}

export function TabsTrigger({ value, children, className = '' }: TabsTriggerProps) {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('TabsTrigger must be used within Tabs');

    const isActive = context.activeTab === value;

    return (
        <button
            type="button"
            onClick={() => context.setActiveTab(value)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${isActive
                    ? 'bg-white dark:bg-gray-950 text-black dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                } ${className}`}
        >
            {children}
        </button>
    );
}

export function TabsContent({ value, children }: TabsContentProps) {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('TabsContent must be used within Tabs');

    if (context.activeTab !== value) return null;

    return <div className="mt-4 animate-fade-in">{children}</div>;
}
