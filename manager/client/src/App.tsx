
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { Toaster } from 'sonner';

import { themeStore } from './store/themeStore';
import { LayoutRoot } from './routes';
import { NotificationListener } from './components/NotificationListener';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } }
});

// Socket URL: em dev usa a API remota directamente (WebSocket não passa pelo proxy HTTP)
// Em prod usa a URL configurada no .env.production
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://test-api.jftech-angola.ao';

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 5000,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling'], // websocket first — avoids CORS on polling
});

function App() {
  const currentTheme = themeStore.getTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" theme={currentTheme} richColors closeButton />
      <NotificationListener />
      <LayoutRoot />
    </QueryClientProvider>
  );
}


export default App;
