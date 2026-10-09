# Gloxis Financial Services - Backend API (AdonisJS 6)

API RESTful e motor de regras financeiras da plataforma Gloxis Financial Services S.A., construída sobre **AdonisJS v6**, **TypeScript**, **Clean Architecture** e **Domain-Driven Design (DDD)**.

---

## 🛠️ Stack Tecnológica

- **Framework:** AdonisJS v6 (`@adonisjs/core`)
- **ORM & Banco de Dados:** Lucid ORM (`@adonisjs/lucid`) + MySQL 8.0
- **Cache, Rate Limit & Mensageria:** Redis (`@adonisjs/limiter`) + SSE (Server-Sent Events)
- **Serviço de Notificações:** Resend Email Provider & Twilio SMS Provider
- **Autenticação & Segurança:** JWT, Speakeasy 2FA, RBAC Guards (`ADMIN`, `GESTOR`, `DIRETOR`, `CLIENTE`), Audit Logs
- **Testes:** Japa Runner (`@japa/runner`, `@japa/assert`)

---

## 🚀 Comandos Principais

```bash
# Instalar dependências
npm install

# Iniciar ambiente de desenvolvimento (Watch mode em http://localhost:3333)
npm run dev

# Executar migrações da base de dados
node ace migration:run

# Reverter migrações
node ace migration:rollback

# Executar suíte de testes (Unitários e Funcionais)
npm test

# Validação estática de tipos TypeScript
npm run typecheck

# Compilar para produção (gera pasta standalone build/)
npm run build
```

---

## 📂 Estrutura de Módulos (Bounded Contexts)

```text
app/Modules/
├── SolicitacaoCredito/     # Candidaturas públicas, elegibilidade e Tabela Price
├── Cliente/                # Cadastro de clientes, profssão, telemóvel e BI
├── OperacaoFinanceira/     # Desembolsos, liquidações, multas e juros de mora
├── Transparencia/          # Métricas regulamentares BNA e publicação de relatórios
├── Documentos/             # Impressão de certidões, modelos e Inbox interna
└── Notificacao/            # Despacho de mensagens por e-mail e SMS
```

---

## 🚢 Deploy Automatizado (CI/CD)

O deploy em produção é executado pela pipeline `.github/workflows/deploy-backend.yml`:
1. Compila o projeto (`node ace build`).
2. Copia o artefacto para `/var/www/gloxis/backend`.
3. Instala dependências de produção na pasta `build/` (`npm ci --omit=dev`).
4. Executa migrações automáticas (`node ace.js migration:run --force`).
5. Recarrega o processo no PM2 (`GLOXIS_BACKEND`).
