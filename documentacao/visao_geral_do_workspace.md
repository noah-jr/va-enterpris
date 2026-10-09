# Visão geral dos projetos do workspace

**Data:** 9 de outubro de 2026  
**Âmbito:** aplicações encontradas na pasta `VA`

## 1. Resumo

Este workspace reúne vários produtos de software independentes. Não existe um `package.json` na raiz que os agregue num único sistema; cada aplicação ou conjunto de aplicações tem a sua própria configuração, dependências e processo de execução. As tecnologias mais comuns são TypeScript, React, Next.js, Vite, Prisma e bases de dados SQL.

Esta documentação foi preparada a partir da estrutura de pastas, dos `package.json`, dos esquemas Prisma e dos READMEs presentes no workspace. As descrições de funcionalidades refletem o código e a documentação consultados; não representam uma validação funcional ou de produção.

## 2. Mapa do workspace

| Pasta | Produto / finalidade | Estrutura e tecnologias observadas |
|---|---|---|
| `accountable/` | Tramitação e gestão de documentos | Monorepo pnpm: API Fastify/TypeScript/Prisma e portais React/Vite para clientes, administração e landing page. Inclui pacotes partilhados. |
| `geospace-v1/` | Terminal de segurança CISP | Next.js, React, Prisma e SQLite. Inclui áreas de autenticação e dashboard, módulos de emergência, mapa, gravações, monitorização e serviços de API. |
| `gloxis/` | Plataforma de microcrédito e serviços financeiros | Backend AdonisJS/TypeScript com módulos de negócio; três frontends React/Vite: administração, cliente e landing page. Há documentação técnica própria em `gloxis/docs/`. |
| `manager/` | Sistema de gestão empresarial | API Express/TypeScript/Prisma com PostgreSQL e duas aplicações React/Vite (`client` e `admin-client`). Os clientes incluem configuração para execução/empacotamento Electron. |
| `mapa-tematico/` | Aplicação geográfica temática | Next.js, React, Prisma e SQLite. O esquema inclui dados de escolas, hospitais e outras entidades georreferenciadas. |
| `schoool-lab/` | Gestão escolar e avaliação de oratória | Next.js, React e SQLite (`better-sqlite3`), com opção Turso descrita no README. Inclui gestão de estudantes/turmas, escalas, avaliação externa e relatórios PDF. |
| `va-tech-projects/events/` | Gestão de eventos e bilhetes | Frontend Next.js e backend Express/TypeScript/Prisma com MySQL. O esquema inclui utilizadores, eventos, encomendas e bilhetes. |
| `va-tech-projects/luclima/` | Presença digital e gestão de serviços Luclima | Next.js, React, Prisma e MySQL, com áreas públicas e administrativas; o README descreve serviços, portfólio, contactos e gestão de conteúdo. |
| `va-tech-projects/va-tech-enterprises/admin/` | Portal administrativo VA Tech Enterprises | Aplicação Next.js com áreas de administração e autenticação, API e módulos de blog, internauta e configurações. |
| `va-tech-projects/va-tech-enterprises/internauta/` | Portal público e área Internauta | Aplicação web com páginas de serviços, veículos, energia, carregamento, eventos, blog, conta e informação institucional. O README ainda contém texto genérico de arranque do Lovable. |

As pastas `logos/` e `diagrama_e_fluxo_site/` contêm recursos gráficos e diagramas de apoio, não aplicações executáveis identificadas.

## 3. Descrição dos produtos

### 3.1 Accountable

Plataforma de tramitação de documentos organizada como monorepo pnpm. A API está dividida em camadas de aplicação, domínio, infraestrutura e apresentação; inclui autenticação, armazenamento, OCR, e-mail, rotas e testes unitários/de integração. Os portais separam as áreas do cliente e de administração. Pacotes comuns disponibilizam tipos, schemas, componentes UI e configuração.

O README descreve MySQL, Prisma, armazenamento local ou MinIO/S3, JWT em cookies HTTP-only e bcrypt. O desenvolvimento completo requer configurar as variáveis de ambiente e os serviços definidos no Compose do projeto.

