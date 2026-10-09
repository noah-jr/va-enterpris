"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Database,
    FileText,
    FileArchive,
    Download,
    Loader2,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BackupManager() {
    const [loading, setLoading] = useState<string | null>(null);
    const { toast } = useToast();

    const handleBackup = async (type: 'sql' | 'csv' | 'files') => {
        setLoading(type);
        try {
            const response = await fetch(`/api/backup/${type}`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Erro ao criar backup');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Define nome do arquivo baseado no tipo
            const timestamp = new Date().toISOString().split('T')[0];
            let filename = '';

            switch (type) {
                case 'sql':
                    filename = `backup_database_${timestamp}.sql`;
                    break;
                case 'csv':
                    filename = `backup_database_${timestamp}.zip`;
                    break;
                case 'files':
                    filename = `backup_files_${timestamp}.zip`;
                    break;
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: "Backup criado com sucesso!",
                description: `O arquivo ${filename} foi baixado.`,
            });
        } catch (error) {
            console.error('Erro ao criar backup:', error);
            toast({
                title: "Erro ao criar backup",
                description: "Ocorreu um erro ao gerar o backup. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setLoading(null);
        }
    };

    const backupOptions = [
        {
            id: 'sql',
            title: 'Backup SQL',
            description: 'Exportar base de dados completa em formato SQL',
            icon: Database,
            color: 'text-primary',
            bgColor: 'bg-primary/10 dark:bg-muted',
            badge: 'Recomendado',
            badgeVariant: 'default' as const,
            details: [
                'Estrutura completa das tabelas',
                'Todos os dados em formato SQL',
                'Compatível com MySQL/MariaDB',
                'Restauração fácil'
            ]
        },
        {
            id: 'csv',
            title: 'Backup CSV',
            description: 'Exportar dados em formato CSV (por tabela)',
            icon: FileText,
            color: 'text-foreground',
            bgColor: 'bg-muted/30 dark:bg-purple-950',
            badge: 'Portátil',
            badgeVariant: 'secondary' as const,
            details: [
                'Arquivo ZIP com CSVs',
                'Uma tabela por arquivo',
                'Compatível com Excel',
                'Fácil importação'
            ]
        },
        {
            id: 'files',
            title: 'Backup de Arquivos',
            description: 'Backup de uploads, imagens e documentos',
            icon: FileArchive,
            color: 'text-green-500',
            bgColor: 'bg-green-50 dark:bg-green-950',
            badge: 'Completo',
            badgeVariant: 'outline' as const,
            details: [
                'Todos os uploads do sistema',
                'Imagens e documentos',
                'Arquivos compactados em ZIP',
                'Preserva estrutura de pastas'
            ]
        }
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Criar Novo Backup</CardTitle>
                    <CardDescription>
                        Escolha o tipo de backup que deseja criar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                        {backupOptions.map((option) => (
                            <Card key={option.id} className="border-l-4 border-l-muted-foreground/20">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className={`p-3 rounded-lg ${option.bgColor}`}>
                                            <option.icon className={`h-6 w-6 ${option.color}`} />
                                        </div>
                                        <Badge variant={option.badgeVariant}>{option.badge}</Badge>
                                    </div>
                                    <CardTitle className="text-lg mt-4">{option.title}</CardTitle>
                                    <CardDescription>{option.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        {option.details.map((detail, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        className="w-full"
                                        onClick={() => handleBackup(option.id as 'sql' | 'csv' | 'files')}
                                        disabled={loading !== null}
                                    >
                                        {loading === option.id ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Criando...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="mr-2 h-4 w-4" />
                                                Criar Backup
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Informações Importantes */}
            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
                <CardHeader>
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                            <CardTitle className="text-base">Informações Importantes</CardTitle>
                            <div className="mt-2 text-sm text-muted-foreground">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Recomendamos fazer backups regulares do sistema</li>
                                    <li>Guarde os backups em local seguro e externo ao servidor</li>
                                    <li>Teste regularmente a restauração dos backups</li>
                                    <li>O backup SQL é o mais completo para restauração total</li>
                                    <li>O backup de arquivos não inclui a base de dados</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}
