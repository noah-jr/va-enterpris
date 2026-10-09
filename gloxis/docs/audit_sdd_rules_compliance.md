# Relatório de Auditoria e Análise de Conformidade (Gloxis vs sdd-workflow.md)

**Data da Análise:** 28 de Agosto de 2026  
**Escopo:** Backend (AdonisJS / TypeScript) e Frontend (`landing`, `admin`, `client`)

---

## Executive Summary

A análise detalhada do projeto **Gloxis** em relação às regras estipuladas no `sdd-workflow.md` revelou que, embora o projeto apresente uma estrutura moderna (TypeScript, AdonisJS com DDD em progresso, Vite + React nos frontends), **existem violações críticas em relação às diretrizes obrigatórias de qualidade, tipos e testes.**

### Resumo de Conformidade por Categoria

| Categoria da Regra | Status | Observações Principais |
| :--- | :---: | :--- |
| **1. Etapas Obrigatórias** | ⚠️ Parcial | Falta de testes unitários/E2E no frontend; testes de backend dependentes de serviços externos (Redis). |
| **2. Regras Globais (Proibição de `any`)** | ❌ **CRÍTICO** | Mais de 250 ocorrências de `any` no frontend (`client`) e backend. |
| **2. Regras Globais (Separação de Responsabilidades)** | ⚠️ Parcial | Páginas React contêm lógica HTTP e manipuladores diretos acoplados ao JSX. |
| **3. Diretrizes de Backend (DDD & SOLID)** | ⚠️ Parcial | Módulos DDD estruturados em `app/Modules/`, porém com arquivos e rotas legadas em `app/controllers` e `app/models`. |
| **4. Pipeline & Linter** | ❌ **CRÍTICO** | Backend falha no `npm run lint` com **2430 erros**. Frontend Admin com **121 warnings**. |

---

## 1. Análise Detalhada por Seção das Regras

### 1.1. Etapas Obrigatórias (TDD/DDT & Validação Automática)
* **Regra:** Validação de testes automáticos (unitários, integração e e2e) para todas as funcionalidades.
* **Diagnóstico no Projeto:**
  - **Backend:** `npm test` trava ou lança erros de conexão (`ECONNREFUSED 127.0.0.1:6380`) por depender de instância real de Redis sem fallback para *mock* em ambiente de teste (`.env.test`).
  - **Frontend Admin & Client:** Não possuem suíte de testes configurada (`package.json` não inclui script `test` nem executável Vitest/Jest).
  - **Frontend Landing:** Possui Vitest configurado em `package.json`, mas cobertura de testes é incipiente.

---

### 1.2. Regras Globais de Código (TypeScript & Arquitetura)

#### A. Proibição Estrita de `any` (Violação Crítica)
* **Regra:** *"Nunca utilize o tipo `any` em TypeScript. Utilize `unknown`, `never`, tipos utilitários ou generics estritos."*
* **Diagnóstico:** Foram identificadas **>250 ocorrências** de `any`.
* **Locais Críticos Identificados:**
  - `frontend/client/src/pages/Simulador.tsx`: `useState<any>(null)`, `catch (error: any)`
  - `frontend/client/src/pages/Inbox.tsx`: `useState<any[]>([])`, `(res: any)`, `marcarLida = (msg: any)`
  - `frontend/client/src/pages/Contabilidade.tsx`: `useState<any[]>([])`, `(f: any)`
  - `frontend/client/src/pages/Dashboard.tsx`: `useState<any>(null)`, `(p: any)`
  - `frontend/client/src/pages/Login.tsx`: `payload: any`, `catch (err: any)`
  - `frontend/client/src/pages/Perfil.tsx`: `useState<any>(null)`, `(res: any)`
  - `frontend/client/src/pages/MeusCreditos.tsx`: `(p: any)`, `useState<any>(null)`, `(c: any)`
  - `frontend/client/src/components/ClientLayout.tsx`: `(i: any)`, `as any`, `(item: any)`
  - `backend/database/schema.ts`: `declare payload: any | null`, `declare detalhes: any | null`
  - `backend/tests/functional/solicitacao_credito.spec.ts`: `as any`

