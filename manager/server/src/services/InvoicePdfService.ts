import PDFDocument from 'pdfkit';
import { Response } from 'express';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import { SigningService } from './SigningService';
import { FormatUtils } from '../utils/formatUtils';

/**
 * InvoicePdfService — Gerador de Documentos Fiscais em PDF (AGT-Compliant)
 * 
 * Implementa o Ponto 6 do Anexo I (Processo de impressão de documentos).
 */
export class InvoicePdfService {
    private static readonly ACCENT_COLOR = '#0f172a'; // Slate 900 (Professional/Institutional)
    private static readonly TEXT_PRIMARY = '#0f172a'; 
    private static readonly TEXT_SECONDARY = '#64748b'; 
    private static readonly BORDER_COLOR = '#e2e8f0'; 
    private static readonly BG_MUTED = '#f8fafc'; 

    static async generateInvoice(invoice: any, res: Response, appUrl?: string) {
        const doc = new PDFDocument({ 
            margin: 40, 
            size: 'A4',
            info: {
                Title: `${invoice.type === 'FT' ? 'Fatura' : 'Fatura Recibo'} ${invoice.number}`,
                Author: 'VA OneGest Sovereign OS',
            }
        });

        const safeFilename = `invoice_${invoice.number.replace(/[\/\s]/g, '_')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${safeFilename}`);

        doc.pipe(res);

        // --- DADOS PARA QR CODE (AGT COMPLIANT) ---
        const nifEmissor = invoice.company?.nif || '000000000';
        const docNo = invoice.number;
        const qrData = `https://quiosqueagt.minfin.gov.ao/facturacao-eletronica/consultar-fe?emissor=${nifEmissor}&document=${encodeURIComponent(docNo)}`;
        
        const qrCodeBuffer = await QRCode.toBuffer(qrData, {
            margin: 1,
            width: 100,
            color: { dark: '#000000', light: '#ffffff' }
        });

        let y = 40;
        const marginX = 40;
        const col2X = 300;

        // --- CABEÇALHO DIREITO ---
        let title = 'DOCUMENTO';
        if (invoice.type === 'FT') title = 'FATURA';
        else if (invoice.type === 'FR') title = 'FATURA-RECIBO';
        else if (invoice.type === 'PP') title = 'FATURA PRÓ-FORMA';

        const rightAlignOptions = { width: 220, align: 'right' as const };
        
        doc.fontSize(10).font('Helvetica-Bold').fillColor(this.TEXT_SECONDARY).text('ORIGINAL', 335, y, rightAlignOptions);
        doc.fontSize(20).font('Helvetica-Bold').fillColor(this.TEXT_PRIMARY).text(title, 335, y + 15, rightAlignOptions);
        
        // Caixa Preta para o Número
        doc.rect(405, y + 40, 150, 30).fill(this.TEXT_PRIMARY);
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#ffffff').text(invoice.number, 405, y + 48, { width: 150, align: 'center' });
        
        if (invoice.company?.logo) {
            try {
                if (invoice.company.logo.startsWith('http')) {
                    const response = await fetch(invoice.company.logo);
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    doc.image(buffer, marginX, y, { height: 50 });
                } else {
                    doc.image(invoice.company.logo, marginX, y, { height: 50 });
                }
            } catch (err) {
                this.drawPlatformLogo(doc, marginX, y);
            }
        } else {
            this.drawPlatformLogo(doc, marginX, y);
        }

        y += 70;

        doc.fontSize(10).font('Helvetica-Bold').fillColor(this.TEXT_PRIMARY).text(invoice.company?.name.toUpperCase(), marginX, y);
        doc.fontSize(8).font('Helvetica').fillColor(this.TEXT_SECONDARY);
        doc.text(`Contribuinte Nº: ${invoice.company?.nif}`, marginX, y + 15);
        doc.text(`Telefone: ${invoice.company?.phone || 'N/A'}`, marginX, y + 25);
        doc.text(`Email: ${invoice.company?.email || 'N/A'}`, marginX, y + 35);
        doc.text(invoice.company?.address || 'Angola', marginX, y + 45, { width: 220 });