### 3.2 Geospace / CISP

Painel de operação e monitorização de segurança. A documentação do projeto descreve alertas SOS, localização, incidentes, viagens e auditoria. A estrutura inclui mapas, dashboard, áudio/gravações, vídeo, chat, serviços e integração de tempo real. O esquema Prisma consultado usa SQLite e contém utilizadores, unidades e vias, entre outros modelos.

### 3.3 Gloxis Financial Services

Plataforma financeira descrita como sistema de microcrédito, com aplicações distintas para administração, cidadãos/clientes e informação pública. O backend agrupa módulos como clientes, crédito, aprovação, garantias, operações financeiras, contratos, contabilidade, faturação, segurança, notificações e relatórios. A pasta `gloxis/docs/` contém especificações, análises e visão de arquitetura.

O README documenta portas locais 3333 (backend), 5173 (administração), 5174 (cliente) e 5175 (landing page), bem como workflows de CI/CD. Confirme as variáveis de ambiente e a configuração de base de dados antes de iniciar o serviço: a documentação indica MySQL/Redis, enquanto a configuração encontrada no backend define SQLite como ligação predefinida.

### 3.4 Manager

Conjunto de aplicações administrativas e de cliente com servidor API separado. O esquema Prisma do servidor define PostgreSQL e entidades empresariais como empresas, documentos, contratos, colaboradores, despesas, faturas, ativos e indicadores. Os frontends usam React e Vite; os manifestos também incluem scripts para Electron.

Os READMEs dos clientes são os modelos padrão do Vite e não descrevem os fluxos de negócio. Consulte as páginas e rotas em `src/` antes de assumir a cobertura funcional de cada módulo.

### 3.5 Mapa Temático

Aplicação Next.js orientada a dados geográficos temáticos. O esquema Prisma contém entidades como escolas e hospitais, com campos de localização e indicadores. O README atual desta pasta apresenta texto sobre CISP que não corresponde aos modelos temáticos observados; use o esquema e a aplicação como fontes mais fiáveis até o README ser atualizado.

### 3.6 School-Lab

Sistema de apoio à gestão escolar e a atividades de oratória. O README descreve dashboards, estudantes, turmas, geração de escalas, avaliação por links temporários, backups SQLite, mensagens e relatórios PDF. O código está organizado em rotas App Router, API, componentes, repositórios, acesso à base de dados e geração de PDF.

O README requer Node.js 18 ou superior e documenta `npm run dev` após a instalação das dependências e configuração local. A opção Turso é descrita como alternativa cloud à base SQLite local.

### 3.7 Eventos e bilhética

Aplicação composta por cliente Next.js e API Express. O README descreve áreas públicas, cliente, organizador e administração, além de compra e validação de bilhetes, eventos, blog e comunicação. O esquema Prisma declara MySQL e define estados para eventos, encomendas e bilhetes. O pacote do backend ainda não tem um comando de testes funcional (`test` termina com mensagem de ausência de testes).

### 3.8 Luclima

Site e sistema de gestão para uma empresa de climatização, higienização e desinfecção. O README descreve catálogo de serviços, projetos, testemunhos, contactos e newsletter no frontoffice, além de módulos de administração para utilizadores, serviços, portfólio, contactos e pedidos. A estrutura segue camadas de domínio, aplicação e infraestrutura. Algumas funções são identificadas no README como em desenvolvimento.

### 3.9 VA Tech Enterprises

Inclui um portal administrativo e um portal público/Internauta. O primeiro tem áreas de administração, autenticação, blog, configurações e endpoints API. O segundo possui páginas públicas e de conta relacionadas com serviços, veículos, energia e carregamento. Os READMEs disponíveis são genéricos ou têm marcadores de projeto por substituir, pelo que os detalhes devem ser confirmados no código antes de usar esta descrição como especificação de produto.

## 4. Tecnologias e dados

