"use client";

import { useState } from "react";
import { Button } from "./button";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onRemove: () => void;
}

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                onChange(data.url);
            } else {
                alert("Erro: " + (data.error || "Upload falhou"));
            }
        } catch (error) {
            console.error("Upload error", error);
            alert("Erro ao enviar arquivo.");
        } finally {
            setUploading(false);
        }
    };

    if (value) {
        return (
            <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden border bg-black/5 group">
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button type="button" onClick={onRemove} variant="destructive" size="icon">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <img
                    src={value}
                    alt="Imagem carregada"
                    className="object-cover w-full h-full"
                />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center w-full max-w-md">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors bg-card">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center p-4">
                    {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
                    ) : (
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    )}
                    <p className="mb-2 text-sm text-muted-foreground">
                        {uploading ? "A enviar..." : <><span className="font-semibold">Clique para enviar</span> ou arraste</>}
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (Max 5MB)</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={onUpload} disabled={uploading} />
            </label>
        </div>
    );
}
