import { Request, Response } from 'express';

export class TaxpayerController {
    static async getTaxpayerData(req: Request, res: Response) {
        try {
            const { nif } = req.params;

            if (!nif) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'O NIF/BI é obrigatório' 
                });
            }

            const url = `https://invoice.minfin.gov.ao/commonServer/common/taxpayer/get/${nif}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Referer': 'https://invoice.minfin.gov.ao/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[TaxpayerAPI] status: ${response.status}, payload:`, errorText);
                return res.status(response.status).json({ 
                    success: false, 
                    error: `A base de dados do Minfin recusou a ligação (${response.status}). Tente novamente mais tarde.` 
                });
            }

            const data = await response.json();

            if (!data.success || !data.data) {
                return res.status(404).json({
                    success: false,
                    error: data.error || 'Contribuinte não encontrado ou NIF inválido'
                });
            }

            // Mapeamento dos campos do Minfin para o nosso sistema
            const taxpayer = data.data;
            const mappedData = {
                nif: taxpayer.nif,
                name: taxpayer.companyName || taxpayer.gsmc || taxpayer.nameAbb,
                address: taxpayer.addressDbb || taxpayer.nsrdz,
                phone: taxpayer.lxfs || '',
                email: taxpayer.email || '',
                status: taxpayer.hdzt, // active / inactive
                isCompany: taxpayer.tap_type_code !== 'TIPO1', // TIPO1 geralmente é singular/BI
                vatRegime: taxpayer.regimeIva,
                typeCode: taxpayer.tap_type_code
            };

            return res.json({
                success: true,
                data: mappedData
            });

        } catch (error: any) {
            console.error('Error fetching taxpayer data:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Erro interno ao processar a consulta do contribuinte',
                details: error.message
            });
        }
    }
}
