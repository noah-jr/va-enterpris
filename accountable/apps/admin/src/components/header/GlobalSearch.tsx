import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X, FileCheck2, Users, LifeBuoy } from 'lucide-react';
import { Spinner } from '@accountable/ui';
import { adminApiService } from '../../services/admin-api.service.js';
import { ticketService } from '../../services/ticket.service.js';
import { useAdminAuthStore } from '../../stores/admin-auth.store.js';
import { useClickOutside } from '../../lib/use-click-outside.js';

interface SearchResults {
  documents: Array<{ id: string; title: string; status: string }>;
  clients: Array<{ id: string; name: string; email: string }>;
  tickets: Array<{ id: string; subject: string; status: string }>;
}

const MIN_CHARS = 2;

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const hasPermission = useAdminAuthStore((s) => s.hasPermission);
  const canReadTickets = hasPermission('tickets:read');
  const [value, setValue] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value.trim()), 300);
    return () => window.clearTimeout(handle);
  }, [value]);

  const close = React.useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);

  const enabled = debounced.length >= MIN_CHARS;

  const { data, isFetching } = useQuery({
    queryKey: ['admin', 'global-search', debounced, canReadTickets],
    enabled,
    queryFn: async (): Promise<SearchResults> => {
      const term = debounced.toLowerCase();
      const [docs, clients, tickets] = await Promise.all([
        adminApiService.listDocuments({ search: debounced, perPage: 5 }),
        adminApiService.listClients({ search: debounced, perPage: 5 }),
        canReadTickets ? ticketService.list({ perPage: 50 }) : Promise.resolve(null),
      ]);
      return {
        documents: docs.data.map((d) => ({ id: d.id, title: d.title, status: d.status })),
        clients: clients.data.map((c) => ({ id: c.id, name: c.name, email: c.email })),
        tickets: (tickets?.data ?? [])
          .filter((t) => t.subject.toLowerCase().includes(term))
          .slice(0, 5)
          .map((t) => ({ id: t.id, subject: t.subject, status: t.status })),
      };
    },
  });

  const go = (path: string): void => {
    setOpen(false);
    setValue('');
    navigate(path);
  };

  const hasResults =
    !!data && (data.documents.length > 0 || data.clients.length > 0 || data.tickets.length > 0);
  const showDropdown = open && value.trim().length >= MIN_CHARS;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-surface border border-border text-muted focus-within:border-zinc-700 focus-within:text-zinc-200 transition-colors">
        <Search className="w-3.5 h-3.5 shrink-0 text-subtle" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Pesquisar..."
          aria-label="Pesquisa global"
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-subtle outline-none min-w-0"
        />
        {isFetching && enabled && <Spinner size="sm" className="text-muted" />}
        {value && !isFetching && (
          <button
            type="button"
            onClick={() => {
              setValue('');
              setOpen(false);
            }}
            className="p-0.5 rounded text-subtle hover:text-foreground"
            aria-label="Limpar pesquisa"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-x-0 sm:top-11 rounded-xl bg-surface border border-border py-2 max-h-[70vh] overflow-y-auto z-40 shadow-2xl">
          {!enabled || (isFetching && !data) ? (
            <div className="flex items-center justify-center py-6">
              <Spinner size="sm" />
            </div>
          ) : !hasResults ? (
            <p className="px-4 py-6 text-center text-xs text-subtle">Sem resultados</p>
          ) : (
            <>
              <SearchGroup title="Processos" icon={FileCheck2} empty={data.documents.length === 0}>
                {data.documents.map((d) => (
                  <SearchRow
                    key={d.id}
                    primary={d.title}
                    secondary={d.status}
                    onClick={() => go(`/documents?search=${encodeURIComponent(d.title)}`)}
                  />
                ))}
              </SearchGroup>
              <SearchGroup title="Clientes" icon={Users} empty={data.clients.length === 0}>
                {data.clients.map((c) => (
                  <SearchRow
                    key={c.id}
                    primary={c.name}
                    secondary={c.email}
                    onClick={() => go(`/clients?search=${encodeURIComponent(c.email)}`)}
                  />
                ))}
              </SearchGroup>
              {canReadTickets && (
                <SearchGroup title="Tickets" icon={LifeBuoy} empty={data.tickets.length === 0}>
                  {data.tickets.map((t) => (
                    <SearchRow
                      key={t.id}
                      primary={t.subject}
                      secondary={t.status}
                      onClick={() => go('/tickets')}
                    />
                  ))}
                </SearchGroup>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

interface SearchGroupProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  empty: boolean;
  children: React.ReactNode;
}

const SearchGroup: React.FC<SearchGroupProps> = ({ title, icon: Icon, empty, children }) => {
  if (empty) return null;
  return (
    <div className="py-1">
      <div className="flex items-center gap-1.5 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-subtle">
        <Icon className="w-3 h-3" />
        {title}
      </div>
      <ul>{children}</ul>
    </div>
  );
};

interface SearchRowProps {
  primary: string;
  secondary: string;
  onClick: () => void;
}

const SearchRow: React.FC<SearchRowProps> = ({ primary, secondary, onClick }) => (
  <li>
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 px-3.5 py-2 text-left hover:bg-surface-muted/60 transition-colors"
    >
      <span className="text-xs text-foreground truncate">{primary}</span>
      <span className="text-[10px] text-subtle truncate shrink-0 max-w-[40%] font-mono">{secondary}</span>
    </button>
  </li>
);
