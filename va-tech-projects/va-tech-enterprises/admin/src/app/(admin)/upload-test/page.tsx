'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Cloud, Zap, Shield, Globe } from 'lucide-react';

export default function UploadTestPage() {
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

    const handleUploadComplete = (url: string) => {
        setUploadedFiles((prev) => [...prev, url]);
    };

    return (
        <div className="tesla-container py-10 px-4 max-w-6xl">
            {/* Header */}
            <div className="text-center mb-10">
                <Badge className="mb-4" variant="outline">
                    <Cloud className="w-3 h-3 mr-1" />
                    Cloudinary Integration
                </Badge>
                <h1 className="text-4xl font-bold mb-4">
                    Sistema de Upload de Arquivos
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Upload de arquivos para a nuvem usando Cloudinary com CDN global,
                    otimização automática e transformações on-the-fly.
                </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-4 gap-4 mb-10">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                        <h3 className="font-semibold mb-1">Rápido</h3>
                        <p className="text-sm text-muted-foreground">
                            CDN global para entrega instantânea
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Shield className="w-8 h-8 mx-auto mb-2 text-foreground" />
                        <h3 className="font-semibold mb-1">Seguro</h3>
                        <p className="text-sm text-muted-foreground">
                            Validação e autenticação obrigatória
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Globe className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <h3 className="font-semibold mb-1">Global</h3>
                        <p className="text-sm text-muted-foreground">
                            Disponível em qualquer lugar do mundo
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-foreground" />
                        <h3 className="font-semibold mb-1">Otimizado</h3>
                        <p className="text-sm text-muted-foreground">
                            Compressão e formato automático
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Upload Tabs */}
            <Tabs defaultValue="general" className="mb-10">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general">Geral</TabsTrigger>
                    <TabsTrigger value="projects">Projetos</TabsTrigger>
                    <TabsTrigger value="team">Equipe</TabsTrigger>
                    <TabsTrigger value="blog">Blog</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Geral</CardTitle>
                            <CardDescription>
                                Upload de arquivos para a pasta geral (va-uploads)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FileUpload
                                onUploadComplete={handleUploadComplete}
                                folder="va-uploads"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="projects" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload de Projetos</CardTitle>
                            <CardDescription>
                                Upload de imagens para a galeria de projetos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FileUpload
                                onUploadComplete={handleUploadComplete}
                                folder="projects"
                                accept="image/*"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="team" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload de Membros da Equipe</CardTitle>
                            <CardDescription>
                                Upload de fotos dos membros da equipe
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FileUpload
                                onUploadComplete={handleUploadComplete}
                                folder="team-members"
                                accept="image/*"
                                maxSizeMB={5}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="blog" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload de Blog</CardTitle>
                            <CardDescription>
                                Upload de imagens e documentos para posts do blog
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FileUpload
                                onUploadComplete={handleUploadComplete}
                                folder="blog"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Arquivos Enviados ({uploadedFiles.length})</CardTitle>
                        <CardDescription>
                            Histórico de uploads desta sessão
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {uploadedFiles.map((url, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                                >
                                    <div className="flex-shrink-0">
                                        {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                            <img
                                                src={url}
                                                alt={`Upload ${index + 1}`}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center">
                                                <Cloud className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                                            Upload #{index + 1}
                                        </p>
                                        <p className="text-xs text-gray-500 font-mono truncate">
                                            {url}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(url);
                                        }}
                                        className="px-3 py-1 text-sm bg-foreground text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Copiar URL
                                    </button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Info */}
            <Card className="mt-10 border-blue-200 dark:border-blue-800 bg-muted/30 dark:bg-muted/20">
                <CardHeader>
                    <CardTitle className="text-blue-900 dark:text-blue-100">
                        ℹ️ Informações
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                    <p>
                        <strong>Tamanho máximo:</strong> 10MB por arquivo
                    </p>
                    <p>
                        <strong>Tipos permitidos:</strong> Imagens (JPEG, PNG, GIF, WebP),
                        Vídeos (MP4, WebM), PDF
                    </p>
                    <p>
                        <strong>Organização:</strong> Arquivos são organizados em pastas
                        no Cloudinary
                    </p>
                    <p>
                        <strong>CDN:</strong> Todos os arquivos são servidos via CDN global
                        para máxima performance
                    </p>
                    <p>
                        <strong>Otimização:</strong> Imagens são automaticamente otimizadas
                        e convertidas para formatos modernos (WebP, AVIF)
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
