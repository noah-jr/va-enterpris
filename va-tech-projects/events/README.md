# Sistema de Compra de Bilhetes e Gestão de Eventos

## Visão Geral
Este projeto é um sistema completo para gestão de eventos e venda de bilhetes, composto por uma aplicação web moderna e uma API robusta.

## Arquitetura do Sistema

### Frontend (Cliente)
- **Framework**: Next.js 15 (SSR + SPA)
- **Estilização**: CSS Modules / Vanilla CSS (a confirmar)
- **Funcionalidades**:
  - Área Pública (Home, Eventos, Blog)
  - Área do Cliente (Dashboard, Bilhetes, Compras)
  - Área do Organizador (Gestão de Eventos)
  - Área do Administrador (Gestão Global)

### Backend (Servidor)
- **Runtime**: Node.js
- **Arquitetura**: Clean Architecture (SOLID, Repository Pattern)
- **API**: REST API (com suporte a WebSockets para chat)
- **Segurança**: JWT, Bcrypt, Rate Limiting
- **Base de Dados**: MySQL (via Prisma ORM)
- **Cache/Filas**: Redis

## Módulos
1. **Gestão de Eventos**: Criação, edição, geolocalização.
2. **Compra de Bilhetes**: Cartão, PayPal, M-Pesa.
3. **Área do Cliente**: Histórico, perfil, favoritos.
4. **Newsletter**: Integração com Mailchimp/Brevo.
5. **Blog**: Artigos e comentários.
6. **Painel Administrativo**: Logs, auditoria, relatórios.
7. **Check-in**: Validação de QR Code.
8. **Chat**: Comunicação em tempo real via WebSocket.

## Tecnologias
- **Linguagem**: TypeScript
- **Banco de Dados**: MySQL
- **ORM**: Prisma
- **Cache**: Redis
- **Containerização**: Docker (recomendado para BDs)