        doc.fontSize(9).font('Helvetica-Bold').fillColor(this.TEXT_SECONDARY).text('Exmo.(s) Sr.(s)', col2X, y);
        doc.fontSize(10).font('Helvetica-Bold').fillColor(this.TEXT_PRIMARY).text((invoice.client?.name || invoice.customerName || 'CONSUMIDOR FINAL').toUpperCase(), col2X, y + 15);
        doc.fontSize(8).font('Helvetica').fillColor(this.TEXT_SECONDARY);
        doc.text(invoice.client?.address || invoice.customerAddress || 'Endereço não especificado', col2X, y + 30, { width: 250 });
        doc.text(`NIF: ${invoice.client?.nif || invoice.customerNif || '999999999'}`, col2X, y + 55);

        y += 85;

        doc.rect(marginX, y, 515, 20).fill(this.BG_MUTED);
        doc.fontSize(8).font('Helvetica-Bold').fillColor(this.TEXT_PRIMARY);
        doc.text('Documento', marginX + 10, y + 6);
        doc.text('Data Emissão', marginX + 140, y + 6);
        doc.text('Data Vencimento', marginX + 260, y + 6);
        doc.text('Contribuinte', marginX + 380, y + 6);

        y += 20;
        doc.fontSize(8).font('Helvetica').text(invoice.number, marginX + 10, y + 6);
        doc.text(format(new Date(invoice.issueDate), 'yyyy-MM-dd'), marginX + 140, y + 6);
        doc.text(format(new Date(invoice.dueDate), 'yyyy-MM-dd'), marginX + 260, y + 6);
        doc.text(invoice.client?.nif || invoice.customerNif || '999999999', marginX + 380, y + 6);

        y += 40;

        const tableHeaders = ['Descrição', 'Cód.Prod', 'Preço Uni', 'Unid', 'Qtd', 'Taxa %', 'Total S/Imp'];
        const colWidths = [180, 60, 80, 40, 40, 40, 75];
        const colPositions = [marginX, marginX + 180, marginX + 240, marginX + 320, marginX + 360, marginX + 400, marginX + 440];

        doc.rect(marginX, y, 515, 1.5).fill(this.TEXT_PRIMARY);
        doc.fontSize(8).font('Helvetica-Bold').fillColor(this.TEXT_PRIMARY);
        tableHeaders.forEach((h, i) => {
            doc.text(h, colPositions[i] + 5, y + 6, { width: colWidths[i], align: i > 1 && i !== 3 && i !== 4 ? 'right' : 'left' });
        });

        y += 20;
        invoice.items.forEach((item: any) => {
            doc.fontSize(8).font('Helvetica').fillColor(this.TEXT_PRIMARY);
            const desc = (item.description || item.product?.name || 'ITEM').toUpperCase();
            doc.text(desc, colPositions[0] + 5, y, { width: colWidths[0] });
            doc.text(item.productCode || '0000', colPositions[1] + 5, y);
            doc.text(FormatUtils.formatCurrency(item.unitPrice).replace(' Kz', ''), colPositions[2], y, { width: colWidths[2], align: 'right' });
            doc.text((item.product?.unit || 'UNI').toUpperCase(), colPositions[3], y, { width: colWidths[3], align: 'center' });
            doc.text(item.quantity.toString(), colPositions[4], y, { width: colWidths[4], align: 'center' });
            doc.text(`${item.vatRate},00`, colPositions[5], y, { width: colWidths[5], align: 'center' });
            doc.font('Helvetica-Bold').text(FormatUtils.formatCurrency(item.quantity * item.unitPrice).replace(' Kz', ''), colPositions[6], y, { width: colWidths[6], align: 'right' });
            
            y += 15;
            if (y > 650) { doc.addPage(); y = 50; }
        });

        y += 20;

        doc.fontSize(8).font('Helvetica-Bold').text('Quadro Resumo de Imposto', marginX, y);
        y += 12;
        doc.rect(marginX, y, 250, 15).fill(this.BG_MUTED);
        doc.fillColor(this.TEXT_PRIMARY).text('DESCRIÇÃO', marginX + 5, y + 4);
        doc.text('INCIDÊNCIA', marginX + 100, y + 4, { align: 'right', width: 70 });
        doc.text('IMPOSTO', marginX + 175, y + 4, { align: 'right', width: 70 });
        
        y += 15;
        const totalNet = invoice.totalAmount - invoice.totalVat;
        doc.fontSize(8).font('Helvetica').text(invoice.totalVat > 0 ? 'IVA 14%' : 'Isento', marginX + 5, y + 4);
        doc.text(FormatUtils.formatCurrency(totalNet).replace(' Kz', ''), marginX + 100, y + 4, { align: 'right', width: 70 });
        doc.text(FormatUtils.formatCurrency(invoice.totalVat).replace(' Kz', ''), marginX + 175, y + 4, { align: 'right', width: 70 });

