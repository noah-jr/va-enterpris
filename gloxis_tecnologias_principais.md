# 🏦 Gloxis — Tecnologias Principais

---

## Estado Actual do Deploy

| Componente | Onde está agora | Plano final |
|------------|----------------|-------------|
| Frontend Admin | Vercel | VPS próprio |
| Frontend Client | Vercel | VPS próprio |
| Landing Page | Vercel | VPS próprio |
| API (AdonisJS) | VPS pessoal | VPS próprio |
| MySQL | VPS pessoal | VPS próprio (Docker) |
| Redis | ⚠️ Desactivado | VPS próprio (Docker) |
| MongoDB | ⚠️ Desactivado | VPS próprio (Docker) |
| MinIO | Local / Docker | VPS próprio (Docker) |
| Domínio | — | Domínio institucional |
| Email | — | Email institucional |

> **Infra final:** Tudo centralizado num único VPS orquestrado por Docker Compose + Nginx reverse proxy + domínio próprio com SSL.

---

## 1. Node.js

**O que é:**
Node.js é o ambiente de execução (runtime) que corre JavaScript/TypeScript no servidor — fora do browser. É o motor que alimenta o backend do Gloxis.

**Papel no Gloxis:**
Todo o servidor AdonisJS corre sobre Node.js. É ele que recebe os pedidos HTTP, processa a lógica de negócio, comunica com a base de dados e responde aos frontends.

**Versão usada:** Node.js 22 LTS

**Porquê a versão 22:**
- Suporte nativo a ESM (módulos modernos) sem configuração extra
- Motor V8 actualizado com melhor performance
- Versão LTS activa — suporte garantido até 2027

---

## 2. AdonisJS

**O que é:**
Framework backend para Node.js com TypeScript. É o "Rails" ou "Laravel" do ecossistema Node — vem com tudo integrado: ORM, autenticação, validação, sessões, filas, emails e muito mais.

**Papel no Gloxis:**
É o coração do backend. Gere todas as rotas da API REST, a autenticação dos utilizadores (admin e clientes), as regras de acesso (RBAC), a comunicação com a base de dados MySQL e o processamento de ficheiros no MinIO.

**Versão usada:** AdonisJS v7

**O que faz concretamente no projecto:**
- Expõe mais de 100 endpoints REST (créditos, pagamentos, documentos, relatórios...)
- Autentica utilizadores com tokens de acesso + 2FA (dois factores)
- Controla permissões: o analista vê coisas diferentes do gestor ou do cliente
- Gera PDFs de contratos e recibos directamente no servidor
- Processa uploads de documentos e guarda-os no MinIO

---

## 3. React.js

**O que é:**
Biblioteca JavaScript para construir interfaces de utilizador (UI). Criada pelo Facebook, é actualmente a mais usada no mundo para aplicações web modernas.

**Papel no Gloxis:**
Todos os 3 portais (Admin, Cliente, Landing) são aplicações React. Cada portal é uma SPA (Single Page Application) — carrega uma vez e navega sem recarregar a página.

**Versão usada:** React 19

**Os 3 portais:**

| Portal | Público-alvo | Função |
|--------|-------------|--------|
| **Admin** | Gestores e Analistas | Gerir créditos, clientes, finanças, relatórios |
| **Client** | Clientes finais | Pedir crédito, ver parcelas, descarregar documentos |
| **Landing** | Público geral | Página de marketing e apresentação da empresa |

**Tecnologias complementares ao React:**
- **Vite** — compila e serve as aplicações React muito rapidamente
- **TailwindCSS** — estilização visual
- **React Router** — navegação entre páginas dentro da SPA
- **TanStack Query** — gestão de dados vindos da API
- **Zustand** — estado global (ex: utilizador autenticado)

---

## 4. MySQL

**O que é:**
Sistema de gestão de base de dados relacional (SGBD). Armazena dados em tabelas com relações entre elas. É um dos mais usados no mundo, especialmente em aplicações financeiras.

**Papel no Gloxis:**
É a base de dados principal — onde vivem todos os dados críticos do negócio: clientes, solicitações de crédito, pagamentos, garantias, documentos, utilizadores, auditoria.

**Versão usada:** MySQL 8.0

**Tabelas principais:**

