# Architectural Overview - Gloxis Platform

## 📐 Visão Geral
Este documento especifica a arquitetura da Plataforma de Gestão de Microcrédito Gloxis, estruturada em **Bounded Contexts (DDD)**, **Clean Architecture** e **Zero-Logic Frontend**.

---

## 🏛️ Diagrama de Camadas

```text
[ User Clients ]
 ├── Landing Page (Porta 5175) -> React + Vite
 ├── Portal do Cliente (Porta 5174) -> React + Vite
 └── Portal Admin (Porta 5173) -> React + Vite
        │
        ▼  HTTP REST / SSE Realtime
[ Backend AdonisJS v6 ] (Porta 3333)
 ├── Presentation Layer (Controllers & Middlewares JWT/RBAC)
 ├── Application Layer (Use Cases, Services, DTOs)
 ├── Domain Layer (Entidades Ricas, Value Objects, Domain Events)
 └── Infrastructure Layer (Lucid ORM, Redis, BullMQ, MinIO, Resend Email)
        │
        ▼
[ Armazenamento & Filas ]
 ├── MySQL 8.0 (Base de Dados Relacional)
 ├── Redis (Cache, Limiter & Messenger SSE)
 └── MinIO / Local Drive (Arquivo de Ficheiros & Comprovativos)
```

---

## 📌 Bounded Contexts Principais

| Contexto | Responsabilidade |
|----------|--------------------|
| **SolicitacaoCredito** | Submissão pública, validação de elegibilidade, Tabela Price |
| **Cliente** | Registo de clientes, profssão, rendimento e contactos |
| **AnaliseAprovacao** | Scoring de risco, motor de regras e aprovação por alçadas |
| **ProdutoFinanceiro** | Gestão de produtos, limites, encargos e taxas de juro |
| **OperacaoFinanceira** | Emissão de parcelas, amortização, desembolso e recibos |
| **Documentos & Inbox** | Impressão de certidões, modelos e caixa de entrada de mensagens |
| **Notificacao** | Despacho assíncrono de e-mails e notificações por SMS |
| **Segurança & Auditoria** | Autenticação JWT, 2FA Speakeasy, RBAC e registo imutável de Audit Logs |

---

## 🔄 Infraestrutura de Deploy (CI/CD)

- **Pipelines GitHub Actions:** Segregadas por projeto (`deploy-backend.yml`, `deploy-admin.yml`, `deploy-client.yml`, `deploy-landing.yml`).
- **Orquestração na VPS:** PM2 para gestão dos servidores Node.js e static servers SPA.
