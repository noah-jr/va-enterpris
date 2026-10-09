# Estimativa de Tempo para a Plataforma de Gestão de Microcrédito

> **Versão:** 1.0 – 14/08/2026

## 📅 Visão geral
- **Equipe sugerida**: 1 Tech Lead (DDD/Arquitetura), 2 Back‑end (AdonisJS), 2 Front‑end (React/Vite), 1 QA/Automation, 1 DevOps.
- **Metodologia**: Scrum de 2 semanas (sprint).
- **Cobertura de testes**: ≥ 80 % (unit + integration + e2e).
- **Admin Area** será um **frontend separado** com repositório e pipeline próprios.
- **Infra‑as‑code** (Docker, CI/CD) incluída desde o início.
- **Não inclui**: negociação de requisitos, treinamento de usuários, suporte pós‑go‑live.

## 🗂️ Fases e estimativas
| **Fase** | **Objetivo** | **Duração (sprints)** | **Principais entregáveis** |
|----------|--------------|-----------------------|---------------------------|
| **1️⃣ Fundação** | Setup monorepo, CI/CD, autenticação (JWT, RBAC, 2FA), audit‑log, Swagger base, storage driver, documentação inicial. | **2 sprints** (4 sem) | Repositórios `backend` e `frontend`; pipelines GitHub Actions; ambiente Docker funcional; docs iniciais. |
| **2️⃣ Núcleo de Crédito** | Cadastro, solicitação, máquina de estados, upload de documentos, motor de score, simulador público + PDF. | **3 sprints** (6 sem) | Bounded Contexts `CadastroCliente`, `SolicitacaoCredito`, `AnaliseAprovacao`, `ProdutoFinanceiro`; APIs REST; UI cliente mínima funcional. |
| **3️⃣ Operação Financeira** | Desembolso, pagamentos (múltiplos métodos, recibos PDF), integração Redis/BullMQ para notificações. | **2 sprints** (4 sem) | Bounded Contexts `Desembolso`, `Pagamento`; fluxo end‑to‑end; filas de notificação configuradas. |
| **4️⃣ Cobrança & Risco** | Regras de mora, régua de cobrança, ações judiciais, renegociação, lista negra, classificação de clientes, campanhas/cashback. | **3 sprints** (6 sem) | Bounded Contexts `Cobranca`, `Renegociacao`, `ListaNegra`, `ClassificacaoCliente`, `Campanha`; UI admin (painéis de cobrança/relatórios). |
| **5️⃣ Back‑office (Admin Separado)** | Dashboard administrativo, CRM, relatórios KPI, gestão de garantias, auditoria, gerenciamento de perfis/RBAC. **Front‑end admin será um app independente** com repositório/pipeline próprio. | **3 sprints** (6 sem) | Aplicação `admin` (React + Vite) em repositório distinto; APIs de suporte; CI/CD dedicado. |
| **6️⃣ Hardening & QA** | 2FA completa, rate‑limiting, backup, testes de carga (k6), segurança (OWASP ZAP), documentação Swagger final, preparação para produção. | **2 sprints** (4 sem) | Cobertura de testes ≥ 80 %; relatórios de segurança; scripts de migração/seed; playbook de deploy. |
| **7️⃣ Go‑live & Suporte inicial** | Deploy em staging → produção, validação de performance, monitoramento (Prometheus/Loki/Grafana), hand‑over ao time Ops. | **1 sprint** (2 sem) | Ambiente de produção estável; documentação de operação; treinamento básico de usuários. |

### ⏱️ Tempo total estimado
- **Sprints:** 18 (36 semanas) → **≈ 9 meses**.
- **Calendário típico:** início em **abril 2026** → entrega **final de dezembro 2026** (considerando feriados e buffers).

## ⚖️ Fatores que podem impactar o prazo
| **Impacto** | **Descrição** |
|-------------|---------------|
| **Escopo reduzido** (ex.: MVP só com Landing + Área Cliente) | Reduz ~4‑5 sprints → **≈ 6 meses**. |
| **Equipe ampliada** (mais devs ou squad dedicado à admin) | Reduz 1‑2 sprints por fase → **≈ 7‑8 meses**. |
| **Dependências externas** (SMS/WhatsApp, gateway bancário) | +1 sprint por integração. |
| **Mudanças de requisitos** (novas regras de risco, UI) | +0.5‑1 sprint por mudança. |
| **Infraestrutura pré‑existente** (DB, Redis, MinIO já provisionados) | Economiza 1 sprint (setup). |

## ✅ Próximos passos recomendados
1. **Refinar o roadmap** com a VATECH (definir MVP vs. funcionalidades “later”).
2. **Criar backlog detalhado** (histórias, critérios de aceitação). 
3. **Alocar recursos** (definir papéis, disponibilidade). 
4. **Agendar a primeira sprint** (setup de repositórios, CI/CD, base de autenticação). 
5. **Documentar decisões** no repositório (`docs/estimate.md`).

---
*Este documento será versionado e atualizado à medida que o projeto evolui.*
