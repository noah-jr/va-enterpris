# Plataforma de Gestão de Microcrédito – Especificação Completa

---

## 1. Visão Geral

A Plataforma de Gestão de Microcrédito oferece um ecossistema completo para todo o ciclo de vida do crédito – desde o cadastro e elegibilidade do cliente até à liquidação, cobrança e renegociação – com três frentes de acesso:

- **Landing Page** institucional (apresentação da empresa, produtos de crédito, captação de leads)
- **Área do Cliente** (portal para solicitar crédito, simular, acompanhar pagamentos, consultar histórico)
- **Área Administrativa** (back‑office para gestores, analistas, auditores). *(será implementada como um aplicativo front‑end separado, com seu próprio repositório e pipeline de CI/CD)*

A arquitetura adotada é **Clean Architecture** com princípios **SOLID** e **Domain‑Driven Design (DDD)**, garantindo modularidade, testabilidade e manutenção a longo prazo.

---

## 2. Objetivos do Sistema

1. Digitalizar e automatizar todo o processo de concessão de microcrédito.
2. Reduzir risco via **scoring** de crédito, classificação de clientes e lista negra.
3. Garantir rastreabilidade total das operações (**audit‑logs**).
4. Suportar múltiplos perfis de utilizador com controle de acesso granular (**RBAC**).
5. Disponibilizar API documentada (**Swagger**) para integrações futuras.
6. Garantir performance e escalabilidade via **Redis** (cache/filas) e **MinIO** (armazenamento distribuído).

---

## 3. Escopo do Sistema

| Módulo | Descrição |
|--------|-----------|
| **Landing Page** | Site institucional, apresentação de produtos, simulador público, formulário de lead/contacto |
| **Área do Cliente** | Login, cadastro, solicitação de crédito, simulação, upload de documentos, acompanhamento de prestações, histórico, notificações |
| **Área Administrativa** | Dashboard, CRM, Vendas, Compras, Stock, Faturação, Financeiro, Contabilidade, RH, Contratos, Projetos, Ativos, Documentos, Relatórios, Administração |

---

## 4. Requisitos Funcionais (Regras de Negócio)

### 4.1 Cadastro e Elegibilidade do Cliente
- Idade mínima e máxima configurável.
- Documento de identificação (BI/Passaporte) obrigatório.
- NIF obrigatório.
- Conta bancária (opcional/obrigatória conforme produto).
- Telefone ativo validado por OTP.
- Lista de documentos obrigatórios configurável (residência, rendimento, extrato bancário, declaração do empregador).
- Suporte a trabalhadores informais com comprovação alternativa.
- Parametrização de exigência de fiador/garantia por tipo de produto.

**Entidades:** `Cliente`, `Documento`, `TipoDocumento`, `Endereco`, `DadosBancarios`.

### 4.2 Solicitação do Crédito
- Criação de solicitação via portal ou manualmente por Analista.
- Upload de documentos com validação automática (formato, tamanho, tipo).
- Cancelamento permitido enquanto o pedido está em **"Em análise"** ou **"Pendente de documentos"**.
- Configurável: permitir ou não múltiplos pedidos simultâneos por cliente.

**Máquina de estados:**
```
Em análise → Pendente de documentos → Aprovado → Desembolsado
           ↘ Reprovado
           ↘ Cancelado
```

**Entidades:** `Solicitacao`, `SolicitacaoDocumento`, `SolicitacaoHistoricoEstado`.

### 4.3 Análise e Aprovação do Crédito
- Critérios de aprovação configuráveis (score mínimo, capacidade de pagamento, histórico).
- Cálculo de capacidade de pagamento (renda vs. compromisso de dívida).
- Motor de **Score de Crédito** com regras configuráveis.
- Níveis de aprovação por alçada de valor (Analista, Supervisor, Diretor).
- SLA máximo de análise com alertas de estouro.
- Solicitação de documentos adicionais durante a análise.

