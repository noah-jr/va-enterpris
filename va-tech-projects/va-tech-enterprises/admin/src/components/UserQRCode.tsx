"use client";

import { useState } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { QrCode, X, Copy, Check, Download } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRef } from "react";

interface UserQRCodeProps {
    email: string;
    name: string;
}

export function UserQRCode({ email, name }: UserQRCodeProps) {
    const [copied, setCopied] = useState(false);

    // Get the base URL from the window or use a default
    // In production this should be the actual domain
    const getBaseUrl = () => {
        if (typeof window !== "undefined") {
            return window.location.origin;
        }
        return process.env.NEXT_PUBLIC_APP_URL || "https://vatech.com";
    };

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const loginUrl = `${getBaseUrl()}/login?email=${encodeURIComponent(email)}&qr=true`;

    const handleCopy = () => {
        navigator.clipboard.writeText(loginUrl);
        setCopied(true);
        toast.success("Link de login copiado!");
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadQr = () => {
        const canvas = document.getElementById(`qr-canvas-${email}`) as HTMLCanvasElement;
        if (!canvas) {
            toast.error("Erro ao gerar imagem");
            return;
        }

        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `qr-code-${email}.png`;
        link.href = url;
        link.click();
        toast.success("QR Code descarregado!");
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-blue-500 hover:text-blue-600 hover:bg-blue-500/10">
                    <QrCode className="h-3.5 w-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-primary" />
                        Código QR de Acesso
                    </DialogTitle>
                    <DialogDescription>
                        Acesso rápido para {name}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-6 space-y-6">
                    <div className="p-4 bg-white rounded-2xl shadow-inner border border-border/50 relative group">
                        <QRCodeSVG
                            value={loginUrl}
                            size={200}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: "/images/va-logo.png",
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                        {/* Hidden canvas for downloading */}
                        <div className="hidden">
                            <QRCodeCanvas
                                id={`qr-canvas-${email}`}
                                value={loginUrl}
                                size={512}
                                level="H"
                                includeMargin={true}
                                imageSettings={{
                                    src: "/images/va-logo.png",
                                    x: undefined,
                                    y: undefined,
                                    height: 100,
                                    width: 100,
                                    excavate: true,
                                }}
                            />
                        </div>

                        <Button
                            onClick={downloadQr}
                            className="absolute -bottom-2 -right-2 rounded-full h-10 w-10 shadow-lg animate-in fade-in zoom-in duration-300"
                            size="icon"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="w-full space-y-2">
                        <p className="text-xs font-medium text-muted-foreground text-center">
                            Ao escanear este código, o campo de email será preenchido automaticamente.
                        </p>
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border/50">
                            <code className="text-[10px] flex-1 truncate text-muted-foreground">
                                {loginUrl}
                            </code>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCopy}>
                                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
