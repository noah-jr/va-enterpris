# Gloxis Financial Services - Portal Administrativo (Admin)

Portal de gestão institucional e back-office da plataforma Gloxis Financial Services S.A., desenvolvido com **React 19**, **Vite**, **TailwindCSS** e **Zero-Logic Architecture**.

---

## 🛠️ Stack Tecnológica

- **Framework & Build:** React 19, Vite, TypeScript
- **Estilização:** TailwindCSS v4, Lucide React Icons
- **Gestão de Estado & Cache:** Zustand, TanStack Query (React Query)
- **Gráficos & Métricas:** Recharts
- **Comunicação API:** Axios (`http://localhost:3333/api/v1`) + Server-Sent Events (SSE)

---

## 🚀 Comandos Principais

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (Porta 5173)
npm run dev

# Executar testes unitários e de integração (Vitest)
npm test

# Linter de código estático (Oxlint)
npm run lint

# Compilar para produção (gera pasta dist/)
npm run build
```

---

## 💻 Funcionalidades Principais

- **Dashboard Principal:** Métricas financeiras em tempo real, volume de solicitações e alertas BNA.
- **Gestão de Candidaturas:** Análise técnica, alçadas de decisão e emissão de despachos.
- **Gestão de Clientes:** Fichas completas com telemóvel, profissão, rendimento mensal e validações.
- **Operações Financeiras:** Aprovação de compras, desembolsos e renegociação de dívidas.
- **Editor de Documentos & Inbox:** Geração de certidões e atendimento a mensagens recebidas da Landing Page.

---

## 🚢 Deploy Automatizado (CI/CD)

O deploy é gerido pela pipeline `.github/workflows/deploy-admin.yml`:
1. Injeta variáveis de ambiente (`VITE_API_BASE_URL`).
2. Executa `npm run build` gerando a pasta `dist/`.
3. Sincroniza os ficheiros estáticos para `/var/www/gloxis/admin`.
4. Reinicia o servidor de ficheiros estáticos no PM2 (`GLOXIS_ADMIN` na porta 5173).