        const totalYStart = y - 15;
        const totalLabelX = 350;
        const totalValueX = 460;

        doc.fontSize(9).font('Helvetica').fillColor(this.TEXT_SECONDARY);
        doc.text('Total Ilíquido:', totalLabelX, totalYStart);
        doc.text(FormatUtils.formatCurrency(totalNet), totalValueX, totalYStart, { align: 'right', width: 100 });
        doc.text('Total Desconto:', totalLabelX, totalYStart + 15);
        doc.text('0,00 Kz', totalValueX, totalYStart + 15, { align: 'right', width: 100 });
        doc.text('Total Imposto:', totalLabelX, totalYStart + 30);
        doc.text(FormatUtils.formatCurrency(invoice.totalVat), totalValueX, totalYStart + 30, { align: 'right', width: 100 });

        doc.fontSize(11).font('Helvetica-Bold').fillColor(this.TEXT_PRIMARY);
        doc.text('Total (Kz)', totalLabelX, totalYStart + 55);
        doc.text(FormatUtils.formatCurrency(invoice.totalAmount), totalValueX, totalYStart + 55, { align: 'right', width: 100 });

        y += 60;
        doc.fontSize(8).font('Helvetica-Bold').text(FormatUtils.formatExtenso(invoice.totalAmount).toUpperCase(), marginX, y);

        y += 30;

        if (invoice.company?.bankAccounts && invoice.company.bankAccounts.length > 0) {
            doc.fontSize(8).font('Helvetica-Bold').text('Coordenadas Bancárias', marginX, y);
            y += 12;
            invoice.company.bankAccounts.forEach((ba: any) => {
                doc.fontSize(7).font('Helvetica').text(`${ba.bank}: ${ba.iban}`, marginX, y);
                y += 10;
            });
        }

        const footerY = 720;
        doc.image(qrCodeBuffer, marginX, footerY, { width: 80 });

        const certY = footerY + 10;
        const hashPrefix = (invoice.hash || '').substring(0, 4);
        doc.fontSize(8).font('Helvetica-Bold').fillColor(this.TEXT_PRIMARY);
        doc.text(`${hashPrefix} - Processado por Programa Validado nº 232/AGT/2026`, marginX + 90, certY);
        doc.fontSize(7).font('Helvetica').fillColor(this.TEXT_SECONDARY);
        doc.text(`Numeração Interna: ${invoice.number} Impresso em ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, marginX + 90, certY + 15);
        doc.text('Software VA OneGest Sovereign v2.1 // Módulo: COMERCIAL // Regime: Geral', marginX + 90, certY + 25);
        doc.text(`IDENTIFICADOR HASH: ${invoice.hash || 'DRAFT'}`, marginX + 90, certY + 35);
        
        // AGT BRANDING IN FOOTER
        doc.fontSize(7).font('Helvetica-Bold').fillColor(this.TEXT_SECONDARY).text('Certificação Digital', 480, footerY + 10, { align: 'right' });
        doc.fontSize(9).font('Helvetica-Bold').fillColor(this.TEXT_PRIMARY).text('AGT ANGOLA', 480, footerY + 20, { align: 'right' });
        doc.fontSize(8).font('Helvetica-Bold').text('Regime: Geral', 480, footerY + 35, { align: 'right' });

        doc.end();
    }

    private static drawPlatformLogo(doc: any, x: number, y: number) {
        try {
            const fs = require('fs');
            const path = require('path');
            const fallbackLogoPath = path.resolve(process.cwd(), 'logo_full.png');
            console.log(fallbackLogoPath)
            if (fs.existsSync(fallbackLogoPath)) {
                doc.image(fallbackLogoPath, x, y, { height: 45 });
                return;
            }
        } catch (e) {
            // Ignorar e usar fallback desenhado se o ficheiro não estiver acessível
        }

        doc.save()
           .roundedRect(x, y, 50, 50, 12)
           .fill('#1e293b');
        doc.fontSize(20)
           .fillColor('#ffffff')
           .font('Helvetica-Bold')
           .text('VA', x + 11, y + 18);
        doc.fontSize(6)
           .fillColor('#94a3b8')
           .text('ONEGEST', x + 5, y + 40);
        doc.restore();
    }
}
