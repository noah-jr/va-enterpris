import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiError, PermissionDTO, RoleDTO } from '@accountable/types';
import { Alert, Badge, Button, Input, Modal, PageHeader, Spinner, Textarea } from '@accountable/ui';
import { KeyRound, Lock, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { adminApiService } from '../../services/admin-api.service.js';
import { useAdminAuthStore } from '../../stores/admin-auth.store.js';
import { roleLabel } from '../../components/AdminLayout.js';

const apiError = (err: unknown, fallback: string) => (err as AxiosError<ApiError>).response?.data?.message ?? fallback;

const RESOURCE_LABELS: Record<string, string> = {
  documents: 'Processos',
  files: 'Ficheiros',
  messages: 'Mensagens',
  tickets: 'Tickets de suporte',
  clients: 'Clientes',
  users: 'Utilizadores',
  roles: 'Perfis',
  audit: 'Auditoria',
  backups: 'Backups',
  plans: 'Planos',
  contacts: 'Contactos',
  document_types: 'Tipos de documento',
  settings: 'Configurações',
  subscriptions: 'Subscrições',
  reports: 'Relatórios',
};

function groupPermissions(permissions: PermissionDTO[]): Array<[string, PermissionDTO[]]> {
  const groups = new Map<string, PermissionDTO[]>();
  for (const p of permissions) {
    const resource = p.name.split(':')[0] ?? p.name;
    groups.set(resource, [...(groups.get(resource) ?? []), p]);
  }
  return [...groups.entries()].sort(([a], [b]) => (RESOURCE_LABELS[a] ?? a).localeCompare(RESOURCE_LABELS[b] ?? b));
}

// ------------------------------------------------------------
const RoleModal: React.FC<{ role: RoleDTO | null; permissions: PermissionDTO[]; onClose: () => void }> = ({
  role,
  permissions,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [name, setName] = React.useState(role?.name ?? '');
  const [description, setDescription] = React.useState(role?.description ?? '');
  const [selected, setSelected] = React.useState<Set<string>>(new Set(role?.permissions ?? []));
  const locked = role?.name === 'ADMINISTRATOR';

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        ...(role?.isSystem ? {} : { name }),
        description: description || null,
        ...(locked ? {} : { permissions: [...selected] }),
      };
      return role ? adminApiService.updateRole(role.id, payload) : adminApiService.createRole({ name, description, permissions: [...selected] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
      onClose();
    },
  });

  const toggle = (permission: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(permission)) next.delete(permission);
      else next.add(permission);
      return next;
    });

  const toggleGroup = (items: PermissionDTO[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of items) {
        if (on) next.add(p.name);
        else next.delete(p.name);
      }
      return next;
    });

  return (
    <Modal
      open
      size="lg"
      title={role ? `Editar perfil ${roleLabel(role.name)}` : 'Novo perfil'}
      description="Os utilizadores com este perfil recebem exatamente as permissões selecionadas."
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => save.mutate()} isLoading={save.isPending} disabled={!name || (!locked && selected.size === 0)}>
            {role ? 'Guardar perfil' : 'Criar perfil'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {save.isError && <Alert tone="danger">{apiError(save.error, 'Não foi possível guardar o perfil.')}</Alert>}
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            label="Nome do perfil"
            value={name}
            disabled={role?.isSystem}
            helperText={role?.isSystem ? 'Perfil de sistema — não pode ser renomeado.' : 'Ex.: GESTOR_FINANCEIRO'}
            onChange={(e) => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
          />
          <Textarea label="Descrição" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {locked ? (
          <Alert tone="info">
            <span className="inline-flex items-center gap-2">
              <Lock className="w-4 h-4" /> O perfil Administrador tem sempre todas as permissões.
            </span>
          </Alert>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3" data-testid="permission-matrix">
            {groupPermissions(permissions).map(([resource, items]) => {
              const all = items.every((p) => selected.has(p.name));
              return (
                <fieldset key={resource} className="rounded-lg border border-border p-3">
                  <legend className="px-1 text-xs font-semibold text-foreground flex items-center gap-2">
                    {RESOURCE_LABELS[resource] ?? resource}
                    <button
                      type="button"
                      className="text-[11px] font-medium text-primary hover:underline"
                      onClick={() => toggleGroup(items, !all)}
                    >
                      {all ? 'Nenhuma' : 'Todas'}
                    </button>
                  </legend>
                  <div className="space-y-1.5 mt-1">
                    {items.map((p) => (
                      <label key={p.name} className="flex items-start gap-2 text-xs text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={selected.has(p.name)}
                          onChange={() => toggle(p.name)}
                          aria-label={p.name}
                        />
                        <span>
                          {p.description ?? p.name}
                          <span className="block font-mono text-[10px] text-subtle">{p.name}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

// ------------------------------------------------------------
export const AdminRolesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const canManage = useAdminAuthStore((s) => s.hasPermission('roles:manage'));
  const [editing, setEditing] = React.useState<RoleDTO | 'new' | null>(null);
  const [feedback, setFeedback] = React.useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  const roles = useQuery({ queryKey: ['admin', 'roles'], queryFn: () => adminApiService.listRoles() });
  const permissions = useQuery({ queryKey: ['admin', 'permissions'], queryFn: () => adminApiService.listPermissions() });

  const remove = useMutation({
    mutationFn: (role: RoleDTO) => adminApiService.deleteRole(role.id),
    onSuccess: () => {
      setFeedback({ tone: 'success', text: 'Perfil eliminado.' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
    onError: (err) => setFeedback({ tone: 'danger', text: apiError(err, 'Não foi possível eliminar o perfil.') }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<KeyRound className="w-5 h-5" />}
        title="Perfis & Permissões"
        description="Defina o que cada função da equipa pode fazer no sistema"
        actions={
          canManage && (
            <Button onClick={() => setEditing('new')}>
              <Plus className="w-4 h-4" /> Novo perfil
            </Button>
          )
        }
      />

      {feedback && <Alert tone={feedback.tone}>{feedback.text}</Alert>}

      {roles.isLoading ? (
        <div className="py-16 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(roles.data?.data ?? []).map((role) => (
            <article
              key={role.id}
              data-testid={`role-card-${role.name}`}
              className="rounded-xl border border-border bg-surface p-5 shadow-card flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{roleLabel(role.name)}</h2>
                  <p className="text-xs font-mono text-subtle">{role.name}</p>
                </div>
                {role.isSystem && <Badge tone="primary">Sistema</Badge>}
              </div>
              <p className="text-sm text-muted min-h-[2.5rem]">{role.description ?? 'Sem descrição.'}</p>
              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" /> {role.permissions.length} permissões
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {role.usersCount} utilizador(es)
                </span>
              </div>
              {canManage && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" onClick={() => setEditing(role)}>
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </Button>
                  {!role.isSystem && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Eliminar perfil ${role.name}`}
                      onClick={() => remove.mutate(role)}
                      disabled={role.usersCount > 0}
                      title={role.usersCount > 0 ? 'Reatribua os utilizadores antes de eliminar' : 'Eliminar'}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-danger" />
                    </Button>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {editing && permissions.data && (
        <RoleModal
          role={editing === 'new' ? null : editing}
          permissions={permissions.data.data}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};
