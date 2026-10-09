'use client';

import { useState } from 'react';
import {
    Database,
    Download,
    RotateCcw,
    Trash2,
    AlertTriangle,
    CheckCircle,
    Calendar,
    Server
} from 'lucide-react';

export default function AdminBackupPage() {
    const [backups, setBackups] = useState([
        { id: 1, name: 'backup-2025-10-12-manual.sql', date: '12/10/2025 14:30', size: '45.2 MB', status: 'success' },
        { id: 2, name: 'backup-2025-10-10-auto.sql', date: '10/10/2025 00:00', size: '44.8 MB', status: 'success' },
        { id: 3, name: 'backup-2025-10-09-auto.sql', date: '09/10/2025 00:00', size: '44.5 MB', status: 'warning' },
        { id: 4, name: 'backup-2025-10-08-auto.sql', date: '08/10/2025 00:00', size: '44.1 MB', status: 'success' },
    ]);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateBackup = () => {
        setIsCreating(true);
        // Simulate API call
        setTimeout(() => {
            const newBackup = {
                id: Date.now(),
                name: `backup-${new Date().toISOString().split('T')[0]}-manual.sql`,
                date: new Date().toLocaleString(),
                size: '45.3 MB',
                status: 'success'
            };
            setBackups([newBackup, ...backups]);
            setIsCreating(false);
        }, 2000);
    };

    const handleDelete = (id: number) => {
        if (confirm('Tem a certeza que deseja eliminar este backup?')) {
            setBackups(backups.filter(b => b.id !== id));
        }
    };

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                Base de Dados e Backups
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
                Gerir cópias de segurança e restauro do sistema
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                            <Database size={24} className="text-gray-900" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-black dark:text-white">Backup Manual</h3>
                            <p className="text-sm text-gray-500">Criar uma cópia imediata da base de dados</p>
                        </div>
                    </div>
                    <button
                        onClick={handleCreateBackup}
                        disabled={isCreating}
                        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isCreating ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white dark:border-black border-r-transparent" />
                                A criar cópia...
                            </>
                        ) : (
                            <>
                                <Download size={18} />
                                Criar Backup Agora
                            </>
                        )}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-3">
                        Último backup: {backups[0]?.date || 'Nunca'}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <Server size={24} className="text-purple-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-black dark:text-white">Configuração Automática</h3>
                            <p className="text-sm text-gray-500">Agendamento de backups diários</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm font-medium">Frequência</span>
                        <span className="text-sm text-gray-500">Diário (00:00)</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-sm font-medium">Retenção</span>
                        <span className="text-sm text-gray-500">30 dias</span>
                    </div>
                    <button className="w-full mt-4 text-sm font-medium text-black hover:text-blue-800">
                        Alterar Configurações
                    </button>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                        <Calendar size={20} />
                        Histórico de Backups
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ficheiro</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tamanho</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {backups.map((backup) => (
                                <tr key={backup.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-sm text-black dark:text-white">
                                        {backup.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {backup.date}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {backup.size}
                                    </td>
                                    <td className="px-6 py-4">
                                        {backup.status === 'success' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                                <CheckCircle size={12} /> Sucesso
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                                                <AlertTriangle size={12} /> Aviso
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 flex items-center space-x-3">
                                        <button className="text-black hover:text-blue-800 dark:text-gray-600 dark:hover:text-blue-300 transition-colors" title="Download">
                                            <Download size={18} />
                                        </button>
                                        <button className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors" title="Restaurar">
                                            <RotateCcw size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(backup.id)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
