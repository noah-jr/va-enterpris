import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Socket is initializing');
  const io = new Server(res.socket.server as any, {
    path: '/api/socket',
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  res.socket.server.io = io;

  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    // Fetch initial state
    try {
        const activeIncidents = await prisma.incident.findMany({
            where: { status: 'ATIVO' },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        socket.emit('sos:active-alerts', activeIncidents);
    } catch (err) {
        console.error('Socket initial fetch error:', err);
    }

    // Interval fetch (poll DB for new alerts)
    const interval = setInterval(async () => {
        try {
            const latestAlert = await prisma.incident.findFirst({
                where: { status: 'ATIVO' },
                orderBy: { createdAt: 'desc' }
            });
            if (latestAlert) {
                socket.emit('sos:alert', latestAlert);
            }
        } catch (err) {
            console.error('Socket interval fetch error:', err);
        }
    }, 15000);

    socket.on('disconnect', () => {
        clearInterval(interval);
        console.log('Client disconnected');
    });
  });

  res.end();
}
