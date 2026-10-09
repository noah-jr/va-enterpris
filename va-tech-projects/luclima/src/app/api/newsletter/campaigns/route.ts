import { NextRequest, NextResponse } from 'next/server';
import { newsletterCampaignRepository, newsletterRepository } from '@/infrastructure/repositories';

export async function GET(request: NextRequest) {
    try {
        const campaigns = await newsletterCampaignRepository.findAll();
        return NextResponse.json({ campaigns }, { status: 200 });
    } catch (error) {
        console.error('Get campaigns error:', error);
        return NextResponse.json({ error: 'Erro ao obter campanhas' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subject, content } = body;

        if (!subject || !content) {
            return NextResponse.json({ error: 'Assunto e conteúdo são obrigatórios' }, { status: 400 });
        }

        // Create the campaign record
        const campaign = await newsletterCampaignRepository.create({ subject, content });

        // Get all active subscribers
        const subscribers = await newsletterRepository.findAll({ isActive: true });

        // Simulate sending emails
        console.log(`Sending campaign "${subject}" to ${subscribers.length} subscribers...`);

        // In a real application, you would iterate and send emails here
        // for (const sub of subscribers) { await sendEmail(sub.email, subject, content); }

        // Mark as sent
        const updatedCampaign = await newsletterCampaignRepository.update(campaign.id, new Date());

        return NextResponse.json({
            message: `Campanha enviada para ${subscribers.length} subscritores`,
            campaign: updatedCampaign
        }, { status: 201 });
    } catch (error) {
        console.error('Send campaign error:', error);
        return NextResponse.json({ error: 'Erro ao enviar campanha' }, { status: 500 });
    }
}