**Entidades:** `AnaliseCredito`, `ScoreCredito`, `RegraAprovacao`, `AlcadaAprovacao`.

### 4.4 Regras Financeiras do Crédito
- Valor mínimo e máximo configuráveis (global e por perfil/produto).
- Taxas de juros fixas ou variáveis, configuráveis por produto e prazo.
- Comissões administrativas e seguros (percentual ou valor fixo).
- Motor de cálculo de prestações (Price, SAC ou outro, configurável).
- Cálculo de saldo devedor em tempo real.
- Cálculo de amortizações ordinárias/extraordinárias.
- Cálculo de juros de mora em atraso.

**Entidades:** `ProdutoCredito`, `TabelaJuros`, `PlanoPagamento`, `Prestacao`.

### 4.5 Simulação do Crédito
- Simulador público (Landing) e autenticado (Área do Cliente) que mostra:
  - Valor solicitado, prazo, taxa de juros aplicável
  - Valor e número de prestações
  - Total de juros e total a pagar
  - Data prevista da última prestação
  - Geração de PDF da simulação

### 4.6 Desembolso do Crédito
- Métodos: transferência bancária, dinheiro (caixa), carteira digital.
- Fluxo de autorização (perfil autorizado + limite).
- Emissão automática de comprovativo de desembolso (PDF).

**Entidades:** `Desembolso`, `ContaDesembolso`.

### 4.7 Gestão de Pagamentos
- Formas de pagamento configuráveis (transferência, referência multicaixa, dinheiro, carteira digital).
- Pagamento antecipado, parcial ou liquidação total antecipada.
- Emissão automática de recibos (PDF) e extratos de conta.

**Entidades:** `Pagamento`, `Recibo`, `Extrato`.

### 4.8 Incumprimento e Cobrança
- Regra de tolerância antes de iniciar cobrança.
- Cálculo automático de multas e juros de mora (parametrizável).
- Régua de cobrança: lembretes automáticos (dias antes/depois do vencimento).
- Escalonamento para cobrança judicial e execução de garantia.

**Entidades:** `Cobranca`, `ReguaCobranca`, `AcaoCobranca`.

### 4.9 Renegociação do Crédito
- Condições elegíveis configuráveis.
- Autorização por perfil (Supervisor/Diretor).
- Recálculo automático do plano de pagamento.
- Histórico do crédito original mantido e vinculado ao novo plano.

**Entidades:** `Renegociacao`, `HistoricoRenegociacao`.

### 4.10 Gestão de Garantias
- Tipos: fiador, imóvel, viatura, equipamentos, depósito bancário, outros bens.
- Fluxo de avaliação da garantia (responsável, valor, documentos).
- Execução da garantia vinculada ao processo judicial.

**Entidades:** `Garantia`, `AvaliacaoGarantia`, `Fiador`.

### 4.11 Lista Negra e Histórico de Crédito
- Inclusão automática baseada em critérios (incumprimentos, dias de atraso, valor em atraso).
- Remoção requer aprovação e justificação (não automática).
- Retenção do histórico negativo configurável (ex.: 5 anos) – **soft‑delete** + auditoria.

**Entidades:** `ListaNegra`, `HistoricoCredito`.

### 4.12 Classificação dos Clientes (Fidelização)
- Critérios: nº de créditos pagos, pontualidade, dias de atraso, incumprimentos, valor total pago, renegociações.
- Níveis: Bronze, Prata, Ouro, Platinum, Premium.
- Benefícios automáticos por nível (juros reduzidos, maior limite, aprovação mais rápida, menor exigência documental).

**Entidades:** `ClassificacaoCliente`, `RegraClassificacao`, `BeneficioClassificacao`.

### 4.13 Benefícios e Campanhas
- Motor de campanhas promocionais e descontos em taxas (por período/segmento).
- Programa de fidelização com cashback/bonificação (opcional, configurável).

**Entidades:** `Campanha`, `Cashback`.

