
import { useEffect } from 'react';
import { socket } from '../App';
import { authStore } from '../auth/authStore';
import { toast } from 'sonner';

export const NotificationListener = () => {
    useEffect(() => {
        const user = authStore.getUser();
        if (!user) return;

        // Configure socket with auth info
        socket.io.opts.query = {
            companyId: user.companyId || '',
            role: user.role
        };

        if (!socket.connected) {
            socket.connect();
        }

        // --- Event Listeners ---

        // 1. Subscription Activation (Client)
        socket.on('subscription_activated', (data) => {
            toast.success(data.message, {
                description: `Sua empresa agora tem acesso ao plano ${data.planName}. Factura: ${data.invoiceNumber}`,
                duration: 6000
            });
            // Optional: force a query refetch if using React Query
        });

        // 2. New Revenue (SuperAdmin)
        socket.on('new_revenue', (data) => {
            if (user.role === 'SUPER_ADMIN') {
                toast.info(`Nova Receita: ${data.companyName}`, {
                    description: `Pagamento de ${new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(data.amount)} recebido!`,
                    duration: 5000,
                    icon: '💰'
                });
            }
        });

        // 3. System Alerts
        socket.on('system_alert', (data) => {
            toast.warning('Alerta de Sistema', {
                description: data.message
            });
        });

        return () => {
            socket.off('subscription_activated');
            socket.off('new_revenue');
            socket.off('system_alert');
            // We don't disconnect here to allow persistent connection across pages
        };
    }, []);

    return null; // This component has no UI, it just listens
};
