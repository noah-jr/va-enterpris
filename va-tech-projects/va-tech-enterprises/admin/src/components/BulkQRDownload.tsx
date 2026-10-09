"use client";

import { useState } from "react";
import { Download, Loader2, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

interface User {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
}

interface BulkQRDownloadProps {
    users: any[]; // Use any to accept Prisma User type which is compatible
}

export function BulkQRDownload({ users }: BulkQRDownloadProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    // Helper to create circular image for PDF
    const createCircularImage = async (imageUrl: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const size = Math.min(img.width, img.height);
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");
                if (!ctx) return resolve(imageUrl);

                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                // Draw image centered and cropped
                const x = (img.width - size) / 2;
                const y = (img.height - size) / 2;
                ctx.drawImage(img, x, y, size, size, 0, 0, size, size);

                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = () => resolve(""); // Return empty if fails
            img.src = imageUrl;
        });
    };

    const addLogoToQR = async (qrDataUrl: string, logoUrl: string): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve(qrDataUrl);

            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const logo = new Image();
                logo.crossOrigin = "anonymous";
                logo.onload = () => {
                    const logoSize = img.width * 0.2; // 20% size
                    const x = (img.width - logoSize) / 2;
                    const y = (img.height - logoSize) / 2;

                    // Clear area for logo (excavate)
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(x, y, logoSize, logoSize);

                    ctx.drawImage(logo, x, y, logoSize, logoSize);
                    resolve(canvas.toDataURL("image/png"));
                };
                logo.onerror = () => resolve(qrDataUrl);
                logo.src = logoUrl;
            };
            img.onerror = () => resolve(qrDataUrl);
            img.src = qrDataUrl;
        });
    };

    const generateBulkPDF = async () => {
        if (users.length === 0) {
            toast.error("Nenhum utilizador selecionado");
            return;
        }

        setIsGenerating(true);
        const toastId = toast.loading("A gerar Badges...");

        try {
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const baseUrl = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "https://vatech.com");

            // Card Standard ID-1 Size (CR80)
            const cardWidth = 85.6;
            const cardHeight = 53.98;

            // Grid settings
            const startX = 15;
            const startY = 15;
            const gapX = 10; // Horizontal gap
            const gapY = 10; // Vertical gap

            let x = startX;
            let y = startY;

            // Preload logo and background
            const logoUrl = "/images/va-logo.png";
            const bgUrl = "/images/id-card-bg.png";

            // Load background image first to ensure it's available
            await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve; // Continue even if bg fails, though it shouldn't
                img.src = bgUrl;
            });

            for (let i = 0; i < users.length; i++) {
                const user = users[i] as User;
                const loginUrl = `${baseUrl}/login?email=${encodeURIComponent(user.email)}&qr=true`;

                // 1. Prepare QR Code
                const qrDataUrl = await QRCode.toDataURL(loginUrl, {
                    margin: 0,
                    width: 200,
                    errorCorrectionLevel: 'H',
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                const qrWithLogo = await addLogoToQR(qrDataUrl, logoUrl);

                // 2. Prepare User Photo
                let userPhotoUrl = "/images/placeholder.svg"; // Fallback
                if (user.image && user.image.trim() !== "") {
                    userPhotoUrl = await createCircularImage(user.image);
                }

                // Check page break
                if (y + cardHeight > 280) {
                    doc.addPage();
                    x = startX;
                    y = startY;
                }

                // --- Draw Card ---

                // A. Background
                try {
                    doc.addImage(bgUrl, 'PNG', x, y, cardWidth, cardHeight);
                } catch (e) {
                    doc.setFillColor(0, 0, 0);
                    doc.rect(x, y, cardWidth, cardHeight, 'F');
                }

                // B. User Photo
                const photoSize = 32;
                const photoX = x + 6;
                const photoY = y + 14;

                if (userPhotoUrl) {
                    try {
                        doc.addImage(userPhotoUrl, 'PNG', photoX, photoY, photoSize, photoSize);
                    } catch (e) {
                        console.error("Failed to add user photo", e);
                    }
                }

                // C. Text Info
                doc.setTextColor(255, 255, 255);

                // Name (Uppercase, Bold)
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                const textX = x + 42;
                let textY = y + 35;

                doc.text((user.name || "SEM NOME").toUpperCase(), textX, textY);

                // Role / Title
                textY += 5;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.text((user.role || "MEMBRO").toUpperCase(), textX, textY);

                // Extra line (Email or ID)
                textY += 4;
                doc.setFontSize(6);
                doc.setTextColor(200, 200, 200);
                doc.text(user.email, textX, textY);


                // D. QR Code
                const qrSize = 18;
                const qrX = x + cardWidth - qrSize - 4; // 4mm padding from right
                const qrY = y + cardHeight - qrSize - 4; // 4mm padding from bottom

                doc.addImage(qrWithLogo, 'PNG', qrX, qrY, qrSize, qrSize);

                // --- End Card ---

                // Update Grid Position
                if (x + cardWidth + gapX > 200) {
                    x = startX;
                    y += cardHeight + gapY;
                } else {
                    x += cardWidth + gapX;
                }
            }

            doc.save(`VA-BADGES-${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("Badges gerados com sucesso!", { id: toastId });
        } catch (error) {
            console.error("Error generating bulk QR:", error);
            toast.error("Erro ao gerar PDF", { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            onClick={generateBulkPDF}
            disabled={isGenerating}
            variant="outline"
            className="rounded-full border-primary/20 hover:bg-primary/5 gap-2"
        >
            {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
                <FileCheck className="h-4 w-4 text-primary" />
            )}
            Download Badges
        </Button>
    );
}