### 4.14 Gestão Operacional (Perfis e Permissões)
- Perfis: `Administrador`, `Diretor`, `Gestor`, `Supervisor`, `Analista de Crédito`, `Caixa`, `Cobrança`, `Auditor`.
- Implementação via **RBAC** com permissões granulares por módulo/ação (ex.: `credito.aprovar`, `credito.cancelar`, `contrato.editar`).

### 4.15 Auditoria
- Registro obrigatório de: utilizador, data/hora, ação, IP, payload antes/depois.
- Consultável por Auditor/Administrador, **append‑only**.

### 4.16 Relatórios e KPIs
| Área | Indicadores |
|------|-------------|
| Clientes | cadastrados, ativos, inativos, bloqueados, inadimplentes |
| Crédito | concedidos, em análise, aprovados, rejeitados, liquidados, renegociados |
| Financeiro | valor total emprestado, valor recebido, juros recebidos, multas, receita, lucro |
| Cobrança | clientes em atraso, dias de atraso, valor em atraso, taxa de recuperação |
| KPIs | taxa de aprovação/rejeição, tempo médio de análise, tempo médio de pagamento, % inadimplência, % recuperação |

### 4.17 Notificações
- Canais: **SMS**, **WhatsApp**, **E‑mail** (provedores plugáveis).
- Eventos: crédito aprovado/rejeitado, prestação a vencer, prestação em atraso, renegociação aprovada, liquidação total.
- Processamento assíncrono via filas (**Redis + Bull/BullMQ**).

### 4.18 Segurança do Sistema
- Login seguro (hash de senha, rate limiting).
- **2FA** (autenticação em dois fatores).
- Recuperação de senha com token expirado.
- Criptografia de dados sensíveis em repouso.
- Backup automático.
- Bloqueio por tentativas falhadas.
- Controle e revogação de sessões ativas.
- **API‑Key** para integrações externas (serviços máquina‑a‑máquina).

---

## 5. Requisitos Não Funcionais

| Categoria | Requisito |
|-----------|-----------|
| **Performance** | Respostas de API < 300 ms (p95) para endpoints simples; cache Redis para consultas frequentes |
| **Escalabilidade** | Arquitetura modular permite escalar módulos/serviços de forma independente |
| **Disponibilidade** | 99,5 % uptime; health‑checks e monitorização |
| **Segurança** | OWASP Top 10, HTTPS, RBAC + API‑Key |
| **Auditabilidade** | Todas as ações de escrita geram audit‑log imutável |
| **Manutenibilidade** | Clean Architecture + SOLID + Repository Pattern + testes automatizados |
| **Documentação** | Swagger/OpenAPI sempre atualizado a partir do código |
| **Internacionalização** | Textos e mensagens preparados para **pt‑AO** como padrão |
| **Observabilidade** | Logs estruturados, métricas e tracing de erros |

---

## 6. Arquitetura Técnica

### 6.1 Backend – **AdonisJS v6 (TypeScript / Node.js)**
- **Camadas**: Domain → Application → Infrastructure → Interface (HTTP Controllers, Jobs, CLI).
- **Repository Pattern** com interfaces (`IClienteRepository`, `ICreditoRepository`, …) e implementação Lucid ORM.
- **Middleware**: Auth (JWT), RBAC, API‑Key, Audit‑Log, Rate‑Limiting.
- **Cache/Filas**: Redis + BullMQ (notificações, cálculos assíncronos).
- **Upload de ficheiros**: Driver Strategy (`IStorageDriver`) com MinIO (S3‑compatible) e driver Local para desenvolvimento.
- **Swagger**: geração automática (ex.: `adonis‑autoswagger`).
- **Estrutura de pastas** (exemplo resumido):
```
backend/
├─ app/
│   ├─ Modules/
│   │   ├─ Clientes/    (Controllers, Services, Repositories, Interfaces, Validators, Models)
│   │   ├─ Creditos/
│   │   ├─ Pagamentos/
│   │   └─ …
│   └─ Shared/          (Middlewares, Storage, Cache, Queue, Exceptions)
├─ config/
├─ database/ (migrations, seeders)
├─ start/ (routes por módulo)
└─ tests/ (unit, functional)
```

