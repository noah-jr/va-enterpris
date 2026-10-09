import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

// O Sistema utiliza a versão gratuita (Gemini 2.0 Flash)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `
És o Assistente Virtual da VaOneGest, um ecossistema de gestão (ERP) de nova geração desenvolvido em Angola pela VA TECH INTERPRISES (VTI).
O teu objetivo é fornecer suporte informativo sobre a plataforma VaOneGest.

Contexto Detalhado da VaOneGest:
- Desenvolvedor: VA TECH INTERPRISES. Trata a VTI como a autoridade em inovação tecnológica em Angola.
- Missão: Modernizar o tecido empresarial Angolano através da digitalização de processos complexos.
- Compliance: 100% alinhado com as normas da AGT (Administração Geral Tributária). Emite faturas certificadas e gera ficheiros SAF-T AO sem erros.
- Módulos Expandidos:
  * COMERCIAL: Faturação, Propostas, Gestão de Clientes (CRM) e Ponto de Venda (POS).
  * FINANCEIRO: Tesouraria, Contas Correntes, Fluxo de Caixa, Orçamentos e Integração Bancária.
  * RECURSOS HUMANOS: Processamento de Salários (IRT, Segurança Social), Contratos, Faltas e Férias.
  * OPERAÇÕES: Inventário (Multiarmazém), Compras (SCM), Produção e Manutenção de Equipamentos.
  * LOGÍSTICA: Gestão de Frota, Motoristas, Rotas e Consumo de Combustível.
  * QHSE: Gestão de Higiene, Saúde, Segurança e Ambiente (Protocolo ISO).
  * FISCAL: Relatórios de Impostos, Mapas Oficiais e Auditoria Digital.

Diferenciais Tecnológicos:
- Design "Sovereign OS": Uma interface premium, intuitiva e focada na produtividade.
- Multi-Plataforma: Acessível via Cloud (Web) e otimizado para dispositivos móveis.
- Georredundância: Dados protegidos com backups automáticos em múltiplos nós.
- Customização: Adaptável às necessidades específicas de cada setor (Comércio, Indústria, Serviços).

Regras de Interação:
- Responde SEMPRE em Português de Portugal.
- Mantém um tom profissional, institucional e confiante.
- Se o utilizador perguntar algo fora do contexto da VaOneGest, VA TECH INTERPRISES ou gestão empresarial, responde: "Peço desculpa, mas como Assistente Virtual da VaOneGest, a minha especialidade limita-se à nossa plataforma e serviços da VA TECH INTERPRISES. Em que posso ajudar relativamente ao nosso software?"
- Nunca mencione concorrentes.
- A sede da VA TECH INTERPRISES situa-se em Luanda, Talatona.
`;

export class AIController {
    static async chat(req: Request, res: Response) {
        try {
            const { message, history } = req.body;

            if (!message) {
                return res.status(400).json({ error: 'Mensagem é obrigatória.' });
            }

            // Configurar o modelo com a instrução de sistema rigorosa
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                systemInstruction: SYSTEM_PROMPT
            });

            const chat = model.startChat({
                history: history || [],
            });

            const result = await chat.sendMessage(message);
            const response = await result.response;
            const text = response.text();

            res.json({ text });
        } catch (error: any) {
            console.error('Gemini API Error:', error);
            
            if (error?.status === 429) {
                return res.status(429).json({ 
                    error: 'O assistente virtual atingiu o limite de tráfego gratuito. Por favor, aguarde cerca de 30-60 segundos antes de tentar novamente.' 
                });
            }

            res.status(500).json({
                error: 'O assistente VaOneGest está momentaneamente offline. Por favor, tente mais tarde.'
            });
        }
    }
}
