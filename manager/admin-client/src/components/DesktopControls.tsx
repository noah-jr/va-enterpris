import { Minus, Square, X } from 'lucide-react';

const DesktopControls = () => {
    // Only show if running in Electron
    const isElectron = window.navigator.userAgent.toLowerCase().includes('electron');

    if (!isElectron) return null;

    const handleMinimize = () => (window as any).electronAPI.minimize();
    const handleMaximize = () => (window as any).electronAPI.maximize();
    const handleClose = () => (window as any).electronAPI.close();

    return (
        <div className="flex items-center gap-1 px-4 no-drag h-full">
            <button
                onClick={handleMinimize}
                className="p-2 hover:bg-white/10 rounded-md transition-colors text-[var(--text-secondary)]"
            >
                <Minus size={14} />
            </button>
            <button
                onClick={handleMaximize}
                className="p-2 hover:bg-white/10 rounded-md transition-colors text-[var(--text-secondary)]"
            >
                <Square size={12} />
            </button>
            <button
                onClick={handleClose}
                className="p-2 hover:bg-rose-500 hover:text-white rounded-md transition-colors text-[var(--text-secondary)]"
            >
                <X size={14} />
            </button>
        </div>
    );
};

export default DesktopControls;
