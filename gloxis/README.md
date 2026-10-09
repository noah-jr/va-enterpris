# Gloxis Financial Services - Plataforma Estatal de Microcrédito

Plataforma integrada de gestão de microcrédito e serviços financeiros estatais desenvolvida para a **Gloxis Financial Services S.A.** em conformidade com os normativos do Banco Nacional de Angola (BNA) e do Ministério das Finanças (MINFIN).

---

## 🏗️ Arquitetura do Sistema

O ecossistema é composto por 4 aplicações modulares desenvolvidas sob os princípios de **Clean Architecture**, **Domain-Driven Design (DDD)** e **Zero-Logic Frontend**:

```text
gloxis/
├── backend/               # Backend AdonisJS 6 (TypeScript, Lucid ORM, MySQL, Redis, SSE, JWT 2FA)
├── frontend/
│   ├── admin/            # Painel Administrativo de Gestão (React 19, Vite, TailwindCSS)
│   ├── client/           # Balcão Único Digital do Cidadão (React 19, Vite, TailwindCSS)
│   └── landing/          # Portal Público Institucional & Simulador (React 19, Vite, TailwindCSS)
├── docs/                 # Documentação técnica e especificações do sistema
└── .github/workflows/    # Pipelines de CI/CD automatizadas (GitHub Actions)
```

---

## 🚀 Portas e Ambientes Locais

| Aplicação | Ambiente Dev | Porta Local | Descrição |
|---|---|---|---|
| **Backend API** | AdonisJS v6 | `http://localhost:3333` | REST API, SSE Realtime, Auth JWT, Swagger Docs (`/docs`) |
| **Portal Admin** | React + Vite | `http://localhost:5173` | Back-office de gestão, aprovações, scoring e relatórios |
| **Portal do Cliente** | React + Vite | `http://localhost:5174` | Área reservada do cidadão, candidaturas e acompanhamento |
| **Landing Page** | React + Vite | `http://localhost:5175` | Guia do cidadão, formulário de contacto e simulador Tabela Price |

---

## ⚙️ Pipelines de CI/CD (GitHub Actions)

A infraestrutura de deploy continuo está segregada em ficheiros dedicados em `.github/workflows/`:

*   `deploy-backend.yml`: Build do AdonisJS 6 (`node ace build`), instalação de dependências de produção na pasta `build/`, migrações automáticas da base de dados e recarregamento com PM2 (`GLOXIS_BACKEND`).
*   `deploy-admin.yml`: Compilação do bundle React estático e publicação para `/var/www/gloxis/admin` com PM2 SPA (`GLOXIS_ADMIN` na porta 5173).
*   `deploy-client.yml`: Compilação do bundle React estático e publicação para `/var/www/gloxis/client` com PM2 SPA (`GLOXIS_CLIENT` na porta 5174).
*   `deploy-landing.yml`: Compilação da Landing Page e publicação para `/var/www/gloxis/landing` com PM2 SPA (`GLOXIS_LANDING` na porta 5175).
*   `ci.yml`: Validação contínua de linting, tipos TypeScript (`tsc --noEmit`) e suíte completa de testes unitários e funcionais.

---

## 🧪 Testes e Qualidade de Código

### Executar Testes do Backend (Japa / AdonisJS):
```bash
cd backend
npm test
```

### Executar Testes das Aplicações Frontend (Vitest):
```bash
# Portal Admin
cd frontend/admin && npm test

# Portal do Cliente
cd frontend/client && npm test

# Landing Page
cd frontend/landing && npm test
```

---

## 📄 Licença e Propriedade
© 2026 Gloxis Financial Services S.A. Todos os direitos reservados. Regulado pelo Banco Nacional de Angola (BNA).
