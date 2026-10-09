# Accountable — Plano de Implementação

## Contexto

**Accountable** é uma plataforma de tramitação documental B2B.
O objetivo é que uma empresa possa receber, organizar, processar e responder a documentos
de clientes, com RBAC completo, auditoria, comunicação interna e backup.

Este documento serve como referência permanente para o agente durante o desenvolvimento.

> **Estado actual (29/09/2026):** MVP completo e validado contra infraestrutura real.
> - Typecheck: 100% ✅ (zero `any`, monorepo completo em `strict: true` em todos os packages e apps)
> - Unit tests: 207/207 ✅ (16 suites de use cases, entidades e serviços)
> - Integration tests: 123/123 ✅ (15 suites contra MySQL 8.4, MailHog e Storage real)
> - Auth & Recuperação de Senha: 100% coberta (registo, verificação por link e OTP, login, forgot-password, reset por link e OTP, alteração autenticada com revogação de sessões)
> - Configuração de Email & OTP no Admin: Concluída ✅ (gestão de servidor SMTP/Gmail na BD, ativação de OTP, expirações de ativação em horas e recuperação em minutos, teste interativo com simulação e preview de OTP)
> - Clean Architecture: IOcrService desacoplado em contrato de aplicação
> Pendente: Testes E2E (Playwright) + Deploy de produção.

---

## Fases de desenvolvimento (MVP real)

| Fase | Conteúdo | Estado |
|---|---|---|
| 1 | Fundação: Monorepo, DB, Auth, RBAC, Email, Storage | ✅ Concluído |
| 2 | Área do Cliente: Registo, Login, Dashboard, Upload, Documentos | ✅ Concluído |
| 3 | Área Admin: Dashboard, Clientes, Documentos, Atribuição, Estados | ✅ Concluído |
| 4 | Comunicação: Mensagens, Anexos, Notificações, Tickets | ✅ Concluído |
| 5 | Compliance: Auditoria, Logs, Backup, Recovery, Gestão de ficheiros | ✅ Concluído |
| 6 | Landing Page: Hero, Como funciona, FAQ, Contacto, CTA | ✅ Concluído |
| 7 | Produção: Testes integração + e2e + deploy + segredos | 🔄 Em curso |

---

## Arquitectura do Backend (`apps/api`)

```
src/
├── domain/
│   ├── entities/          # Document, Client, User, Message, Ticket, AuditLog...
│   ├── value-objects/     # DocumentStatus, Email, NIP, FileChecksum...
│   ├── repositories/      # Interfaces: IDocumentRepository, IClientRepository...
│   └── errors/            # DomainError, NotFoundError, UnauthorizedError...
│
├── application/
│   ├── use-cases/         # CreateDocumentUseCase, UploadFileUseCase...
│   ├── dto/               # CreateDocumentDTO, ClientResponseDTO...
│   ├── services/          # AuditService, NotificationService...
│   └── contracts/         # IFileStorage, IEmailService, IBackupService...
│
├── infrastructure/
│   ├── database/          # Prisma client, PrismaDocumentRepository...
│   ├── storage/           # MinioFileStorage implements IFileStorage
│   ├── email/             # ResendEmailService implements IEmailService
│   ├── auth/              # JwtService, BcryptHasher
│   └── backup/            # BackupService implements IBackupService
│
└── presentation/
    ├── controllers/       # DocumentController, ClientController...
    ├── routes/            # Fastify route definitions
    ├── middlewares/       # auth, rbac, rateLimit, errorHandler
    └── validators/        # Zod schemas para request/response
```

### Regra de dependências (nunca violar)

```
Domain ← Application ← Infrastructure ← Presentation
  ↑           ↑              ↑
  └───────────┴──────────────┘
  Domain não conhece ninguém
  Application conhece só Domain
  Infrastructure implementa contratos de Application
  Presentation usa Application (use cases)
```

---

## Modelo de dados (MySQL via Prisma)

### Autenticação & Utilizadores

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String    @map("password_hash")
  isActive      Boolean   @default(true) @map("is_active")
  lastLoginAt   DateTime? @map("last_login_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")

  roles         UserRole[]
  auditLogs     AuditLog[]
  assignments   DocumentAssignment[]
  messages      Message[]
}