| Tabela | O que guarda |
|--------|-------------|
| `users` | Contas de acesso (admins e clientes) |
| `clientes` | Perfil completo dos clientes |
| `solicitacoes_credito` | Pedidos de crédito e seu estado |
| `pagamentos` | Parcelas mensais de cada crédito |
| `desembolsos` | Registo do dinheiro entregue ao cliente |
| `garantias` | Colaterais apresentados pelo cliente |
| `renegociacoes` | Reestruturações de dívida |
| `faturas` | Documentos fiscais emitidos |
| `audit_logs` | Registo imutável de todas as acções |

**Estado actual:** A correr no VPS pessoal directamente.
**Plano final:** Container Docker no VPS institucional com volume persistente.

---

## 5. Redis

**O que é:**
Base de dados em memória (RAM) extremamente rápida. Não substitui o MySQL — complementa-o para operações que precisam de velocidade máxima.

**Papel no Gloxis (quando activado):**

| Uso | Descrição |
|-----|-----------|
| **Rate Limiting** | Conta quantas vezes um IP fez requests para bloquear ataques |
| **Cache** | Guarda temporariamente resultados de queries pesadas (ex: KPIs do dashboard) |
| **Sessões** | Pode guardar sessões de utilizador em vez de usar filesystem |

**Estado actual:** ⚠️ Desactivado temporariamente.
**Quando activar:** Quando o rate limiting for necessário em produção ou quando o dashboard começar a ter problemas de performance.
**Plano final:** Container Docker no VPS.

---

## 6. MinIO

**O que é:**
Servidor de armazenamento de ficheiros compatível com a API S3 da Amazon. Permite guardar ficheiros (PDFs, imagens, documentos) num servidor próprio, sem depender da Amazon ou de outros serviços cloud.

**Papel no Gloxis:**
Guarda todos os ficheiros binários do sistema:
- Comprovativos de rendimento enviados pelos clientes
- Documentos de identificação (BI, passaporte)
- PDFs de contratos de crédito gerados pelo servidor
- Recibos de pagamento em PDF
- Comprovativos de desembolso

**Como funciona:**
O AdonisJS guarda o ficheiro no MinIO e armazena apenas o caminho (`path`) na base de dados MySQL. Para aceder ao ficheiro, a API gera uma URL temporária assinada (válida por X minutos).

**Vantagem chave:**
Se no futuro quiser migrar para AWS S3 ou Cloudflare R2, o código não muda — a API é exactamente a mesma.

**Plano final:** Container Docker no VPS com volume persistente para os ficheiros.

---

## 7. MongoDB

**O que é:**
Base de dados NoSQL orientada a documentos. Em vez de tabelas e linhas, guarda dados em documentos JSON flexíveis. Ideal para dados não estruturados ou com estrutura variável.

**Papel previsto no Gloxis:**

| Uso | Descrição |
|-----|-----------|
| **Logs de sistema** | Registos de erros, eventos e métricas de performance |
| **Notificações** | Histórico de notificações enviadas (email, SMS) |
| **Dados analíticos** | Séries temporais de KPIs e dashboards |
| **Configurações dinâmicas** | Parâmetros que mudam frequentemente sem necessidade de migration |

**Porquê MongoDB e não só MySQL:**
O MySQL é rígido — cada coluna tem que ser definida previamente. O MongoDB permite guardar documentos com estruturas diferentes sem alterar o esquema. Para logs e eventos, onde cada registo pode ter campos distintos, o MongoDB é muito mais eficiente.

**Estado actual:** ⚠️ Desactivado temporariamente.
**Plano final:** Container Docker no VPS.

---

## 8. Docker

**O que é:**
Plataforma de containerização criada em 2013 e hoje o standard da indústria. A ideia central é simples: empacota uma aplicação (ou serviço) e **todas as suas dependências** — bibliotecas, versão do sistema operativo, variáveis de ambiente — num pacote chamado **container**. Esse container corre de forma 100% idêntica em qualquer máquina, seja o computador do developer, um servidor de staging ou o VPS de produção.

**A diferença entre container e máquina virtual:**
Uma máquina virtual (VM) simula um computador inteiro com o seu próprio sistema operativo — é pesada e lenta a arrancar. Um container Docker partilha o kernel do sistema operativo do servidor mas isola completamente o processo — é leve, arranca em segundos e consome muito menos RAM.

**Papel no Gloxis:**
Em vez de instalar MySQL, Redis, MinIO e MongoDB directamente no servidor (o que cria conflitos de versões, dependências e torna difícil mover ou replicar o ambiente), cada serviço corre no seu próprio container isolado, todos orquestrados pelo ficheiro `docker-compose.yml`.

