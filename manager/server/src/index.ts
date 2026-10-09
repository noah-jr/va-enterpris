import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import prisma from './lib/prisma';
import { authRoutes } from './routes/authRoutes';
import { webhookRoutes } from './routes/webhookRoutes';
import { InvoiceController } from './controllers/InvoiceController';
import { authMiddleware } from './middlewares/authMiddleware';
import { aiRoutes } from './routes/aiRoutes';
import { ticketRoutes } from './routes/ticketRoutes';
import { TicketController } from './controllers/TicketController';
import { subscriptionMgmtRoutes } from './routes/subscriptionMgmtRoutes';
import { SystemSettingsController } from './controllers/SystemSettingsController';
import { AIController } from './controllers/AIController';


import { subscriptionMiddleware } from './middlewares/subscriptionMiddleware';
import { route } from './routes';


const app = express();

// Em produção, confiamos no proxy reverso (Nginx, etc) para obter o IP real do cliente
// Necessário para o express-rate-limit funcionar correctamente
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS || '900000', 10), // Default: 15 minutos
    limit: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX || '100000', 10), // Aumentado para 100k
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Demasiadas requisições. Por favor, tente novamente mais tarde.' }
});

const authLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '3600000', 10), // Default: 1 hora
    limit: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '10000', 10), // Aumentado para 10k
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Demasiadas tentativas de login/registo. Por favor, tente novamente dentro de uma hora.' }
});

// Rate limiter dedicado para o chatbot público (evita abuso da API Gemini)
const publicAiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_AI_WINDOW_MS || '60000', 10), // Default: 1 minuto
    limit: parseInt(process.env.RATE_LIMIT_AI_MAX || '1000', 10), // Aumentado para 1k
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Demasiadas mensagens ao assistente. Por favor, aguarde um momento.' }
});

app.use(globalLimiter);

// ─── CORS: Origins permitidos por ambiente ────────────────────────────────────
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const DEV_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:3000',
    'null', // Necessário para contextos Electron ou arquivos locais
];

const PROD_ORIGINS = [
    'https://test.jftech-angola.ao',
    'https://app.va-onegest.co.ao',
    'https://va-onegest.co.ao',
    'https://test-api.jftech-angola.ao',
];

// Em produção só aceita os domínios de prod. Em dev aceita ambos.
const ALLOWED_ORIGINS: string[] = IS_PRODUCTION
    ? PROD_ORIGINS
    : [...DEV_ORIGINS, ...PROD_ORIGINS];

// Ativar CORS IMEDIATAMENTE (Middleware Manual para depuração total)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Se a origem estiver na lista permitida, espelhamos ela no Access-Control-Allow-Origin
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
        // Para chamadas sem origin (Postman/Server-to-Server)
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, X-API-KEY, x-company-id, X-COMPANY-ID, X-Requested-With, Cache-Control, Pragma, Expires, Origin, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Se for um preflight (pré-vôo), respondemos imediatamente com 204
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    
    next();
});

const server = createServer(app);


// Socket.IO com CORS
const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGINS,
        credentials: true,
        methods: ['GET', 'POST'],
    }
});

const PORT = process.env.PORT || 5000;

// ─── Middleware Global ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));


// ─── Rotas Públicas ───────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/webhooks', webhookRoutes);
app.get('/api/public/invoice/:id', InvoiceController.showPublic);
app.get('/api/public/settings', SystemSettingsController.getPublicSettings);

// Chatbot público da Landing Page — rate limitado para evitar abuso da API Gemini
app.post('/api/public/ai/chat', publicAiLimiter, AIController.chat);

// Trusted Partners público (Landing Page)
import { TrustedPartnerController } from './controllers/TrustedPartnerController';
app.get('/api/public/trusted-partners', TrustedPartnerController.list);

// Pesquisa pública de NIF (usada no registo)
import { taxpayerRoutes } from './routes/taxpayerRoutes';
app.use('/api/taxpayer', taxpayerRoutes);

// Rotas públicas de contacto / newsletter (sem auth)
app.post('/api/public/newsletter', TicketController.newsletter);
app.post('/api/public/contact',    TicketController.contact);

// ─── Rotas Protegidas ────────────────────────────────────────────────────────

app.use('/api', authMiddleware);
app.use('/api', subscriptionMiddleware);
app.use('/api', route);
app.use('/api/ai', authMiddleware, aiRoutes);     // Chatbot autenticado (dentro do app)
app.use('/api/sub', authMiddleware, subscriptionMgmtRoutes);

// ─── WebSocket ────────────────────────────────────────────────────────────────
app.set('io', io);
export { io };

io.on('connection', (socket) => {
    // Join room based on companyId (passed in handshake query or manually joined after auth)
    const companyId = socket.handshake.query.companyId;
    const userRole = socket.handshake.query.role;

    if (companyId) {
        socket.join(`company_${companyId}`);
        // console.log(`[WS] User joined company room: company_${companyId}`);
    }

    if (userRole === 'SUPER_ADMIN') {
        socket.join('super_admin');
    }

    socket.on('disconnect', () => {
        // console.log(`[WS] Client disconnected: ${socket.id}`);
    });
});

// ─── Rotas de Diagnóstico ─────────────────────────────────────────────────────
app.get('/', (_req, res) => {
    res.json({
        app: 'VA ONEGEST API',
        version: '2.0.0',
        env: process.env.NODE_ENV || 'development',
        status: 'online',
    });
});

app.get('/health', async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({
            status: 'ok',
            database: 'connected',
            env: process.env.NODE_ENV || 'development',
        });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected', error });
    }
});

// ─── Handler 404 ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Rota não encontrada.' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
    const env = (process.env.NODE_ENV || 'development').toUpperCase();
    console.log(`\n🚀 VA ONEGEST API [${env}] na porta ${PORT}`);
    console.log(`📡 CORS permitido para: ${ALLOWED_ORIGINS.join(', ')}\n`);
});
