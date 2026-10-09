import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import prisma from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SocketServer extends HTTPServer {
  io?: Server | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  // Socket.io polling requires both GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (res.socket.server.io) {
    console.log('✅ [GEOSPACE] Socket.io already active on server');
    res.end();
    return;
  }

  try {
    console.log('🚀 [GEOSPACE] Initializing new Socket.io implementation...');
    
    const io = new Server(res.socket.server as any, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      // Optimization for Next.js environment
      allowEIO3: true,
      pingInterval: 10000,
      pingTimeout: 5000,
    });

    res.socket.server.io = io;

    io.on('connection', async (socket) => {
      console.log('📡 [GEOSPACE] New client node synchronized:', socket.id);

      // Secure payload delivery
      try {
          const activeIncidents = await prisma.incident.findMany({
              where: { status: 'ATIVO' },
              orderBy: { createdAt: 'desc' },
              take: 20
          });
          socket.emit('sos:active-alerts', activeIncidents);
          console.log(`📤 [GEOSPACE] Sync burst: ${activeIncidents.length} incidents to node ${socket.id}`);
      } catch (err: any) {
          console.error('❌ [GEOSPACE] initial-sync error:', err.message);
          socket.emit('error', { message: 'Infr synchronization failed', code: 'DB_ERROR' });
      }

      // Live Ticker Pipeline
      const ticker = setInterval(async () => {
          try {
              const latestAlert = await prisma.incident.findFirst({
                  where: { status: 'ATIVO' },
                  orderBy: { createdAt: 'desc' }
              });
              if (latestAlert) {
                  socket.emit('sos:alert', latestAlert);
              }
          } catch (err: any) {
              console.error('❌ [GEOSPACE] Ticker pipeline fault:', err.message);
          }
      }, 15000);

      socket.on('disconnect', (reason) => {
          clearInterval(ticker);
          console.log(`🔌 [GEOSPACE] Node detached from mesh (${reason}):`, socket.id);
      });
    });

    console.log('✨ [GEOSPACE] MTNI Socket Mesh operational at /api/socket');
    res.end();
  } catch (error: any) {
    console.error('🔥 [GEOSPACE] CRITICAL MESH FAILURE:', error);
    res.status(500).json({ error: 'Socket initialization failed', details: error.message });
  }
}
