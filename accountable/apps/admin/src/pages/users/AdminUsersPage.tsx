import * as React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiError, RoleDTO, UserDTO } from '@accountable/types';
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Spinner,
  formatDate,
} from '@accountable/ui';
import { KeyRound, Mail, Pencil, Search, Shield, UserCheck, UserPlus, UserX } from 'lucide-react';
import { adminApiService } from '../../services/admin-api.service.js';
import { useAdminAuthStore } from '../../stores/admin-auth.store.js';
import { roleLabel } from '../../components/AdminLayout.js';

const apiError = (err: unknown, fallback: string) => (err as AxiosError<ApiError>).response?.data?.message ?? fallback;

// ------------------------------------------------------------
const RolePicker: React.FC<{ roles: RoleDTO[]; value: string[]; onChange: (ids: string[]) => void }> = ({
  roles,
  value,
  onChange,
}) => (
  <fieldset className="space-y-2">
    <div className="flex items-center justify-between mb-1">
      <legend className="text-xs font-medium text-muted">Perfis de acesso e permissões</legend>
      <Link to="/roles" target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
        <KeyRound className="w-3.5 h-3.5" /> Criar / Gerir perfis
      </Link>
    </div>
    {roles.length === 0 && <p className="text-xs text-subtle">A carregar perfis de acesso...</p>}
    {roles.map((role) => {
      const checked = value.includes(role.id);
      return (
        <label
          key={role.id}
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            checked ? 'border-primary bg-primary-soft' : 'border-border hover:bg-surface-muted'
          }`}
        >
          <input
            type="checkbox"
            className="mt-0.5 accent-[rgb(var(--primary))]"
            checked={checked}
            onChange={() => onChange(checked ? value.filter((id) => id !== role.id) : [...value, role.id])}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{roleLabel(role.name)}</span>
              {role.name === 'ADMINISTRATOR' ? (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                  Acesso Total
                </span>
              ) : (
                <span className="text-[10px] text-muted font-mono">
                  {role.permissions.length} permissões
                </span>
              )}
            </div>
            <span className="block text-xs text-muted mt-0.5">
              {role.description ?? `${role.permissions.length} permissões configuradas no perfil.`}
            </span>
          </div>
        </label>
      );
    })}
  </fieldset>
);

// ------------------------------------------------------------
const CreateUserModal: React.FC<{ roles: RoleDTO[]; onClose: () => void }> = ({ roles, onClose }) => {
  const queryClient = useQueryClient();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [roleIds, setRoleIds] = React.useState<string[]>([]);
  const [mode, setMode] = React.useState<'invite' | 'password'>('invite');
  const [password, setPassword] = React.useState('');

  const create = useMutation({
    mutationFn: () =>
      adminApiService.createUser({ name, email, roleIds, ...(mode === 'password' ? { password } : {}) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      onClose();
    },
  });

  return (
    <Modal
      open
      title="Novo utilizador"
      description="Os utilizadores internos acedem ao painel de gestão com as permissões dos seus perfis."
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => create.mutate()} isLoading={create.isPending} disabled={!name || !email || roleIds.length === 0}>
            {mode === 'invite' ? 'Criar e enviar convite' : 'Criar utilizador'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {create.isError && <Alert tone="danger">{apiError(create.error, 'Não foi possível criar o utilizador.')}</Alert>}
        <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Email profissional" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <RolePicker roles={roles} value={roleIds} onChange={setRoleIds} />

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-muted mb-1">Acesso inicial</legend>
          <label className="flex items-start gap-3 text-sm text-foreground">
            <input type="radio" name="mode" checked={mode === 'invite'} onChange={() => setMode('invite')} className="mt-1" />
            <span>
              Enviar convite por email <Badge tone="primary">recomendado</Badge>
              <span className="block text-xs text-muted">O utilizador define a própria senha (link + código, válido 72h).</span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-foreground">
            <input type="radio" name="mode" checked={mode === 'password'} onChange={() => setMode('password')} className="mt-1" />
            <span>Definir uma senha agora</span>
          </label>
        </fieldset>

        {mode === 'password' && (
          <Input
            label="Senha inicial"
            type="password"
            autoComplete="new-password"
            helperText="Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
      </div>
    </Modal>
  );
};

// ------------------------------------------------------------
const EditUserModal: React.FC<{ user: UserDTO; roles: RoleDTO[]; isSelf: boolean; onClose: () => void }> = ({
  user,
  roles,
  isSelf,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [name, setName] = React.useState(user.name ?? '');
  const [roleIds, setRoleIds] = React.useState<string[]>(user.roleIds);

  const save = useMutation({
    mutationFn: () =>
      adminApiService.updateUser(user.id, {
        ...(name && name !== user.name ? { name } : {}),
        ...(!isSelf ? { roleIds } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      onClose();
    },
  });

  return (
    <Modal
      open
      title="Editar utilizador"
      description={user.email}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => save.mutate()} isLoading={save.isPending} disabled={!isSelf && roleIds.length === 0}>
            Guardar alterações
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {save.isError && <Alert tone="danger">{apiError(save.error, 'Não foi possível guardar.')}</Alert>}
        <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
        {isSelf ? (
          <Alert tone="info">Por segurança, os seus próprios perfis só podem ser alterados por outro administrador.</Alert>
        ) : (
          <>
            <RolePicker roles={roles} value={roleIds} onChange={setRoleIds} />
            <p className="text-xs text-subtle">Alterar perfis termina as sessões ativas do utilizador.</p>
          </>
        )}
      </div>
    </Modal>
  );
};

// ------------------------------------------------------------
export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user: me, hasPermission } = useAdminAuthStore();
  const [search, setSearch] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('ALL');
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<UserDTO | null>(null);
  const [feedback, setFeedback] = React.useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const users = useQuery({
    queryKey: ['admin', 'users', debounced],
    queryFn: () => adminApiService.listUsers({ perPage: 100, search: debounced || undefined }),
  });
  const roles = useQuery({ queryKey: ['admin', 'roles'], queryFn: () => adminApiService.listRoles() });

  const toggleActive = useMutation({
    mutationFn: (u: UserDTO) => adminApiService.updateUser(u.id, { isActive: !u.isActive }),
    onSuccess: (res) => {
      setFeedback({ tone: 'success', text: `${res.data.email} ${res.data.isActive ? 'reativado' : 'desativado'}.` });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err) => setFeedback({ tone: 'danger', text: apiError(err, 'Operação não permitida.') }),
  });

  const sendReset = useMutation({
    mutationFn: (u: UserDTO) => adminApiService.sendUserPasswordReset(u.id),
    onSuccess: (res) => setFeedback({ tone: 'success', text: res.message ?? 'Email de redefinição enviado.' }),
    onError: (err) => setFeedback({ tone: 'danger', text: apiError(err, 'Não foi possível enviar o email.') }),
  });

  const canCreate = hasPermission('users:create');
  const canUpdate = hasPermission('users:update');
  const canManageRoles = hasPermission('roles:manage');
  const rawList = users.data?.data ?? [];
  const list = React.useMemo(() => {
    if (roleFilter === 'ALL') return rawList;
    return rawList.filter((u) => u.roleIds.includes(roleFilter) || u.roles.includes(roleFilter));
  }, [rawList, roleFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Shield className="w-5 h-5" />}
        title="Utilizadores"
        description="Equipa interna com acesso ao painel de gestão"
        actions={
          <div className="flex items-center gap-2">
            {canManageRoles && (
              <Link to="/roles">
                <Button variant="outline">
                  <KeyRound className="w-4 h-4" /> Perfis & Permissões
                </Button>
              </Link>
            )}
            {canCreate && (
              <Button onClick={() => setCreating(true)}>
                <UserPlus className="w-4 h-4" /> Novo utilizador
              </Button>
            )}
          </div>
        }
      />

      {feedback && <Alert tone={feedback.tone}>{feedback.text}</Alert>}

      <div className="rounded-xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Pesquisar utilizadores"
              placeholder="Pesquisar por nome ou email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="role-filter" className="text-xs text-muted whitespace-nowrap">Filtrar perfil:</label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-surface text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="ALL">Todos os perfis</option>
              {roles.data?.data.map((r) => (
                <option key={r.id} value={r.id}>
                  {roleLabel(r.name)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {users.isLoading ? (
          <div className="py-16 flex justify-center">
            <Spinner />
          </div>
        ) : list.length === 0 ? (
          <EmptyState icon={<Shield className="w-5 h-5" />} title="Nenhum utilizador encontrado" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-muted text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-semibold">Utilizador</th>
                  <th className="px-4 py-3 font-semibold">Perfis</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Último acesso</th>
                  <th className="px-4 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((u) => {
                  const isSelf = u.id === me?.id;
                  return (
                    <tr key={u.id} data-testid={`user-row-${u.email}`} className="hover:bg-surface-muted/60">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{u.name ?? '—'}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <Badge key={r} tone={r === 'ADMINISTRATOR' ? 'primary' : 'neutral'}>
                              {roleLabel(r)}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Ativo' : 'Desativado'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">{u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Nunca'}</td>
                      <td className="px-4 py-3">
                        {canUpdate && (
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" title="Editar" aria-label={`Editar ${u.email}`} onClick={() => setEditing(u)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Enviar redefinição de senha"
                              aria-label={`Enviar redefinição de senha a ${u.email}`}
                              onClick={() => sendReset.mutate(u)}
                              disabled={!u.isActive}
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                            {!isSelf && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title={u.isActive ? 'Desativar' : 'Reativar'}
                                aria-label={`${u.isActive ? 'Desativar' : 'Reativar'} ${u.email}`}
                                onClick={() => toggleActive.mutate(u)}
                              >
                                {u.isActive ? <UserX className="w-4 h-4 text-danger" /> : <UserCheck className="w-4 h-4 text-success" />}
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-subtle flex items-center gap-1.5">
        <KeyRound className="w-3.5 h-3.5" /> As permissões de cada perfil são geridas em «Perfis & Permissões».
      </p>

      {creating && roles.data && <CreateUserModal roles={roles.data.data} onClose={() => setCreating(false)} />}
      {editing && roles.data && (
        <EditUserModal user={editing} roles={roles.data.data} isSelf={editing.id === me?.id} onClose={() => setEditing(null)} />
      )}
    </div>
  );
};
