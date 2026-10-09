
import prisma from '../lib/prisma';
import { InvoiceModel } from '../models/InvoiceModel';
import { PLANS } from '../config/plans';
import { AuditService } from './AuditService';
import { NotificationService } from './NotificationService';

const PLATFORM_COMPANY_ID = 'c8b9bfce-bed1-4aa9-a665-51b13c21e438'; // VA ONEGEST System

export class SaasService {
    /**
     * Activa ou renova uma subscrição e gera a factura correspondente da plataforma
     */
    static async processSubscriptionPayment(companyId: string, planId: string, billing: 'MONTHLY' | 'ANNUAL' | 'DAILY' = 'MONTHLY') {
        const planDef = PLANS[planId as keyof typeof PLANS];
        if (!planDef) throw new Error('Plano inválido');

        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: { subscriptions: { where: { status: 'ACTIVE' }, orderBy: { endDate: 'desc' }, take: 1 } }
        });

        if (!company) throw new Error('Empresa não encontrada');

        const price = billing === 'ANNUAL' ? planDef.annualPrice : planDef.price;
        
        // 1. Calculate dates
        let startDate = new Date();
        const activeSub = company.subscriptions[0];

        if (activeSub && activeSub.endDate > new Date()) {
            startDate = new Date(activeSub.endDate);
        }

        const endDate = new Date(startDate);
        if (billing === 'ANNUAL') endDate.setFullYear(endDate.getFullYear() + 1);
        else if (billing === 'DAILY') endDate.setDate(endDate.getDate() + 1);
        else endDate.setMonth(endDate.getMonth() + 1);

        // 2. Perform DB Updates
        const result = await prisma.$transaction(async (tx) => {
            // Cancel others
            await tx.subscription.updateMany({
                where: { companyId, status: 'ACTIVE' },
                data: { status: 'CANCELLED' }
            });

            // Create new sub
            const newSub = await tx.subscription.create({
                data: {
                    companyId,
                    plan: planId,
                    status: 'ACTIVE',
                    startDate,
                    endDate,
                    price
                }
            });

            // Update company modules
            await tx.company.update({
                where: { id: companyId },
                data: { enabledModules: planDef.modules, status: 'ACTIVE' }
            });

            // 3. GENERATE PLATFORM INVOICE (VA-ONE-GEST to Client)
            
            // Garantir que a empresa "Plataforma" existe na base de dados
            const platformExists = await tx.company.findUnique({ where: { id: PLATFORM_COMPANY_ID } });
            if (!platformExists) {
                const platformNif = process.env.PLATFORM_NIF;
                if (!platformNif) {
                    throw new Error('A variável de ambiente PLATFORM_NIF não está definida. Configure o NIF real da plataforma no .env');
                }

                await tx.company.create({
                    data: {
                        id: PLATFORM_COMPANY_ID,
                        name: 'VA ONEGEST System',
                        nif: platformNif,
                        status: 'ACTIVE'
                    }
                });
            }

            // Ensure the Buyer is a "Client" in the Platform's database
            let platformClientRecord = await tx.client.findFirst({
                where: { companyId: PLATFORM_COMPANY_ID, nif: company.nif }
            });

            if (!platformClientRecord) {
                platformClientRecord = await tx.client.create({
                    data: {
                        companyId: PLATFORM_COMPANY_ID,
                        name: company.name,
                        nif: company.nif,
                        email: (company as any).email,
                        address: (company as any).address,
                        phone: (company as any).phone
                    }
                });
            }

            // Generate Invoice via InvoiceModel (which handles Hash + Sequencing)
            const invoiceType = 'FT'; // Fatura
            const nextNumber = await InvoiceModel.getNextInvoiceNumber(PLATFORM_COMPANY_ID, invoiceType, tx);
            
            const invoice = await InvoiceModel.createInvoice(
                {
                    companyId: PLATFORM_COMPANY_ID,
                    clientId: platformClientRecord.id,
                    type: invoiceType,
                    number: nextNumber,
                    status: 'PAID',
                    totalAmount: price * 1.14,
                    totalVat: price * 0.14, // 14% VAT (standard AO)
                    issueDate: new Date(),
                    dueDate: new Date(),
                } as any,
                [
                    {
                        productName: `Assinatura SaaS: ${planDef.name}`,
                        productCode: planId,
                        quantity: 1,
                        unitPrice: price,
                        vatRate: 14,
                        totalAmount: price * 1.14,
                        description: `Período: ${startDate.toLocaleDateString()} a ${endDate.toLocaleDateString()}`
                    } as any
                ],
                tx
            );

            return { newSub, invoice };
        });


        // 4. EMIT REAL-TIME NOTIFICATIONS
        const notificationPayload = {
            message: `Subscrição de Plano ${planDef.name} (${billing}) activada com sucesso.`,
            companyName: company.name,
            invoiceNumber: result.invoice.number,
            planName: planDef.name,
            endDate: endDate
        };

        // Notify the company specifically
        NotificationService.notifyCompany(companyId, 'subscription_activated', notificationPayload);

        // Notify SuperAdmins about the new revenue/subscription
        NotificationService.notifySuperAdmin('new_revenue', {
            ...notificationPayload,
            amount: price,
            nif: company.nif
        });

        await AuditService.log({
            companyId: companyId,
            action: 'SUBSCRIPTION_RENEWED_AUTO',
            entity: 'Subscription',
            entityId: result.newSub.id,
            details: `Auto-activation for ${planId} (${billing}). Invoice: ${result.invoice.number}`
        });

        console.log(`[SaasService] Auto-Activated plan for ${company.name}. Invoice generated: ${result.invoice.number}`);
        return result;
    }
}