model Role {
  id          String           @id @default(uuid())
  name        String           @unique  // ADMINISTRATOR, CONSULTANT, SUPPORT
  description String?
  createdAt   DateTime         @default(now()) @map("created_at")

  userRoles        UserRole[]
  rolePermissions  RolePermission[]
}

model Permission {
  id          String           @id @default(uuid())
  name        String           @unique  // documents.read, clients.create...
  description String?

  rolePermissions RolePermission[]
}

model UserRole {
  userId    String   @map("user_id")
  roleId    String   @map("role_id")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])
  role Role @relation(fields: [roleId], references: [id])

  @@id([userId, roleId])
}

model RolePermission {
  roleId       String @map("role_id")
  permissionId String @map("permission_id")

  role       Role       @relation(fields: [roleId], references: [id])
  permission Permission @relation(fields: [permissionId], references: [id])

  @@id([roleId, permissionId])
}
```

### Clientes

```prisma
model Client {
  id           String    @id @default(uuid())
  nip          String    @unique  // identificador empresarial
  name         String
  email        String    @unique
  phone        String?
  company      String?
  department   String?
  isActive     Boolean   @default(false) @map("is_active")
  emailVerified Boolean  @default(false) @map("email_verified")
  passwordHash  String?  @map("password_hash")
  lastLoginAt   DateTime? @map("last_login_at")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")

  documents            Document[]
  tickets              Ticket[]
  emailVerificationTokens EmailVerificationToken[]
  passwordResetTokens  PasswordResetToken[]
}
```

### Documentos

```prisma
model Document {
  id          String         @id @default(uuid())
  clientId    String         @map("client_id")
  title       String
  description String?        @db.Text
  type        String
  priority    DocumentPriority @default(NORMAL)
  status      DocumentStatus   @default(DRAFT)
  createdAt   DateTime       @default(now()) @map("created_at")
  updatedAt   DateTime       @updatedAt @map("updated_at")
  deletedAt   DateTime?      @map("deleted_at")

  client          Client                   @relation(fields: [clientId], references: [id])
  files           DocumentFile[]
  requests        DocumentRequest[]
  statusHistory   DocumentStatusHistory[]
  assignments     DocumentAssignment[]
  messages        Message[]
}

enum DocumentStatus {
  DRAFT
  SUBMITTED
  IN_ANALYSIS
  AWAITING_DOCUMENT
  IN_PROCESSING
  REPLIED
  COMPLETED
  CANCELLED
  REJECTED
  ARCHIVED
}

enum DocumentPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

model DocumentStatusHistory {
  id           String         @id @default(uuid())
  documentId   String         @map("document_id")
  fromStatus   DocumentStatus? @map("from_status")
  toStatus     DocumentStatus @map("to_status")
  changedById  String?        @map("changed_by_id")
  note         String?        @db.Text
  createdAt    DateTime       @default(now()) @map("created_at")

  document  Document @relation(fields: [documentId], references: [id])
}

model DocumentAssignment {
  id          String   @id @default(uuid())
  documentId  String   @map("document_id")
  userId      String   @map("user_id")
  assignedAt  DateTime @default(now()) @map("assigned_at")

  document Document @relation(fields: [documentId], references: [id])
  user     User     @relation(fields: [userId], references: [id])
}
```

### Ficheiros

```prisma
model DocumentFile {
  id           String    @id @default(uuid())
  documentId   String    @map("document_id")
  originalName String    @map("original_name")
  storageName  String    @map("storage_name")
  mimeType     String    @map("mime_type")
  size         Int
  checksum     String
  storagePath  String    @map("storage_path")
  uploadedBy   String    @map("uploaded_by")  // client id ou user id
  uploaderType String    @map("uploader_type") // CLIENT ou USER
  createdAt    DateTime  @default(now()) @map("created_at")
  deletedAt    DateTime? @map("deleted_at")

  document Document @relation(fields: [documentId], references: [id])
}
```

### Mensagens (thread de comunicação)

```prisma
model Message {
  id          String      @id @default(uuid())
  documentId  String      @map("document_id")
  senderId    String      @map("sender_id")
  senderType  SenderType  @map("sender_type")  // CLIENT, USER, SYSTEM
  content     String      @db.Text
  isInternal  Boolean     @default(false) @map("is_internal")
  createdAt   DateTime    @default(now()) @map("created_at")
  deletedAt   DateTime?   @map("deleted_at")

  document Document      @relation(fields: [documentId], references: [id])
  files    MessageFile[]
}

