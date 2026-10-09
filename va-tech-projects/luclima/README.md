# 🌬️ Luclima - Sistema de Gestão de Serviços

Sistema completo de gestão para a Luclima Prestação de Serviço LDA, especializada em Climatização, Higienização e Desinfecção.

## 🎯 Características Principais

### FrontOffice (Site Público)
- ✅ Homepage com design premium preto e branco
- ✅ Seção Sobre Nós com missão e valores
- ✅ Catálogo de Serviços dinâmico
- ✅ Portfólio de projetos realizados
- ✅ Testemunhos de clientes
- ✅ Newsletter
- ✅ Formulário de contacto
- ✅ Blog (em desenvolvimento)
- ✅ Solicitação de serviços (em desenvolvimento)
- ✅ Dark/Light mode
- ✅ Design responsivo

### BackOffice (Painel Admin)
- 🔄 Dashboard com estatísticas
- 🔄 Gestão de utilizadores com QR Code
- 🔄 Gestão de sectores
- 🔄 Gestão de serviços (CRUD)
- 🔄 Gestão de portfólio
- 🔄 Gestão de blog
- 🔄 Gestão de newsletter
- 🔄 Gestão de contactos
- 🔄 Solicitações de serviço
- 🔄 Chat interno
- 🔄 Sistema de autenticação JWT

## 🏗️ Arquitetura

O projeto segue **Clean Architecture** com separação clara de responsabilidades:

```
src/
├── app/                    # Next.js App Router
├── components/             # Componentes React
│   ├── home/              # Componentes da homepage
│   ├── layout/            # Header, Footer
│   ├── providers/         # Theme, Query providers
│   └── ui/                # Componentes reutilizáveis
├── domain/                # Camada de Domínio
│   ├── entities/          # Entidades de negócio
│   └── repositories/      # Interfaces dos repositórios
├── application/           # Camada de Aplicação
│   └── use-cases/         # Casos de uso
└── infrastructure/        # Camada de Infraestrutura
    ├── database/          # Prisma client
    └── repositories/      # Implementações dos repositórios
```

## 🛠️ Tecnologias

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, tema preto e branco premium
- **State Management**: TanStack Query (React Query)
- **Database**: MySQL com Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Cloudinary
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Theme**: next-themes (dark/light mode)

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd luclima
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
DATABASE_URL="mysql://user:password@localhost:3306/luclima"
JWT_SECRET="your-super-secret-jwt-key"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

4. **Configure o banco de dados**
```bash
# Gerar o Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev --name init

# (Opcional) Seed do banco de dados
npx prisma db seed
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🗄️ Banco de Dados

### Modelos Principais

- **User**: Utilizadores do sistema (Admin, Gestores, Funcionários)
- **Sector**: Sectores da empresa (Residencial, Comercial, Industrial, etc.)
- **Service**: Serviços oferecidos
- **Project**: Portfólio de projetos
- **ServiceRequest**: Solicitações de serviço dos clientes
- **Post**: Artigos do blog
- **Category**: Categorias do blog
- **Newsletter**: Subscritores da newsletter
- **Contact**: Mensagens de contacto
- **ChatMessage**: Chat interno entre funcionários

### Comandos Úteis do Prisma

```bash
# Abrir Prisma Studio (interface visual)
npx prisma studio

# Gerar client após mudanças no schema
npx prisma generate

# Criar nova migration
npx prisma migrate dev --name <nome-da-migration>

# Reset do banco de dados
npx prisma migrate reset
```

## 🎨 Design System

### Cores
- **Primary**: Preto (#000000)
- **Secondary**: Cinza escuro (#1a1a1a)
- **Background**: Branco (light) / Preto (dark)
- **Foreground**: Preto (light) / Branco (dark)

### Componentes
Todos os componentes seguem o design system com:
- Animações suaves
- Hover effects
- Transições fluidas
- Responsividade total

## 📱 Funcionalidades Especiais

### QR Code para Funcionários
Cada funcionário recebe um QR Code único que, quando escaneado, direciona para o seu perfil público mostrando:
- Nome e foto
- Sector
- Especialidades
- Projetos realizados

### Sistema de Permissões
- **SUPER_ADMIN**: Acesso total
- **ADMIN**: Gestão geral
- **SECTOR_MANAGER**: Gestão do seu sector
- **EDITOR**: Gestão de conteúdo (Blog, Newsletter)
- **EMPLOYEE**: Acesso limitado

## 🚀 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificar código com Biome
npm run format       # Formatar código com Biome
```

## 📝 Próximos Passos

### Fase 1 - Backend (Em Desenvolvimento)
- [ ] Implementar todas as rotas da API
- [ ] Criar middleware de autenticação
- [ ] Implementar upload de imagens para Cloudinary
- [ ] Criar sistema de permissões
- [ ] Implementar chat em tempo real

### Fase 2 - Admin Panel
- [ ] Dashboard com estatísticas
- [ ] CRUD de utilizadores
- [ ] CRUD de serviços
- [ ] CRUD de portfólio
- [ ] CRUD de blog
- [ ] Gestão de solicitações
- [ ] Chat interno

### Fase 3 - Funcionalidades Públicas
- [ ] Página de serviços detalhada
- [ ] Formulário de solicitação de serviço
- [ ] Sistema de blog completo
- [ ] Página de portfólio com filtros
- [ ] Chatbot de atendimento

### Fase 4 - Otimizações
- [ ] SEO avançado
- [ ] Performance optimization
- [ ] PWA
- [ ] Testes automatizados
- [ ] CI/CD

## 🤝 Contribuição

Este é um projeto privado da Luclima Prestação de Serviço LDA.

## 📄 Licença

Propriedade de Luclima Prestação de Serviço LDA. Todos os direitos reservados.

---

**Desenvolvido com ❤️ seguindo Clean Architecture, SOLID e Clean Code**
