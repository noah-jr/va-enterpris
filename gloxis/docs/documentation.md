# Documentação Oficial da Plataforma Gloxis Financial Services

---

## 📖 Sumário

1. [Visão Geral do Projeto](#visão-geral-do-projeto)
2. [Tecnologias e Stack](#tecnologias-e-stack)
3. [Arquitetura & Bounded Contexts](#arquitetura--bounded-contexts)
4. [Instalação & Execução Local](#instalação--execução-local)
5. [Testes (TDD & BDD)](#testes-tdd--bdd)
6. [Pipelines de CI/CD & Deploy](#pipelines-de-cicd--deploy)
7. [Estilo de Código & Boas Práticas](#estilo-de-código--boas-práticas)
8. [Glossário](#glossário)

---

## 🎯 Visão Geral do Projeto

A **Plataforma Gloxis Financial Services** fornece um ecossistema completo para a concessão e gestão de microcrédito estatal em Angola, com integração direta com normativos do BNA e MINFIN.

O ecossistema é composto por quatro frentes principais:
- **Backend API (AdonisJS 6):** Lógica centralizada de negócio, orquestração de use cases, autorização RBAC, segurança 2FA e eventos SSE em tempo real.
- **Landing Page & Guia do Cidadão (`http://localhost:5175`):** Divulgação institucional, simulador Tabela Price e formulário de contacto integrado com e-mail e Inbox Admin.
- **Área do Cliente (`http://localhost:5174`):** Portal reservado do cidadão para candidatura a microcrédito, envio de comprovativos e consulta de amortizações.
- **Área Administrativa (`http://localhost:5173`):** Painel de gestão para analistas, diretores e auditores com fluxo de aprovação de crédito, relatórios e Inbox em tempo real.

---

## 🛠️ Tecnologias e Stack

| Camada | Tecnologia | Descrição / Uso |
|--------|------------|-----------------|
| **Backend** | **AdonisJS v6** (TypeScript) | Framework opinativo com IoC container, Lucid ORM e suporte nativo a ESM. |
| **Banco de Dados** | **MySQL 8.0** | Armazenamento relacional com migrações automáticas. |
| **Cache & Filas** | **Redis + BullMQ** | Notificações e tarefas assíncronas. |
| **Notificações** | **Resend / Twilio** | Provedores de e-mail e SMS para confirmações e alertas. |
| **Frontend** | **React 19 + Vite + TypeScript** | Interfaces reativas com arquitetura Zero-Logic. |
| **Estilização** | **TailwindCSS v4 + Vanilla CSS** | Design system moderno em Light Mode Fintech. |
| **Testes Backend** | **Japa Runner** | Testes unitários e funcionais integrados ao AdonisJS. |
| **Testes Frontend** | **Vitest + Testing Library** | Testes de integração de componentes e rotas. |
| **CI/CD** | **GitHub Actions** | Pipelines segregadas por módulo (`deploy-backend`, `deploy-admin`, `deploy-client`, `deploy-landing`). |

---

## 🏗️ Arquitetura & Bounded Contexts

O projeto aplica **Clean Architecture** e **Domain-Driven Design (DDD)**. Toda a lógica de negócio do backend reside em `app/Modules/[Modulo]`:

- **SolicitacaoCredito:** Gestão de candidaturas, simulação e submissão pública.
- **Cliente:** Perfil do cidadão, documentos, rendimentos e profissão.
- **OperacaoFinanceira:** Amortizações, desembolsos, Tabela Price e cobrança.
- **Transparencia:** Publicação de indicadores regulamentares BNA.
- **Documentos:** Gestão de modelos institucionais, tramitação e mensagens Inbox.
- **Notificacao:** Serviço centralizado de envio de e-mails e SMS.

---

## 🚀 Instalação & Execução Local

### Pré-requisitos
- **Node.js** ≥ 20 (Node 22 recomendado)
- **npm** ≥ 10
- **Docker** (para MySQL, Redis, MinIO)

### 1. Iniciar o Backend
```bash
cd backend
npm install
cp .env.example .env
node ace migration:run
npm run dev
# API a correr em http://localhost:3333
```

### 2. Iniciar os Portais Frontend
```bash
# Portal Admin (Porta 5173)
cd frontend/admin && npm run dev

# Portal do Cliente (Porta 5174)
cd frontend/client && npm run dev

# Landing Page (Porta 5175)
cd frontend/landing && npm run dev
```

---

## 🧪 Testes (TDD & BDD)

A plataforma exige 100% de aprovação nos testes automáticos antes de cada commit/deploy:

```bash
# Testes do Backend (AdonisJS / Japa)
cd backend && npm test

# Testes dos Portais Frontend (Vitest)
cd frontend/admin && npm test
cd frontend/client && npm test
cd frontend/landing && npm test
```

---

## 📦 Pipelines de CI/CD & Deploy

A publicação automatizada na VPS é realizada por pipelines individuais do GitHub Actions localizados em `.github/workflows/`:

1. `deploy-backend.yml`: Deploy do servidor AdonisJS 6 (`node ace build` + `pm2 reload GLOXIS_BACKEND`).
2. `deploy-admin.yml`: Build e deploy estático SPA do Portal Admin (`/var/www/gloxis/admin`).
3. `deploy-client.yml`: Build e deploy estático SPA do Portal do Cliente (`/var/www/gloxis/client`).
4. `deploy-landing.yml`: Build e deploy estático SPA da Landing Page (`/var/www/gloxis/landing`).

---

## 📐 Estilo de Código & Boas Práticas

- **Proibição Estrita de `any`:** Todos os contratos, DTOs e entidades são fortemente tipados em TypeScript.
- **Zero-Logic Frontend:** Componentes visuais apenas apresentam dados fornecidos por hooks e APIs backend.
- **Conventional Commits:** Mensagens imperativas e focadas (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`).