- **Interface:** React 18/19, Next.js 15/16 e Vite, conforme o subprojeto.
- **Linguagem:** TypeScript é predominante; existem também scripts e ferramentas auxiliares em JavaScript e Python.
- **Servidores:** Fastify, Express e AdonisJS.
- **Acesso a dados:** Prisma nos projetos Accountable, Geospace, Manager e Eventos; SQLite direto em partes do School-Lab.
- **Bases de dados:** há configurações para SQLite, MySQL e PostgreSQL. Cada aplicação deve ser configurada separadamente.
- **Tempo real e serviços externos:** os READMEs citam Socket.IO/SSE, Redis, MinIO/S3, Turso, Cloudinary e serviços de e-mail em diferentes projetos. A disponibilidade efetiva depende da configuração de cada módulo.

Não existe uma base de dados ou serviço único partilhado por todo o workspace.

## 5. Como preparar e iniciar uma aplicação

1. Escolha a pasta da aplicação concreta; a raiz `VA/` não define um comando global de instalação ou execução.
2. Consulte o README e o `package.json` dessa pasta para determinar o gestor de pacotes e os scripts disponíveis.
3. Instale as dependências na aplicação ou no monorepo correspondente. No Accountable, o README indica pnpm workspaces; nos restantes projetos, confirme lockfile e instruções locais.
4. Recrie os ficheiros de ambiente com base nos `.env.example` disponíveis e preencha valores próprios para cada serviço. Não reutilize credenciais entre aplicações nem inclua segredos nesta documentação.
5. Prepare a base de dados e execute migrações/seeds conforme os scripts do projeto.
6. Inicie a API e os frontends segundo os scripts locais. Em soluções com várias aplicações, cada processo pode precisar de um terminal e de uma porta própria.

### Estado da pasta depois da limpeza

Na limpeza solicitada antes desta documentação, foram removidos os ficheiros `.env` de configuração e os diretórios `dist`, `.next` e `build` encontrados. Os `.env.example` foram mantidos. Também foram removidos os metadados e históricos Git dos repositórios locais; a pasta `.git` da raiz permanece como um diretório vazio e somente de leitura gerido pelo ambiente.

Consequências práticas: variáveis e credenciais locais terão de ser recriadas antes de executar aplicações que delas dependam; os artefactos de compilação serão gerados novamente pelos comandos `build`; e o histórico Git local já não está disponível. Os ficheiros de base de dados versionados ou guardados fora dessas pastas não foram alvo daquela limpeza.

## 6. Divergências e pontos a confirmar

- O README de Geospace diz Next.js 15; o `package.json` declara Next.js 16.1.6.
- O README de Mapa Temático parece ter sido copiado de Geospace/CISP, enquanto o esquema contém modelos temáticos (escolas e hospitais).
- O README de Gloxis refere AdonisJS 6, MySQL e Redis; o `package.json` atual declara `@adonisjs/core` 7.x e a configuração da base de dados tem SQLite como padrão.
- Os READMEs de Manager e VA Tech Enterprises não descrevem completamente as funcionalidades atuais.
- A documentação descreve a estrutura observada, mas não executou builds, migrações, testes ou verificações de integração.

Recomenda-se atualizar esses READMEs e validar a configuração de cada projeto durante a próxima inicialização.

## 7. Referências locais consultadas

- `accountable/README.md` e manifestos em `accountable/`
- `geospace-v1/README.md`, `geospace-v1/package.json` e `geospace-v1/prisma/schema.prisma`
- `gloxis/README.md`, `gloxis/docs/` e configurações em `gloxis/backend/`
- Manifestos, código e esquema Prisma em `manager/`
- `mapa-tematico/package.json` e `mapa-tematico/prisma/schema.prisma`
- `schoool-lab/README.md` e `schoool-lab/package.json`
- `va-tech-projects/events/README.md` e manifestos/esquema em `va-tech-projects/events/`
- `va-tech-projects/luclima/README.md` e `package.json`
- Código, manifestos e READMEs em `va-tech-projects/va-tech-enterprises/`
