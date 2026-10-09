# Gloxis Financial Services - Landing Page Institucional & Portal Público

Portal Público de Informação e Apoio ao Cidadão da Gloxis Financial Services S.A., desenvolvido com **React 19**, **Vite**, **TailwindCSS** e **Zero-Logic Architecture**.

---

## 🛠️ Stack Tecnológica

- **Framework & Build:** React 19, Vite, TypeScript
- **Estilização:** TailwindCSS v4, Lucide React Icons
- **Comunicação API:** Axios (`http://localhost:3333/api/v1`)
- **Testes:** Vitest + Testing Library

---

## 🚀 Comandos Principais

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (Porta 5175)
npm run dev

# Executar testes de integração (Vitest)
npm test

# Compilar para produção (gera pasta dist/)
npm run build
```

---

## 💻 Funcionalidades Principais

- **Guia do Cidadão & Hero Slider:** Apresentação das linhas de fomento estatal e microcrédito bonificado.
- **Simulador Interativo (Tabela Price):** Cálculo instantâneo de prestações, encargos e prazos de reembolso.
- **Formulário de Contacto Direto:** Envio de dúvidas com integração à Inbox do Admin e notificações por e-mail (`apoio@gloxis.gov.ao`).
- **Subscrição de Newsletter:** Registo de e-mails para receção de atualizações regulamentares do BNA.
- **Verificação de Autenticidade:** Validação de certidões e chancelas estatais com código QR.

---

## 🚢 Deploy Automatizado (CI/CD)

O deploy é gerido pela pipeline `.github/workflows/deploy-landing.yml`:
1. Injeta variáveis de ambiente (`VITE_API_BASE_URL`).
2. Executa `npm run build` gerando a pasta `dist/`.
3. Sincroniza os ficheiros estáticos para `/var/www/gloxis/landing`.
4. Reinicia o servidor de ficheiros estáticos no PM2 (`GLOXIS_LANDING` na porta 5175).