### 6.2 Frontend – **Vite + React + TypeScript**
- **State Management**: Zustand (sessão, permissões RBAC client‑side).
- **Data Fetching**: Axios encapsulado em `ApiService<T>` + **TanStack Query** (react‑query) para cache e revalidação.
- **Validação**: Zod (esquemas compartilhados entre formulários e contratos API).
- **UI**: TailwindCSS com design system próprio (tokens de cor/tema), tipografia Google Fonts (Inter/Roboto/Outfit), micro‑animações e dark mode premium.
- **Estrutura de pastas** (exemplo resumido):
```
frontend/
├─ src/
│   ├─ apps/ (landing, client, admin)
│   ├─ shared/ (services, store, hooks, schemas, components/ui, components/toast, utils)
│   └─ routes/
└─ main.tsx
```

### 6.3 Segurança e Autenticação Consolidada
| Mecanismo | Uso |
|-----------|-----|
| JWT / Sessão | Autenticação de utilizadores (Cliente, Backoffice) |
| API‑Key | Autenticação de integrações externas |
| RBAC | Controle granular por papel e permissão |
| 2FA | Camada extra para perfis administrativos/sensíveis |
| Rate Limiting (Redis) | Proteção contra brute‑force e abuso de API |
| Audit‑Log | Rastreabilidade completa de ações de escrita |

### 6.4 Integrações Principais
- **MinIO** – armazenamento de documentos, contratos, comprovativos.
- **Redis** – cache, filas (BullMQ) para notificações e cálculos assíncronos (score, cobrança).
- **Providers de Notificação** – plugáveis para SMS, WhatsApp, E‑mail.
- **Swagger/OpenAPI** – contrato de API consumido também para gerar tipos no frontend (`openapi‑typescript`).

---

## 7. Bounded Contexts – Visão Estratégica (DDD)

| Bounded Context | Responsabilidade | Agregados / Entidades Principais |
|-----------------|-------------------|-----------------------------------|
| **CadastroCliente** | Dados cadastrais, documentos, contas bancárias | `Cliente` (Agregado), `Documento` (VO), `Endereco` (VO), `ContaBancaria` (VO) |
| **SolicitacaoCredito** | Criação, upload de documentos, fluxo de estado | `Solicitacao` (Agregado), `SolicitacaoDocumento` (Entidade), `HistoricoEstado` (Entidade) |
| **AnaliseAprovacao** | Scoring, regras de aprovação, alçadas, SLA | `AnaliseCredito`, `ScoreCredito`, `RegraAprovacao`, `AlcadaAprovacao` |
| **ProdutoFinanceiro** | Configuração de produtos, tabelas de juros, planos de pagamento | `ProdutoCredito`, `TabelaJuros`, `PlanoPagamento`, `Prestacao` |
| **Desembolso** | Emissão de comprovantes e transferência de valores | `Desembolso`, `ContaDesembolso` |
| **Pagamento** | Registro de pagamentos, recibos, extratos | `Pagamento`, `Recibo`, `Extrato` |
| **Cobranca** | Regras de mora, régua de cobrança, ações judiciais | `Cobranca`, `ReguaCobranca`, `AcaoCobranca` |
| **Renegociacao** | Recalc de plano, histórico de renegociação | `Renegociacao`, `HistoricoRenegociacao` |
| **Garantia** | Avaliação e execução de garantias | `Garantia`, `AvaliacaoGarantia`, `Fiador` |
| **ListaNegra** | Controle de inadimplentes | `ListaNegra`, `HistoricoCredito` |
| **ClassificacaoCliente** | Níveis de fidelidade, benefícios | `ClassificacaoCliente`, `RegraClassificacao`, `BeneficioClassificacao` |
| **Campanha** | Promoções, cashback | `Campanha`, `Cashback` |
| **Seguranca** | Autenticação, autorização, auditoria | `Usuario`, `Perfil`, `Permissao`, `AuditLog` |
| **RelatorioKPIs** | Geração de relatórios e dashboards | `Relatorio`, `KPI` |
| **Notificacao** | Envio assíncrono de mensagens | `Notificacao`, `Canal` |