enum SenderType {
  CLIENT
  USER
  SYSTEM
}

model MessageFile {
  id           String   @id @default(uuid())
  messageId    String   @map("message_id")
  originalName String   @map("original_name")
  storageName  String   @map("storage_name")
  mimeType     String   @map("mime_type")
  size         Int
  checksum     String
  storagePath  String   @map("storage_path")
  createdAt    DateTime @default(now()) @map("created_at")

  message Message @relation(fields: [messageId], references: [id])
}
```

### Tickets de Suporte

```prisma
model Ticket {
  id          String       @id @default(uuid())
  clientId    String       @map("client_id")
  subject     String
  category    String
  description String       @db.Text
  priority    TicketPriority @default(NORMAL)
  status      TicketStatus   @default(OPEN)
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  client   Client          @relation(fields: [clientId], references: [id])
  messages TicketMessage[]
  files    TicketFile[]
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  AWAITING_CLIENT
  RESOLVED
  CLOSED
}

enum TicketPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```

### Auditoria

```prisma
model AuditLog {
  id         String   @id @default(uuid())
  userId     String?  @map("user_id")
  clientId   String?  @map("client_id")
  action     String   // ex: DOCUMENT_CREATED, LOGIN_FAILED
  entity     String?  // ex: Document, Client
  entityId   String?  @map("entity_id")
  oldValues  Json?    @map("old_values")
  newValues  Json?    @map("new_values")
  ipAddress  String?  @map("ip_address")
  userAgent  String?  @map("user_agent")
  metadata   Json?
  createdAt  DateTime @default(now()) @map("created_at")
}
```

### Tokens de autenticação

```prisma
model EmailVerificationToken {
  id        String   @id @default(uuid())
  clientId  String   @map("client_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime @default(now()) @map("created_at")

  client Client @relation(fields: [clientId], references: [id])
}

model PasswordResetToken {
  id        String   @id @default(uuid())
  clientId  String?  @map("client_id")
  userId    String?  @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime @default(now()) @map("created_at")

  client Client? @relation(fields: [clientId], references: [id])
}
```

### Backups

```prisma
model Backup {
  id          String       @id @default(uuid())
  type        BackupType   // FULL, INCREMENTAL
  status      BackupStatus @default(PENDING)
  size        BigInt?
  storagePath String?      @map("storage_path")
  checksum    String?
  createdById String?      @map("created_by_id")
  createdAt   DateTime     @default(now()) @map("created_at")
  completedAt DateTime?    @map("completed_at")

  logs BackupLog[]
}

enum BackupType {
  FULL
  INCREMENTAL
}

enum BackupStatus {
  PENDING
  IN_PROGRESS
  SUCCESS
  FAILED
}

model BackupLog {
  id        String   @id @default(uuid())
  backupId  String   @map("backup_id")
  message   String   @db.Text
  level     String   // INFO, WARN, ERROR
  createdAt DateTime @default(now()) @map("created_at")

  backup Backup @relation(fields: [backupId], references: [id])
}
```

---

## Permissões completas do sistema

```
documents.read          documents.create        documents.update
documents.delete        documents.respond       documents.request
documents.download      documents.assign        documents.archive

clients.read            clients.create          clients.update
clients.delete          clients.block           clients.unblock

users.read              users.create            users.update
users.delete            users.manage

roles.read              roles.manage
permissions.read        permissions.manage

tickets.read            tickets.respond         tickets.close

files.read              files.download          files.delete
files.upload

audit.read
backup.create           backup.restore          backup.download

newsletter.create       newsletter.send         newsletter.manage
```

---

## Fluxo de upload de ficheiro (exemplo de use case)

```
HTTP Multipart Request
    ↓
Fastify Controller
    ↓
Zod: validar campos + ficheiro (mime, tamanho, extensão)
    ↓
UploadDocumentFileUseCase.execute(dto)
    ↓
  1. Verificar client ownership do documento
  2. Verificar estado do documento (aceita uploads?)
  3. Calcular checksum (sha256)
  4. Sanitizar filename
  5. Validar MIME vs extensão
  6. IFileStorage.upload(file) → storagePath
  7. IDocumentFileRepository.create(metadata)
  8. IAuditRepository.log(DOCUMENT_UPLOADED)
    ↓
DocumentFileDTO (sem storagePath — nunca expor)
    ↓
HTTP 201 Created
```

---

## Infraestrutura Axios (Frontend)

```
src/infrastructure/http/
├── axios-client.ts       # instância singleton com baseURL, timeout
├── interceptors.ts       # inject access token, refresh token flow, error normalize
└── api-error.ts          # tipo ApiError com code, message, details
```

Fluxo de refresh:
```
Request → 401 → interceptor → POST /auth/refresh → novo access token → retry
                                     ↓ falha
                               logout + redirect /login
```

---

## Tipos partilhados (`packages/types`)

Todos os tipos de resposta da API devem estar em `packages/types`:

```typescript
// Exemplo — nunca usar `any`
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: string;
}
```

---

## Acções de Auditoria (enum completo)

```typescript
export enum AuditAction {
  // Auth
  LOGIN                 = 'LOGIN',
  LOGOUT                = 'LOGOUT',
  LOGIN_FAILED          = 'LOGIN_FAILED',
  PASSWORD_CHANGED      = 'PASSWORD_CHANGED',
  PASSWORD_RESET        = 'PASSWORD_RESET',
  EMAIL_VERIFIED        = 'EMAIL_VERIFIED',

