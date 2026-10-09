"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Database,
    FileText,
    FileArchive,
    Download,
    Trash2,
    Image as ImageIcon,
    Video,
    File,
    Calendar,
    HardDrive,
    AlertCircle,
    Loader2,
    Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Backup {
    filename: string;
    type: string;
    size: number;
    createdAt: string;
    modifiedAt: string;
}

interface FileItem {
    id: string;
    title: string;
    type: 'post' | 'service';
    image: {
        path: string;
        size: number;
        exists: boolean;
    } | null;
    video?: string;
    createdAt: string;
}

interface OrphanFile {
    filename: string;
    path: string;
    size: number;
    createdAt: string;
    type: 'orphan';
}

export default function FilesManagerPage() {
    const [backups, setBackups] = useState<Backup[]>([]);
    const [postFiles, setPostFiles] = useState<FileItem[]>([]);
    const [serviceFiles, setServiceFiles] = useState<FileItem[]>([]);
    const [cloudinaryFiles, setCloudinaryFiles] = useState<any[]>([]);
    const [orphanFiles, setOrphanFiles] = useState<OrphanFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPosts: 0,
        totalServices: 0,
        totalOrphans: 0,
        totalFiles: 0,
    });
    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Carregar backups
            const backupsRes = await fetch('/api/backup/list');
            const backupsData = await backupsRes.json();
            setBackups(backupsData.backups || []);

            // Carregar arquivos
            const filesRes = await fetch('/api/files/list');
            const filesData = await filesRes.json();
            setPostFiles(filesData.posts || []);
            setServiceFiles(filesData.services || []);
            setCloudinaryFiles(filesData.cloudinaryFiles || []);
            setOrphanFiles(filesData.orphanFiles || []);
            setStats(filesData.stats || stats);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            toast({
                title: "Erro ao carregar dados",
                description: "Não foi possível carregar as informações.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getBackupIcon = (type: string) => {
        switch (type) {
            case 'sql': return Database;
            case 'csv': return FileText;
            case 'files': return FileArchive;
            default: return File;
        }
    };

    const getBackupColor = (type: string) => {
        switch (type) {
            case 'sql': return 'text-foreground';
            case 'csv': return 'text-foreground';
            case 'files': return 'text-green-500';
            default: return 'text-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Arquivos & Backups</h1>
                    <p className="text-muted-foreground">
                        Gerir backups realizados e arquivos de upload do sistema.
                    </p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        id="direct-upload"
                        className="hidden"
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setLoading(true);
                            const formData = new FormData();
                            formData.append("file", file);
                            try {
                                const res = await fetch("/api/upload", { method: "POST", body: formData });
                                if (res.ok) {
                                    toast({ title: "Upload concluído", description: "O arquivo foi enviado para o Cloudinary." });
                                    loadData();
                                } else {
                                    toast({ title: "Erro no upload", description: "Não foi possível enviar o arquivo.", variant: "destructive" });
                                }
                            } catch (err) {
                                toast({ title: "Erro técnico", description: "Falha na conexão.", variant: "destructive" });
                            } finally {
                                setLoading(false);
                            }
                        }}
                    />
                    <Button onClick={() => document.getElementById('direct-upload')?.click()} disabled={loading}>
                        <Upload className="mr-2 h-4 w-4" /> Enviar para Cloudinary
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Backups</CardTitle>
                        <Database className="h-4 w-4 text-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{backups.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Arquivos de backup
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Posts</CardTitle>
                        <FileText className="h-4 w-4 text-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPosts}</div>
                        <p className="text-xs text-muted-foreground">
                            Arquivos de posts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Serviços</CardTitle>
                        <HardDrive className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalServices}</div>
                        <p className="text-xs text-muted-foreground">
                            Arquivos de serviços
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Órfãos</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrphans}</div>
                        <p className="text-xs text-muted-foreground">
                            Arquivos não utilizados
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="backups" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="backups">Backups ({backups.length})</TabsTrigger>
                    <TabsTrigger value="posts">Posts ({postFiles.length})</TabsTrigger>
                    <TabsTrigger value="services">Serviços ({serviceFiles.length})</TabsTrigger>
                    <TabsTrigger value="cloudinary">Cloudinary ({cloudinaryFiles.length})</TabsTrigger>
                    <TabsTrigger value="orphans">Órfãos ({orphanFiles.length})</TabsTrigger>
                </TabsList>

                {/* Backups Tab */}
                <TabsContent value="backups" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Backups</CardTitle>
                            <CardDescription>
                                Backups realizados e armazenados localmente
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {backups.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Nenhum backup encontrado</p>
                                    <p className="text-sm">Crie backups na página de Backups</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {backups.map((backup, index) => {
                                        const Icon = getBackupIcon(backup.type);
                                        const color = getBackupColor(backup.type);

                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg bg-accent`}>
                                                        <Icon className={`h-5 w-5 ${color}`} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{backup.filename}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatBytes(backup.size)} • {' '}
                                                            {formatDistanceToNow(new Date(backup.createdAt), {
                                                                addSuffix: true,
                                                                locale: ptBR
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">
                                                        {backup.type.toUpperCase()}
                                                    </Badge>
                                                    <Button variant="ghost" size="icon">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Posts Files Tab */}
                <TabsContent value="posts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Arquivos de Posts</CardTitle>
                            <CardDescription>
                                Imagens e vídeos associados aos posts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {postFiles.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Nenhum arquivo de post encontrado</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {postFiles.map((item) => (
                                        <Card key={item.id} className="overflow-hidden">
                                            <div className="aspect-video bg-muted relative">
                                                {item.image?.exists ? (
                                                    <img
                                                        src={item.image.path}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                                                    </div>
                                                )}
                                            </div>
                                            <CardHeader>
                                                <CardTitle className="text-sm truncate">{item.title}</CardTitle>
                                                <CardDescription className="text-xs">
                                                    {item.image && formatBytes(item.image.size)}
                                                    {item.video && ' • Vídeo'}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Services Files Tab */}
                <TabsContent value="services" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Arquivos de Serviços</CardTitle>
                            <CardDescription>
                                Imagens associadas aos serviços
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {serviceFiles.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <HardDrive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Nenhum arquivo de serviço encontrado</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {serviceFiles.map((item) => (
                                        <Card key={item.id} className="overflow-hidden">
                                            <div className="aspect-video bg-muted relative">
                                                {item.image?.exists ? (
                                                    <img
                                                        src={item.image.path}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                                                    </div>
                                                )}
                                            </div>
                                            <CardHeader>
                                                <CardTitle className="text-sm truncate">{item.title}</CardTitle>
                                                <CardDescription className="text-xs">
                                                    {item.image && formatBytes(item.image.size)}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Cloudinary Tab */}
                <TabsContent value="cloudinary" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cloudinary Bucket</CardTitle>
                            <CardDescription>
                                Arquivos armazenados na cloud (Cloudinary)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {cloudinaryFiles.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Nenhum arquivo no Cloudinary</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {cloudinaryFiles.map((file: any, i: number) => (
                                        <Card key={i} className="overflow-hidden">
                                            <div className="aspect-square bg-muted relative">
                                                {file.resourceType === 'image' ? (
                                                    <img src={file.path} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <Video className="h-12 w-12" />
                                                    </div>
                                                )}
                                            </div>
                                            <CardHeader className="p-3">
                                                <CardTitle className="text-xs truncate" title={file.filename}>{file.filename}</CardTitle>
                                                <CardDescription className="text-[10px]">
                                                    {formatBytes(file.size)} • {file.format?.toUpperCase()}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Orphan Files Tab */}
                <TabsContent value="orphans" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Arquivos Órfãos</CardTitle>
                            <CardDescription>
                                Arquivos não associados a nenhum post ou serviço
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {orphanFiles.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Nenhum arquivo órfão encontrado</p>
                                    <p className="text-sm">Todos os arquivos estão sendo utilizados</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orphanFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-accent">
                                                    <File className="h-5 w-5 text-orange-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{file.filename}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatBytes(file.size)} • {' '}
                                                        {formatDistanceToNow(new Date(file.createdAt), {
                                                            addSuffix: true,
                                                            locale: ptBR
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
