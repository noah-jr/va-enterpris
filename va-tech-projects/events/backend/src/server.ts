import { httpServer } from './infrastructure/webserver/app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server is ready`);
});
