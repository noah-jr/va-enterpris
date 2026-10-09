# Gloxis Financial Services - Balcão Digital do Cidadão (Client)

Portal do Cidadão e área reservada da plataforma Gloxis Financial Services S.A., desenvolvido com **React 19**, **Vite**, **TailwindCSS** e **Zero-Logic Architecture**.

---

## 🛠️ Stack Tecnológica

- **Framework & Build:** React 19, Vite, TypeScript
- **Estilização:** TailwindCSS v4, Lucide React Icons
- **Gestão de Estado:** Zustand
- **Comunicação API:** Axios (`http://localhost:3333/api/v1`)

---

## 🚀 Comandos Principais

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (Porta 5174)
npm run dev

# Executar testes unitários e de integração (Vitest)
npm test

# Compilar para produção (gera pasta dist/)
npm run build
```

---

## 💻 Funcionalidades Principais

- **Autenticação & Perfil:** Login seguro com e-mail/telemóvel, palavra-passe e validação 2FA.
- **Candidatura a Microcrédito:** Submissão de pedidos com seleção de produto, valor, prazo e comprovativos.
- **Acompanhamento de Processos:** Visualização do estado da candidatura (Pendente, Em Análise, Aprovado, Deferido).
- **Plano de Liquidação:** Acesso ao cronograma de amortizações (Tabela Price), referências de pagamento e recibos.
- **Inbox Privada:** Recepção de notificações oficiais e documentos partilhados pelos gestores.

---

## 🚢 Deploy Automatizado (CI/CD)

O deploy é gerido pela pipeline `.github/workflows/deploy-client.yml`:
1. Injeta variáveis de ambiente (`VITE_API_BASE_URL`).
2. Executa `npm run build` gerando a pasta `dist/`.
3. Sincroniza os ficheiros estáticos para `/var/www/gloxis/client`.
4. Reinicia o servidor de ficheiros estáticos no PM2 (`GLOXIS_CLIENT` na porta 5174).