**Docker Compose:**
Ferramenta que faz parte do Docker e permite definir e correr **múltiplos containers em simultâneo** com um único ficheiro de configuração (`docker-compose.yml`). Em vez de arrancar cada serviço manualmente, um único comando trata de tudo:

```bash
# Arranca todos os serviços em background
docker-compose up -d

# Para todos os serviços
docker-compose down

# Ver estado de cada serviço
docker-compose ps
```

**Serviços configurados no Gloxis:**

```
docker-compose up
    ├── mysql:8.0          → Base de dados principal (porta 3306)
    ├── redis:alpine       → Cache e Rate Limiting (porta 6379)
    ├── minio/minio        → Storage de ficheiros (porta 9000)
    └── mongo:7            → Logs e dados analíticos (porta 27017)
```

**Volumes — como os dados sobrevivem:**
Se um container for parado ou destruído, os dados desaparecem por defeito. Os **volumes Docker** resolvem isso: mapeiam uma pasta do servidor real para dentro do container. Os dados ficam no servidor mesmo que o container seja recriado.

```yaml
# Exemplo: volume do MySQL
volumes:
  - gloxis_db:/var/lib/mysql   # dados ficam no servidor, não no container
```

**Healthchecks:**
Cada serviço no compose tem um healthcheck — o Docker verifica periodicamente se o serviço está saudável. Se o MySQL demorar a arrancar, o backend espera automaticamente antes de tentar ligar.

**Vantagens para o Gloxis:**

| Vantagem | Descrição |
|----------|----------|
| **Portabilidade** | O mesmo `docker-compose.yml` funciona em qualquer VPS |
| **Isolamento** | Um serviço com problema não afecta os outros |
| **Reprodutibilidade** | O ambiente de produção é idêntico ao de desenvolvimento |
| **Volumes** | Dados persistem mesmo que o container seja destruído e recriado |
| **Facilidade** | `docker-compose up -d` arranca tudo com um comando |
| **Actualizações** | Actualizar o MySQL é mudar uma linha no compose e reiniciar |

---

## 9. PM2

**O que é:**
PM2 (Process Manager 2) é um gestor de processos para aplicações Node.js em produção. O seu trabalho é garantir que as aplicações Node estão **sempre a correr** — se uma aplicação crasha (erro fatal), o PM2 reinicia-a automaticamente sem intervenção humana.

**Porquê é necessário:**
Quando se corre `node server.js` directamente num servidor, se o processo morrer (por um erro, por falta de memória, por um restart do servidor), a aplicação fica offline até alguém a iniciar manualmente. O PM2 elimina este problema.

**Papel no Gloxis:**
Gere os 4 processos da plataforma no VPS — o backend AdonisJS e os 3 frontends estáticos:

| Processo | O que corre | Porta |
|----------|------------|-------|
| `GLOXIS_BACKEND` | `node build/bin/server.js` (AdonisJS compilado) | 3333 |
| `GLOXIS_ADMIN` | `serve -s dist` (ficheiros estáticos React) | 5173 |
| `GLOXIS_CLIENT` | `serve -s dist` (ficheiros estáticos React) | 5174 |
| `GLOXIS_LANDING` | `serve -s dist` (ficheiros estáticos React) | 5175 |

**Ficheiro de configuração (`ecosystem.config.cjs`):**
Em vez de memorizar comandos de arranque, o PM2 usa um ficheiro de configuração declarativo com todas as opções:

```js
module.exports = {
  apps: [
    {
      name: 'GLOXIS_BACKEND',
      script: './build/bin/server.js',
      instances: 1,
      autorestart: true,           // reinicia se crashar
      max_memory_restart: '1G',    // reinicia se usar mais de 1GB de RAM
      env: { NODE_ENV: 'production', PORT: 3333 }
    }
  ]
}
```

**Comandos principais:**

```bash
pm2 start ecosystem.config.cjs   # arranca todos os processos
pm2 restart GLOXIS_BACKEND       # reinicia apenas o backend
pm2 logs GLOXIS_BACKEND          # vê os logs em tempo real
pm2 status                       # estado de todos os processos
pm2 save                         # guarda a lista para auto-arranque
pm2 startup                      # configura PM2 para arrancar com o servidor
```

**`pm2 startup` — a feature mais importante:**
Configure uma vez, e se o VPS for reiniciado (por actualização, falha de energia, etc.), o PM2 e todos os processos voltam a arrancar **automaticamente** sem nenhuma intervenção.

