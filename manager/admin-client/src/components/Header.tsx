import { authStore } from "../auth/authStore";
import { useMe } from "../auth/useAuth";
import { Bell, Menu, Moon, SearchIcon, Settings, Sun } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Header = ({ onMenuOpen, toggleSidebar, isSidebarCollapsed, toggleTheme, theme }: {
  onMenuOpen: () => void;
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  toggleTheme: () => void;
  theme: string;
}) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['global-search', searchValue],
    queryFn: async () => {
      const resp = await api.get(`/search?q=${searchValue}`);
      return resp.data;
    },
    enabled: searchValue.length >= 2
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') { setIsOpen(false); inputRef.current?.blur(); }
    };
    const handleOpenSearch = () => { inputRef.current?.focus(); setIsOpen(true); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-search', handleOpenSearch);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-search', handleOpenSearch);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: notifications = [], isLoading: isLoadingNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/sub/requests/notifications')).data
  });

  const markReadMutation = useMutation({
    mutationFn: async () => await api.patch('/sub/requests/notifications/read'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const handleSelect = (url: string) => {
    navigate(url);
    setIsOpen(false);
    setSearchValue('');
  };

  return (
    <header className="h-14 bg-[var(--header-bg)] border-b border-[var(--border-color)] flex items-center justify-between px-4 shrink-0 sticky top-0 z-[100] w-full">
      {/* Mobile: hamburger */}
      <div className="flex items-center md:hidden">
        <button
          onClick={onMenuOpen}
          className="p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Desktop: sidebar toggle */}
      <div className="hidden md:flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
          title={isSidebarCollapsed ? "Expandir menu" : "Colapsar menu"}
        >
          <Menu size={18} className={`transition-transform duration-300 ${isSidebarCollapsed ? '' : 'rotate-90'}`} />
        </button>
      </div>

      {/* Desktop: search */}
      <div className="hidden md:flex flex-1 max-w-sm relative" ref={dropdownRef}>
        <div className="flex items-center bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[var(--radius-md)] px-3 py-1.5 w-full focus-within:border-[var(--accent)] transition-all">
          <SearchIcon size={14} className="text-[var(--text-muted)] mr-2 shrink-0" />
          <input
            type="text"
            ref={inputRef}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Pesquisar..."
            className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)] w-full placeholder:text-[var(--text-muted)]"
          />
        </div>

        {isOpen && searchValue.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[var(--radius-lg)] overflow-hidden z-[120] animate-fade-in">
            <div className="max-h-80 overflow-y-auto p-1.5 space-y-1 no-scrollbar">
              {isLoading && (
                <div className="p-6 text-center text-[var(--text-muted)] text-xs">
                  <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  A pesquisar...
                </div>
              )}
              {data && !isLoading && (
                <>
                  <SearchSection title="Documentos" items={data.invoices} onSelect={handleSelect} />
                  <SearchSection title="Clientes"   items={data.clients}  onSelect={handleSelect} />
                  <SearchSection title="Produtos"   items={data.products} onSelect={handleSelect} />
                  {!data.invoices.length && !data.clients.length && !data.products.length && (
                    <p className="p-6 text-center text-sm text-[var(--text-muted)]">Nenhum resultado encontrado.</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Logo center */}
      <div className="md:hidden flex-1 flex justify-center">
        <img src="/logo_full.png" alt="VA" className="h-6 w-auto object-contain" />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
          title="Tema"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (unreadCount > 0 && !showNotifications) markReadMutation.mutate();
            }}
            className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] relative transition-colors"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[var(--radius-lg)] shadow-xl z-[150] animate-fade-in">
              <div className="p-3 border-b border-[var(--border-color)] flex justify-between items-center">
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase">Notificações</h3>
                {unreadCount > 0 && <span className="bg-indigo-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">{unreadCount} Novas</span>}
              </div>
              <div className="max-h-80 overflow-y-auto no-scrollbar">
                {isLoadingNotifs ? (
                  <div className="p-4 flex justify-center"><div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>
                ) : notifications.length === 0 ? (
                  <p className="p-6 text-center text-xs text-[var(--text-muted)]">Sem novas notificações.</p>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((n: any) => (
                      <div key={n.id} className={`p-3 border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : ''}`}>
                        <p className="text-[11px] font-bold text-[var(--text-primary)]">{n.title}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-snug">{n.body}</p>
                        <p className="text-[8px] text-[var(--text-muted)] mt-1">{new Date(n.createdAt).toLocaleString('pt-PT')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="hidden md:flex w-8 h-8 rounded-[var(--radius-md)] items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
        >
          <Settings size={15} />
        </button>
        <div className="w-px h-4 bg-[var(--border-color)] mx-1 hidden sm:block" />
        <UserBadge />
      </div>
    </header>
  );
};

const SearchSection = ({ title, items, onSelect }: any) => {
  if (!items?.length) return null;
  return (
    <div>
      <p className="px-2.5 py-1 text-[10px] font-600 text-[var(--text-muted)]">{title}</p>
      {items.map((item: any) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.url)}
          className="w-full text-left px-2.5 py-2 rounded-[var(--radius-md)] hover:bg-[var(--bg-primary)] transition-colors flex items-center justify-between group"
        >
          <div>
            <p className="text-sm text-[var(--text-primary)]">{item.title}</p>
            <p className="text-xs text-[var(--text-muted)]">{item.subtitle}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

const UserBadge = () => {
  const { data: user } = useMe();
  const localUser = authStore.getUser();
  const name = user?.name || localUser?.name || 'Utilizador';
  const initials = name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="flex items-center gap-2 px-1.5 py-1 rounded-[var(--radius-md)] hover:bg-[var(--bg-primary)] transition-colors cursor-pointer">
      <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--accent)] flex items-center justify-center text-white text-[11px] font-600 shrink-0">
        {initials}
      </div>
      <span className="hidden sm:block text-sm font-500 text-[var(--text-primary)] max-w-[100px] truncate">
        {name.split(' ')[0]}
      </span>
    </div>
  );
};

export { Header, UserBadge };