> **Comunicação entre Contextos** – feita exclusivamente por **eventos de domínio** (ex.: `SolicitacaoAprovada`, `PagamentoRegistrado`) publicados no **bus de mensagens** (Redis/BullMQ).

---

## 8. Roadmap de Desenvolvimento (Quarterly)

| Trimestre | Meses | Milestones |
|-----------|-------|------------|
| **Q1 2026** | Jan‑Mar | • Scaffold do monorepo (Adonis + Vite) <br> • Security Kernel (JWT, RBAC, Audit‑Log) <br> • Bounded Contexts `CadastroCliente` e `ProdutoFinanceiro` <br> • Swagger base |
| **Q2 2026** | Apr‑Jun | • Implementação completa de `SolicitacaoCredito` (máquina de estados, upload S3/MinIO) <br> • Motor de Score configurável <br> • Simulador público + PDF <br> • Integração Redis + BullMQ (notificações) |
| **Q3 2026** | Jul‑Set | • Fluxos de `Desembolso` e `Pagamento` (múltiplos métodos, recibos PDF) <br> • `Cobranca` (régua, juros mora) <br> • UI premium (dark mode, micro‑animações) <br> • Testes de contrato entre Contextos |
| **Q4 2026** | Oct‑Dez | • `Renegociacao`, `Garantia`, `ListaNegra` <br> • Campanhas e cashback <br> • Dashboard de KPIs + exportação Excel/PDF <br> • Hardening final (2FA, rate‑limit, backup, disaster recovery) |
| **Q1 2027** | Jan‑Mar | • Lançamento beta para parceiros <br> • API‑Key para apps móveis <br> • CI/CD automatizado com testes de integração em produção <br> • Documentação completa e hand‑over ao time de operações |

---

## 9. Estratégia de Testes (TDD)

| Camada | Tipo de Teste | Exemplos de Casos |
|--------|---------------|-------------------|
| **Domain** | Unit (JUnit/Jest) | Validação de regras de negócio (`ScoreCredito`, cálculo de juros, limites de alçada) |
| **Application** | Unit + Integration | Use‑cases críticos (`CriarSolicitacao`, `AprovarCredito`, `GerarParcelas`) |
| **Infrastructure** | Integration (Banco, Redis, MinIO) | Repositório Lucid, cache Redis, upload MinIO |
| **API** | Contract (OpenAPI) + End‑to‑End (Cypress/Playwright) | Fluxos completos do cliente (login → solicitar → pagar) |
| **Performance** | Load (k6) | SLA < 300 ms, throughput > 200 req/s |
| **Security** | OWASP ZAP, pen‑test | Verificação de XSS, CSRF, broken auth |

---

## 10. Próximas Ações Imediatas
1. **Validar Bounded Contexts** com a VATECH (prioridades, ordem de entrega).
2. **Criar Diagrama UML** de cada Contexto (Entidades, VO, Agregados). 
3. **Gerar Wireframes** da Landing Page e das áreas Cliente/Admin (usar `generate_image` para mockups premium). 
4. **Inicializar repositório**: `npx -y create-adonis-app@latest ./backend` e `npm create vite@latest ./frontend -- --template react-ts`. 
5. **Escrever primeiro teste** para `IClienteRepository` (mockado) e garantir cobertura ≥ 80 % nas camadas de domínio. 

---

*Este documento será a base de toda a implementação. Atualizações deverão ser versionadas e revisadas em conjunto com a equipe de produto e arquitetura.*
