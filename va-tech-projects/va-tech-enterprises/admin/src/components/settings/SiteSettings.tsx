"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Globe, Mail, Phone, MapPin } from "lucide-react";

export default function SiteSettings() {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Informações do Site</CardTitle>
                    <CardDescription>Configure as informações básicas do seu site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="siteName">Nome do Site</Label>
                            <Input
                                id="siteName"
                                defaultValue="VA - Tecnologia & Marketing"
                                placeholder="Nome da empresa"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="siteUrl">URL do Site</Label>
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="siteUrl"
                                    defaultValue="https://va-tech.com"
                                    placeholder="https://seusite.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="siteDescription">Descrição</Label>
                        <Textarea
                            id="siteDescription"
                            defaultValue="Soluções em tecnologia, segurança e marketing digital."
                            placeholder="Breve descrição do site"
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Email de Contacto</Label>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="contactEmail"
                                    type="email"
                                    defaultValue="contato@va-tech.com"
                                    placeholder="email@empresa.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">Telefone</Label>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="contactPhone"
                                    defaultValue="+351 123 456 789"
                                    placeholder="+351 XXX XXX XXX"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Endereço</Label>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <Input
                                id="address"
                                defaultValue="Lisboa, Portugal"
                                placeholder="Cidade, País"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button>Salvar Configurações</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Redes Sociais</CardTitle>
                    <CardDescription>Links para suas redes sociais.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="facebook">Facebook</Label>
                            <Input
                                id="facebook"
                                placeholder="https://facebook.com/..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="instagram">Instagram</Label>
                            <Input
                                id="instagram"
                                placeholder="https://instagram.com/..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn</Label>
                            <Input
                                id="linkedin"
                                placeholder="https://linkedin.com/company/..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="twitter">Twitter/X</Label>
                            <Input
                                id="twitter"
                                placeholder="https://twitter.com/..."
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button>Salvar Redes Sociais</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
