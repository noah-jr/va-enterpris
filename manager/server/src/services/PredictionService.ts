import prisma from '../lib/prisma';


export class PredictionService {
    /**
     * Analisa o histórico de vendas e stock para sugerir optimizações.
     * Simula um motor de IA que detecta padrões de consumo.
     */
    static async getStockPredictions(companyId: string) {
        // Fetch products and recent sales (invoices)
        const [products, recentSales] = await Promise.all([
            prisma.product.findMany({ where: { companyId } }),
            prisma.invoiceItem.findMany({
                where: {
                    invoice: { companyId, status: 'PAID' },
                    createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
                }
            })
        ]);

        const insights = products.map(product => {
            const soldQuantity = recentSales
                .filter(item => item.productId === product.id)
                .reduce((sum, item) => sum + item.quantity, 0);

            const dailyRunRate = soldQuantity / 30;
            const daysLeft = product.stock > 0 ? product.stock / (dailyRunRate || 0.1) : 0;

            let recommendation = 'MANTER';
            let priority = 'LOW';

            if (product.stock <= product.minStock) {
                recommendation = 'RECOMPOR URGENTE';
                priority = 'CRITICAL';
            } else if (daysLeft < 7) {
                recommendation = 'ENCOMENDAR';
                priority = 'HIGH';
            } else if (soldQuantity === 0 && product.stock > 50) {
                recommendation = 'PROMOÇÃO / LIQUIDAÇÃO';
                priority = 'MEDIUM';
            }

            return {
                productId: product.id,
                productName: product.name,
                currentStock: product.stock,
                soldLast30Days: soldQuantity,
                estimatedDaysLeft: Math.round(daysLeft),
                recommendation,
                priority,
                confidence: 0.85 + (Math.random() * 0.1) // Simulação de confiança da IA
            };
        });

        return insights.filter(i => i.priority !== 'LOW' || i.soldLast30Days > 0);
    }
}