#### B. Separação de Responsabilidades
* **Regra:** *"Toda a lógica de negócio deve estar 100% separada dos componentes visuais."*
* **Diagnóstico:**
  - Várias páginas do frontend (`Simulador.tsx`, `Inbox.tsx`, `Contabilidade.tsx`, `MeusCreditos.tsx`, `Clientes.tsx`, `Vendas.tsx`) efetuam requisições `axios`/`fetch` e transformação de dados diretamente no corpo dos componentes React, em vez de delegar para **Custom Hooks** (ex: `useSimulador`, `useInbox`) ou **Services/Stores** isolados.

---

### 1.3. Diretrizes de Backend (DDD, SOLID & Repository Pattern)

* **Regra:** Organização de camadas (Domain, Application, Infrastructure, Interface/Presentation), Repository Pattern e isolamento de dependências.
* **Diagnóstico:**
  - **Pontos Positivos:** O backend possui estrutura modular em `app/Modules/[Modulo]` com subpastas `Domain`, `Application`, `Infrastructure`, `Interface`.
  - **Technical Debt / Inconsistências:**
    - Coexistência de controllers e models legados na raiz de `app/controllers` e `app/models` (ex: `access_tokens_controller.ts`, `profile_controller.ts`).
    - Mistura de chamada ORM direta (Lucid models) em alguns Handlers/Controllers em vez de abstração estrita via interfaces de repositórios no `Domain`.

---

### 1.4. Pipeline Local & Versionamento

#### A. Linting
* **Regra:** O código deve passar em todas as regras do linter (`eslint`/`oxlint`) sem *warnings* nem erros.
* **Diagnóstico:**
  - **Backend:** `npm run lint` falhou com **2430 erros** (Erros de Prettier, regras de importação `@typescript-eslint/consistent-type-imports`, etc.).
  - **Frontend Admin:** `oxlint` retornou **121 warnings** (variáveis/importações não utilizadas como `FileText`, `Tag`, `RefreshCw`, e hooks com dependências ausentes).
  - **Frontend Client:** `oxlint` retornou **4 warnings**.
  - **Frontend Landing:** `oxlint` retornou **2 warnings**.

#### B. TypeScript Check & Build
* **TypeScript Check (`tsc --noEmit`):** PASSOU em todas as partes do projeto (Backend, Landing, Admin, Client).
* **Build (`npm run build`):**
  - Backend, Landing, Client e Admin compilam com sucesso no Vite/Adonis.
  - **Observação:** O script `build` do `frontend/admin/package.json` executa apenas `vite build` sem passar por `tsc -b` (ao contrário de `landing` e `client`).

---

## 2. Plano de Ação Recomendado para Adequação

Para garantir 100% de conformidade com o `sdd-workflow.md`, recomenda-se executar as seguintes etapas:

1. **Eliminar todos os tipos `any`:**
   - Criar DTOs e Interfaces TypeScript para todos os payloads de API no frontend e backend (`frontend/client/src/types/`, `backend/app/Modules/...`).
   - Substituir `any` por tipos explícitos ou generics estritos.

2. **Corrigir Linters e Formatadores:**
   - Rodar `npx eslint --fix .` no `backend` para corrigir os 2430 erros de formatação e imports.
   - Limpar os 121 warnings do `frontend/admin` (remover imports não utilizados e ajustar dependências de `useEffect`).

3. **Arquitetura & Separação de Responsabilidades (Frontend Zero-Logic):**
   - Extrair chamadas HTTP e estados locais de `Simulador.tsx`, `Inbox.tsx`, `Contabilidade.tsx`, `MeusCreditos.tsx` para hooks customizados (`useSimulador.ts`, `useInbox.ts`, etc.).

4. **Sanar Testes & Mocking (TDD/DDT):**
   - Corrigir o ambiente de teste no backend para não travar na falta de servidor Redis local.
   - Adicionar suíte de testes Vitest no `frontend/admin` e `frontend/client`.

5. **Consolidar DDD no Backend:**
   - Migrar os controllers legados (`app/controllers/`) e modelos legados (`app/models/`) para os respetivos módulos DDD em `app/Modules/`.