  // Documents
  DOCUMENT_CREATED      = 'DOCUMENT_CREATED',
  DOCUMENT_UPDATED      = 'DOCUMENT_UPDATED',
  DOCUMENT_DELETED      = 'DOCUMENT_DELETED',
  DOCUMENT_STATUS_CHANGED = 'DOCUMENT_STATUS_CHANGED',
  DOCUMENT_ASSIGNED     = 'DOCUMENT_ASSIGNED',

  // Files
  FILE_UPLOADED         = 'FILE_UPLOADED',
  FILE_DOWNLOADED       = 'FILE_DOWNLOADED',
  FILE_DELETED          = 'FILE_DELETED',

  // Communication
  MESSAGE_SENT          = 'MESSAGE_SENT',
  DOCUMENT_RESPONDED    = 'DOCUMENT_RESPONDED',
  DOCUMENT_REQUESTED    = 'DOCUMENT_REQUESTED',

  // Clients
  CLIENT_CREATED        = 'CLIENT_CREATED',
  CLIENT_UPDATED        = 'CLIENT_UPDATED',
  CLIENT_BLOCKED        = 'CLIENT_BLOCKED',
  CLIENT_UNBLOCKED      = 'CLIENT_UNBLOCKED',

  // Users
  USER_CREATED          = 'USER_CREATED',
  USER_UPDATED          = 'USER_UPDATED',
  USER_DELETED          = 'USER_DELETED',
  PERMISSION_CHANGED    = 'PERMISSION_CHANGED',

  // Backup
  BACKUP_CREATED        = 'BACKUP_CREATED',
  BACKUP_RESTORED       = 'BACKUP_RESTORED',
  BACKUP_DELETED        = 'BACKUP_DELETED',
}
```

---

## Open Questions (decidir antes da Fase 1)

> [!IMPORTANT]
> Precisam de resposta antes de iniciar o desenvolvimento

1. **Framework backend**: Fastify ou Express? (Fastify recomendado pela performance e schema validation nativa)
2. **Framework de email**: Nodemailer + SMTP próprio, ou Resend API? (Resend recomendado para MVP)
3. **Autenticação**: JWT em `httpOnly` cookies ou `Authorization: Bearer` header + memory store? (cookies httpOnly mais seguro)
4. **OTP**: TOTP (como Google Authenticator) ou OTP por email? (email OTP para MVP, TOTP depois)
5. **MinIO**: Self-hosted no Docker ou serviço S3 externo? (MinIO no Docker para MVP)
6. **Domínio**: Qual o nome/branding da plataforma? (`Accountable` confirmado?)
7. **Língua da UI**: Português (PT) ou Português (PT-AO)?

---

## Verificação de cada fase

Antes de passar para a fase seguinte:
- [ ] Todos os tipos têm zero `any`
- [ ] Testes unitários dos use cases passam
- [ ] Testes de integração dos endpoints passam
- [ ] Auditoria integrada nos use cases críticos
- [ ] RBAC verificado nos endpoints
- [ ] Sem secrets em código (usar `.env`)
