# Change Log - Plataforma Gloxis Financial Services

## 31/08/2026
- **CI/CD Workflows (`.github/workflows/`)**:
  - Segregadas as pipelines de deploy em 4 ficheiros independentes: `deploy-backend.yml`, `deploy-admin.yml`, `deploy-client.yml` e `deploy-landing.yml`.
  - Configurado o deploy automatizado para AdonisJS 6 (com `node ace build`, `npm ci --omit=dev`, migrações automáticas e PM2) e para as 3 aplicações React SPA (Vite static bundle + PM2 serve).
- **Formulário de Contacto & Notificações por E-mail (`ContactoController.ts`)**:
  - Criada a rota `POST /api/v1/contacto` para a Landing Page.
  - Implementada a gravação de mensagens em `mensagens_inbox`, criação de `audit_logs`, notificação SSE em tempo real e envio de e-mails de confirmação e apoio via `NotificacaoService`.
  - Criada a rota `POST /api/v1/newsletter` para subscrições de informativos BNA.
- **Sincronização de Schema de Clientes**:
  - Adicionadas as colunas `profissao`, `renda_mensal` e `telemovel` na tabela `clientes` via migrações e atualizações do modelo Lucid ORM `Cliente.ts`.
- **Documentação Técnica (`README.md`, `documentation.md`, `architecture_overview.md`)**:
  - Atualizados os manuais de arquitetura, portas de serviço, guia de testes e instruções de CI/CD.

## 14/08/2026
- Definida a estrutura inicial do projeto em Bounded Contexts (DDD) e Clean Architecture.
- Estruturadas as diretórias para o backend AdonisJS 6 e os 3 portais frontend (Landing, Cliente, Admin).
