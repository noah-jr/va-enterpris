import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, FileArchive, Download, HardDrive, Calendar } from "lucide-react";
import BackupManager from "@/components/BackupManager";

export const dynamic = 'force-dynamic';

export default async function BackupPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Backups</h1>
                <p className="text-muted-foreground">
                    Gerir backups da base de dados e arquivos do sistema.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Base de Dados</CardTitle>
                        <Database className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">MySQL</div>
                        <p className="text-xs text-muted-foreground">
                            Exportar em SQL ou CSV
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Arquivos</CardTitle>
                        <FileArchive className="h-4 w-4 text-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Uploads</div>
                        <p className="text-xs text-muted-foreground">
                            Imagens e documentos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
                        <HardDrive className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Local</div>
                        <p className="text-xs text-muted-foreground">
                            Backups automáticos
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Backup Manager Component */}
            <BackupManager />
        </div>
    );
}
