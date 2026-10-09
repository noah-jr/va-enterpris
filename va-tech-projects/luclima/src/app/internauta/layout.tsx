import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Portal do Internauta - Luclima',
    description: 'Área dedicada a clientes e interessados nos serviços Luclima',
};

export default function InternautaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-sans">
            {children}
        </div>
    );
}
