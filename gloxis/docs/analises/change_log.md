# Parecer Multidisciplinar de Avaliação: Sistema Gloxis ERP & Microcrédito

Este parecer apresenta uma análise profunda do sistema Gloxis, articulada sob quatro perspetivas profissionais complementares: **Engenharia/Análise de Sistemas**, **Contabilidade & Fiscalidade**, **Gestão Empresarial** e **Banca & Gestão de Risco de Crédito**.

---

## 1. Visão do Analista de Sistemas de Software

### 🟢 Pontos Fortes e Arquitetura
* **Modularidade DDD (Domain-Driven Design):** A separação em mais de 20 módulos autónomos (`SolicitacaoCredito`, `OperacaoFinanceira`, `Faturacao`, `ListaNegra`, etc.) facilita a manutenção, isolamento de bugs e evolução independente das regras de negócio.
* **Integridade da Camada de Persistência:** A migração para **MySQL 8.0** com Lucid ORM e suporte rigoroso a datas via **Luxon `DateTime`** eliminou falhas de coerência de fuso horário e parsing temporal.
* **Arquitetura Event-Driven (Real-Time):** A utilização de `Adonis Emitter` permite atualizações instantâneas via Server-Sent Events (SSE) sem necessidade de polling agressivo do cliente.
* **Geração de Documentos Nativa:** A integração com `PDFKit` no backend garante a renderização dinâmica de documentos oficiais em PDF sem dependências externas de serviços de terceiros.

### ⚠️ Vulnerabilidades Técinicas & Recomendações
1. **Segurança no Download de PDFs:** A rota `/faturacao/:id/pdf` é pública para permitir o acesso direto por elementos HTML `<a href>`. **Recomendação:** Implementar *Signed URLs* (URLs temporários com token assinado e expiração de 5 minutos) para evitar a exposição indevida de dados financeiros.
2. **Tratamento de Exceções em Filas Async:** O job de notificação e geração de parcelas corre via cron. **Recomendação:** Adicionar suporte a DLQ (Dead Letter Queue) com Redis para evitar a perda de avisos de vencimento em falhas pontuais de rede.

---

## 2. Visão do Contabilista e Auditor Fiscal

### 🟢 Conformidade Fiscal & Contabilística (Regulamentação AGT - Angola)
* **Tipologia Documental Exata:** O sistema diferencia com clareza **Faturas Proforma/Solicitação (`FT`)** (que documentam a constituição da obrigação/dívida) de **Recibos de Desembolso/Pagamento (`RC`)** (que comprovam a quitação efetiva do valor).
* **Cadeia de Rastreabilidade Auditável:** Nenhuma fatura é marcada como `PAGA` sem o registo correspondente do evento de conciliação efetuado pelo Administrador ou pela validação do comprovativo bancário.
* **Imutabilidade Fiscal (Hash AGT):** Cada documento gerado inclui um hash digest SHA-256 (`hashAgt`) para cumprimento dos padrões da Administração Geral Tributária (AGT).

### ⚠️ Recomendações Contabilísticas
1. **Plano de Contas Geral (PGC):** Integrar a contabilização automática em débito/crédito (ex: Conta `41 - Clientes` vs Conta `12 - Bancos`) no momento da liquidação de cada parcela.
2. **Retenção na Fonte e Imposto do Selo:** Garantir a aplicação das taxas de Imposto do Selo sobre a concessão do crédito (conforme Tabela do Imposto do Selo vigente).

---

## 3. Visão do Gestor Empresarial (CEO / COO)

### 🟢 Controlo Operacional e Eficiência
* **Mitigação do Risco Humano (Workflow Estrito):** A eliminação da "aprovação rápida com um clique" forçou o fluxo a exigir a anexação do comprovativo de transferência bancária, prevenindo erros operacionais e fraudes internas.
* **Visibilidade Operacional 360º:** Dashboards dedicados para acompanhamento de liquidez, parcelas em atraso e taxa de conversão de solicitações.
* **Automatização da Cobrança Preventiva:** Notificações disparadas automaticamente 5 dias antes do vencimento reduzem a taxa de esforço da equipa de contencioso/cobranças.

### ⚠️ Recomendações de Gestão Empresarial
1. **SLA de Análise de Crédito:** Adicionar métricas de tempo médio entre o pedido do cliente e a decisão do gestor para avaliar a eficiência da equipa de risco.
2. **Relatório de Audit Trail:** Implementar um log imutável das ações dos utilizadores administradores (quem aprovou, quem rejeitou, que ficheiros foram substituídos).

---

## 4. Visão do Banquista & Gestor de Conta de Microcrédito

### 🟢 Gestão de Risco & Normativos BNA (Banco Nacional de Angola)
* **Análise de Score & Lista Negra:** Integração nativa com o módulo de consulta de incumprimento (`ListaNegra`), impedindo a concessão de novos créditos a mututários com saldo devedor contencioso.
* **Rastreabilidade de Colaterais (Garantias):** Suporte à associação de ativos (viaturas, imóveis, equipamentos) como garantia associada à solicitação de crédito.
* **Gestão da Carteira de Empréstimos (PAR / NPL):** Separação clara entre prestações vincendas, pendentes e vencidas/atrasadas.

### ⚠️ Recomendações Bancárias
1. **Rácio de Cobertura de Serviço da Dívida (DSR):** Travar automaticamente solicitações cujo valor de prestação estimada exceda 30% a 40% do rendimento mensal comprovado do cliente.
2. **Reestruturação e Renegociação de Dívida:** Expandir o módulo `Renegociacao` para permitir o cálculo automático de novas taxas de juro de mora e perdão parcial de encargos sob aprovação da comissão de crédito.

---

## 5. Resumo da Avaliação Global

| Perspetiva profissional | Classificação | Avaliação Sintética |
| :--- | :---: | :--- |
| **Sistemas & Arquitetura** | **9.2 / 10** | Excelente arquitetura DDD, estabilidade de build e integração contínua. |
| **Contabilidade & Fiscalidade** | **9.5 / 10** | Separação rigorosa de `FT` e `RC`, geração de hashes e fluxo auditável. |
| **Gestão Empresarial** | **9.0 / 10** | Mitigação de fraudes internas através do desembolso com anexo obrigatório. |
| **Gestão Bancária & Risco** | **8.8 / 10** | Boa gestão de score e Lista Negra; espaço para automatização de limites de DSR. |

**Conclusão:** O sistema Gloxis apresenta uma maturidade excecional, aliando rigor técnico, conformidade fiscal angolana e segurança bancária. As correções efetuadas garantem que a plataforma funciona como um sistema financeiro auditável e pronto para escala corporativa.