**Relação com Docker:**
O PM2 gere as aplicações Node.js (backend e frontends), enquanto o Docker gere os serviços de dados (MySQL, Redis, MinIO, MongoDB). São complementares — o PM2 não substitui o Docker nem vice-versa.

---

## 10. VPS

**O que é:**
VPS significa **Virtual Private Server** (Servidor Privado Virtual). É um servidor físico real num datacenter que é dividido em múltiplos servidores virtuais independentes. Cada VPS tem os seus próprios recursos dedicados — CPU, RAM, armazenamento e endereço IP — e controlo total do sistema operativo (Linux).

**A diferença face a outros tipos de hosting:**

| Tipo | O que é | Controlo | Custo |
|------|---------|----------|-------|
| **Hosting partilhado** | Muitos sites no mesmo servidor | Mínimo — só ficheiros | Barato |
| **VPS** | Servidor virtual dedicado | Total — root access | Médio |
| **Servidor dedicado** | Servidor físico exclusivo | Total | Caro |
| **Cloud (AWS/GCP)** | Infraestrutura gerida | Total + serviços | Variável |

**Porquê VPS para o Gloxis:**
O Gloxis precisa de correr processos Node.js persistentes (AdonisJS + PM2), containers Docker (MySQL, Redis, MinIO, MongoDB) e ter controlo total sobre a configuração do servidor (Nginx, SSL, firewall). Num hosting partilhado nada disto é possível.

**O que está instalado no VPS do Gloxis:**

| Software | Função |
|---------|--------|
| **Ubuntu** | Sistema operativo Linux |
| **Node.js 22** | Runtime das aplicações |
| **PM2** | Gestor de processos |
| **Docker + Docker Compose** | Orquestração dos serviços de dados |
| **Nginx** | Reverse proxy + serve ficheiros estáticos + SSL |
| **Certbot** | Gestão automática de certificados SSL (HTTPS) |

**Como o Nginx funciona como reverse proxy:**
O Nginx fica na "porta da frente" do servidor (portas 80 e 443). Quando um pedido chega ao domínio `api.gloxis.ao`, o Nginx sabe que deve encaminhar esse pedido para `localhost:3333` (o AdonisJS). O utilizador nunca fala directamente com o AdonisJS — passa sempre pelo Nginx.

```
Utilizador → api.gloxis.ao (HTTPS:443)
    → Nginx (reverse proxy)
        → localhost:3333 (AdonisJS/PM2)
            → localhost:3306 (MySQL/Docker)
```

**Domínio institucional:**
Um nome de domínio próprio (ex: `gloxis.ao`) comprado e configurado para apontar para o IP do VPS. Transmite profissionalismo e confiança — essencial para uma plataforma financeira. Com o domínio configurado:
- `gloxis.ao` → Landing Page
- `app.gloxis.ao` → Portal do Cliente
- `admin.gloxis.ao` → Portal Admin
- `api.gloxis.ao` → API Backend

**Email institucional:**
Contas de email com o domínio da empresa (ex: `suporte@gloxis.ao`, `noreply@gloxis.ao`). O sistema usa este email para enviar notificações automáticas: aprovação de crédito, alertas de pagamento, reset de password, etc. Configurado via um serviço de envio de email (Resend, SendGrid ou servidor SMTP próprio) ligado ao domínio.

---

## Arquitectura Final no VPS

```
VPS Institucional
│
├── Nginx (reverse proxy + SSL)
│   ├── gloxis.ao          → Landing Page (serve /dist)
│   ├── app.gloxis.ao      → Portal Cliente (serve /dist)
│   ├── admin.gloxis.ao    → Portal Admin (serve /dist)
│   └── api.gloxis.ao      → AdonisJS API (:3333)
│
├── PM2
│   ├── GLOXIS_BACKEND     → node build/bin/server.js
│   ├── GLOXIS_ADMIN       → serve -s dist
│   ├── GLOXIS_CLIENT      → serve -s dist
│   └── GLOXIS_LANDING     → serve -s dist
│
└── Docker Compose
    ├── MySQL 8.0           → :3306 (dados relacionais)
    ├── Redis               → :6379 (cache + limiter)
    ├── MinIO               → :9000 (ficheiros)
    └── MongoDB             → :27017 (logs + analytics)
```

**Email institucional:** Configurado no domínio (ex: `@gloxis.ao`) para notificações automáticas de crédito, aprovações e alertas do sistema.
