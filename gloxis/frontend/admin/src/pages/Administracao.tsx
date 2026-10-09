import {
  PageShell, PageHeader, BtnPrimary, BtnSecondary, BtnDanger, Modal, ModalFooter,
  FormField, inputClass, selectClass, Table, StatusBadge, BtnSave, SearchInput
} from '../components/ui'
import {
  Shield, Bell, Key, Globe, Database, Clock, Lock,
  HardDrive, RefreshCw, Play, Trash2, Cpu, Activity, CheckCircle2,
  Users, UserPlus, KeyRound, ShieldCheck, Upload, Download,
  FileText, Check, Building2, Landmark, MapPin, Percent
} from 'lucide-react'
import { useAdministracao } from '../hooks/useAdministracao'

export function Administracao() {
  const {
    activeTab, setActiveTab, loading, saving, config, metrics, securityStatus,
    backupsList, isBackupAction, platformUsers, usersSearch, setUsersSearch,
    usersRoleFilter, setUsersRoleFilter, showAddUserModal, setShowAddUserModal,
    newUserForm, setNewUserForm, rolesList, selectedRole, setSelectedRole,
    auditLogs, handleCreateUserSubmit, handleDeleteUser, handleResetPassword,
    handleSave, handleCreateBackup, handleRestoreBackup, handleDeleteBackup,
    handleUploadBackup, handleDownloadBackup,
    handleInputChange, loadAuditLogs, testingSmtp, smtpResult, handleTestSmtp,
  } = useAdministracao()

  const tabs = [
    { id: 'empresa', label: 'Empresa & Instituição', desc: 'Dados Oficiais Gloxis & BNA', icon: Building2 },
    { id: 'utilizadores', label: 'Utilizadores Internos', desc: 'Gestão de Operadores ERP', icon: Users },
    { id: 'roles_rbac', label: 'Roles & Permissões (RBAC)', desc: 'Matriz de Perfis de Acesso', icon: ShieldCheck },
    { id: 'auditoria', label: 'Logs de Auditoria', desc: 'Rastreio de Ações de Segurança', icon: FileText },
    { id: 'geral', label: 'Geral & Telemetria', desc: 'Identidade & Métricas', icon: Globe },
    { id: 'seguranca', label: 'Segurança & JWT', desc: 'Sessões & Políticas MFA', icon: Shield },
    { id: 'api', label: 'API & Webhooks', desc: 'Comunicação Externa', icon: Key },
    { id: 'notificacoes', label: 'Notificações SMTP', desc: 'Gateways de Email & SMS', icon: Bell },
    { id: 'backups', label: 'Storage & Backups', desc: 'Recovery & Dumps MySQL', icon: Database },
  ] as const

  return (
    <PageShell>
      <PageHeader
        icon={Shield}
        title="Governança & Administração do Sistema"
        description="Gestão avançada de utilizadores da plataforma, matriz de permissões RBAC e segurança corporativa."
      >
        <BtnSave onClick={handleSave} saving={saving} loading={loading} label="Gravar Alterações" />
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SIDEBAR TABS */}
        <div className="lg:col-span-1 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold shadow-xs'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-zinc-200 dark:text-zinc-800' : 'text-zinc-400 dark:text-zinc-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{tab.label}</div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-400 dark:text-zinc-500'}`}>{tab.desc}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* CONTENT AREA */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 min-h-[550px] shadow-xs">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
              <RefreshCw className="w-5 h-5 animate-spin mr-2 text-zinc-900 dark:text-zinc-100" /> A carregar definições do servidor...
            </div>
          ) : (
            <>
              {/* TAB: EMPRESA */}
              {activeTab === 'empresa' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Dados Institucionais da Empresa (Gloxis)</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Informações oficiais para emissão de contratos, recibos e relatórios BNA.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* CARD 1 */}
                    <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                      <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-700 pb-2">
                        <Building2 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" /> 1. Identificação Institucional
                      </div>
                      <FormField label="Nome Comercial">
                        <input type="text" value={config.empresa_nome} onChange={e => handleInputChange('empresa_nome', e.target.value)} className={inputClass} />
                      </FormField>
                      <FormField label="Denominação Social Completa">
                        <input type="text" value={config.empresa_denominacao} onChange={e => handleInputChange('empresa_denominacao', e.target.value)} className={inputClass} />
                      </FormField>
                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="NIF Fiscal">
                          <input type="text" value={config.empresa_nif} onChange={e => handleInputChange('empresa_nif', e.target.value)} className={inputClass} />
                        </FormField>
                        <FormField label="Registo BNA">
                          <input type="text" value={config.empresa_bna_registro} onChange={e => handleInputChange('empresa_bna_registro', e.target.value)} className={inputClass} />
                        </FormField>
                      </div>
                      <FormField label="Capital Social (Kz)">
                        <input type="text" value={config.empresa_capital_social} onChange={e => handleInputChange('empresa_capital_social', e.target.value)} className={inputClass} />
                      </FormField>
                    </div>

                    {/* CARD 2 */}
                    <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                      <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-700 pb-2">
                        <MapPin className="w-4 h-4 text-zinc-500 dark:text-zinc-400" /> 2. Sede & Contactos
                      </div>
                      <FormField label="Endereço da Sede">
                        <input type="text" value={config.empresa_endereco} onChange={e => handleInputChange('empresa_endereco', e.target.value)} className={inputClass} />
                      </FormField>
                      <FormField label="Cidade / Província">
                        <input type="text" value={config.empresa_cidade} onChange={e => handleInputChange('empresa_cidade', e.target.value)} className={inputClass} />
                      </FormField>
                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="Email Oficial">
                          <input type="email" value={config.empresa_email} onChange={e => handleInputChange('empresa_email', e.target.value)} className={inputClass} />
                        </FormField>
                        <FormField label="Telefone">
                          <input type="text" value={config.empresa_telefone} onChange={e => handleInputChange('empresa_telefone', e.target.value)} className={inputClass} />
                        </FormField>
                      </div>
                      <FormField label="Website Oficial">
                        <input type="text" value={config.empresa_website} onChange={e => handleInputChange('empresa_website', e.target.value)} className={inputClass} />
                      </FormField>
                    </div>

                    {/* CARD 3 */}
                    <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                      <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-700 pb-2">
                        <Landmark className="w-4 h-4 text-zinc-500 dark:text-zinc-400" /> 3. Dados Bancários
                      </div>
                      <FormField label="Banco Principal">
                        <input type="text" value={config.empresa_banco_nome} onChange={e => handleInputChange('empresa_banco_nome', e.target.value)} className={inputClass} />
                      </FormField>
                      <FormField label="IBAN Oficial">
                        <input type="text" value={config.empresa_iban} onChange={e => handleInputChange('empresa_iban', e.target.value)} className={inputClass} />
                      </FormField>
                      <FormField label="Código SWIFT / BIC">
                        <input type="text" value={config.empresa_swift} onChange={e => handleInputChange('empresa_swift', e.target.value)} className={inputClass} />
                      </FormField>
                    </div>

                    {/* CARD 4 */}
                    <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                      <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-700 pb-2">
                        <Percent className="w-4 h-4 text-zinc-500 dark:text-zinc-400" /> 4. Microcrédito & AGT
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="Taxa Juro Mensal (%)">
                          <input type="number" step="0.1" value={config.empresa_taxa_juro_padrao} onChange={e => handleInputChange('empresa_taxa_juro_padrao', e.target.value)} className={inputClass} />
                        </FormField>
                        <FormField label="Multa Diária (%)">
                          <input type="number" step="0.1" value={config.empresa_multa_atraso_diaria} onChange={e => handleInputChange('empresa_multa_atraso_diaria', e.target.value)} className={inputClass} />
                        </FormField>
                      </div>
                      <FormField label="Regime Fiscal AGT">
                        <input type="text" value={config.empresa_agt_regime} onChange={e => handleInputChange('empresa_agt_regime', e.target.value)} className={inputClass} />
                      </FormField>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: UTILIZADORES */}
              {activeTab === 'utilizadores' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Users className="w-5 h-5 text-zinc-700 dark:text-zinc-300" /> Utilizadores Internos da Plataforma
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Registo de gestores, analistas de crédito, tesoureiros e auditores.
                      </p>
                    </div>
                    <BtnPrimary onClick={() => setShowAddUserModal(true)} icon={UserPlus}>
                      Adicionar Operador
                    </BtnPrimary>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <SearchInput value={usersSearch} onChange={setUsersSearch} placeholder="Pesquisar operador..." />
                    <select value={usersRoleFilter} onChange={e => setUsersRoleFilter(e.target.value)} className={selectClass}>
                      <option value="">Todos os Perfis (Roles)</option>
                      <option value="ADMIN">Administrador Supremo</option>
                      <option value="ANALISTA_CREDITO">Analista de Crédito</option>
                      <option value="GESTOR_FINANCEIRO">Gestor Financeiro</option>
                      <option value="OPERADOR_TESOURARIA">Operador de Tesouraria</option>
                      <option value="AGENTE_CREDITO">Agente Comercial</option>
                      <option value="AUDITOR">Auditor & Compliance</option>
                    </select>
                  </div>

                  <Table
                    headers={['Operador / Nome', 'Email', 'Perfil (Role)', 'Ações']}
                    empty={platformUsers.length === 0}
                    emptyMessage="Nenhum operador encontrado."
                  >
                    {platformUsers.map(u => (
                      <tr key={u.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
                        <td className="px-4 py-3 font-semibold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                          <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold text-xs border border-zinc-200 dark:border-zinc-700">
                            {u.fullName?.charAt(0) || u.email.charAt(0)}
                          </div>
                          {u.fullName || 'Operador Gloxis'}
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-500 dark:text-zinc-400">{u.email}</td>
                        <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end items-center gap-1.5">
                            <BtnSecondary onClick={() => handleResetPassword(u.id, u.email)} icon={KeyRound}>Password</BtnSecondary>
                            <BtnDanger onClick={() => handleDeleteUser(u.id, u.email)} icon={Trash2}>Remover</BtnDanger>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </Table>
                </div>
              )}

              {/* TAB: ROLES RBAC */}
              {activeTab === 'roles_rbac' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Matriz de Perfis & Permissões (RBAC)
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Definição granular de políticas de acesso por função corporativa.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Perfis Registados</h3>
                      {rolesList.map(r => (
                        <div key={r.code} onClick={() => setSelectedRole(r)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            selectedRole?.code === r.code
                              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold shadow-xs'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                          }`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{r.name}</span>
                            <span className="text-[10px] font-mono opacity-80">{r.code}</span>
                          </div>
                          <p className={`text-[10px] mt-1 line-clamp-2 ${selectedRole?.code === r.code ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-400 dark:text-zinc-500'}`}>
                            {r.description}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="md:col-span-2 bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 space-y-4">
                      {selectedRole ? (
                        <>
                          <div className="border-b border-zinc-200 dark:border-zinc-700 pb-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-mono">
                              {selectedRole.code}
                            </span>
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">{selectedRole.name}</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{selectedRole.description}</p>
                          </div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Chaves de Permissão Atribuídas:</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedRole.permissions.map(perm => (
                              <div key={perm} className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-800 dark:text-zinc-200">
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>{perm}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-xs">
                          Selecione um perfil na lista lateral para ver a matriz de permissões.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: AUDITORIA */}
              {activeTab === 'auditoria' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-zinc-700 dark:text-zinc-300" /> Logs de Auditoria & Atividade
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Rastreabilidade em tempo real das ações de operadores.</p>
                    </div>
                    <BtnSecondary onClick={loadAuditLogs} icon={RefreshCw}>Atualizar</BtnSecondary>
                  </div>

                  <Table
                    headers={['Ação / Endpoint', 'Operador', 'Endereço IP', 'Data / Hora']}
                    empty={auditLogs.length === 0}
                    emptyMessage="Sem registos de auditoria recentes."
                  >
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-zinc-900 dark:text-zinc-100 text-xs">{log.action}</td>
                        <td className="px-4 py-3 text-xs">
                          {log.userName ? (
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{log.userName} <span className="text-[10px] text-zinc-400">({log.userRole})</span></span>
                          ) : (
                            <span className="text-zinc-400 dark:text-zinc-500 italic">Sistema</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-500 dark:text-zinc-400 text-xs">{log.ip_address || '127.0.0.1'}</td>
                        <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 font-mono text-xs">{new Date(log.created_at).toLocaleString('pt-AO')}</td>
                      </tr>
                    ))}
                  </Table>
                </div>
              )}

              {/* TAB: GERAL */}
              {activeTab === 'geral' && (
                <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                  <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-zinc-700 dark:text-zinc-300" /> Configurações Gerais & Telemetria
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Diagnóstico do servidor em tempo real.</p>
                  </div>

                  {metrics && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1"><Clock className="w-3 h-3 text-zinc-700 dark:text-zinc-300" /> Uptime</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">{metrics.uptime}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1"><Cpu className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> RAM (Heap)</span>
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">{metrics.ram_used_mb} MB</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1"><Database className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Tamanho BD</span>
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-400 font-mono">{metrics.db_size_mb}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1"><Activity className="w-3 h-3 text-zinc-700 dark:text-zinc-300" /> Utilizadores</span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">{metrics.total_users} Registados</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Nome da Instituição">
                      <input type="text" value={config.empresa_nome} onChange={e => handleInputChange('empresa_nome', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="NIF (Identificação Fiscal)">
                      <input type="text" value={config.empresa_nif} onChange={e => handleInputChange('empresa_nif', e.target.value)} className={inputClass} />
                    </FormField>
                  </div>
                </div>
              )}

              {/* TAB: SEGURANÇA */}
              {activeTab === 'seguranca' && (
                <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                  <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Segurança & Políticas de Autenticação
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">MFA, timeout de sessões e encriptação JWT.</p>
                  </div>

                  {securityStatus && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold block">Token Auth</span>
                          <span className="font-bold text-emerald-900 dark:text-emerald-100 font-mono">JWT ({securityStatus.jwt_algorithm})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold block">Contas ADMIN</span>
                          <span className="font-bold text-emerald-900 dark:text-emerald-100 font-mono">{securityStatus.admin_accounts} Administradores</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold block">Políticas</span>
                          <span className="font-bold text-emerald-900 dark:text-emerald-100 font-mono">RBAC Ativo</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Expiração de Password (Dias)">
                      <input type="number" value={config.password_expiration_days} onChange={e => handleInputChange('password_expiration_days', e.target.value)} className={inputClass} />
                    </FormField>
                    <FormField label="Timeout da Sessão (Minutos)">
                      <input type="number" value={config.session_timeout} onChange={e => handleInputChange('session_timeout', e.target.value)} className={inputClass} />
                    </FormField>
                  </div>
                </div>
              )}

              {/* TAB: API & WEBHOOKS */}
              {activeTab === 'api' && (
                <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                  <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Key className="w-5 h-5 text-zinc-700 dark:text-zinc-300" /> Comunicação Externa & API REST / Webhooks
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Integração com sistemas terceiros, limite de requisições e eventos de webhook.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="Ativar API Pública REST">
                        <select value={config.api_enabled} onChange={e => handleInputChange('api_enabled', e.target.value)} className={selectClass}>
                          <option value="true">Ativado (Permite Chaves API)</option>
                          <option value="false">Desativado</option>
                        </select>
                      </FormField>
                      <FormField label="Limite de Requisições / Minuto (Rate Limit)">
                        <input type="number" value={config.rate_limit} onChange={e => handleInputChange('rate_limit', e.target.value)} className={inputClass} />
                      </FormField>
                    </div>

                    <FormField label="URL Global de Webhook (Eventos de Crédito & Pagamento)">
                      <input type="url" value={config.webhook_url} onChange={e => handleInputChange('webhook_url', e.target.value)} placeholder="https://api.empresa.ao/webhooks/gloxis" className={inputClass} />
                    </FormField>
                  </div>
                </div>
              )}

              {/* TAB: NOTIFICAÇÕES SMTP */}
              {activeTab === 'notificacoes' && (
                <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-zinc-700 dark:text-zinc-300" /> Servidores de Email (SMTP) & SMS Gateway
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Envio automático de alertas de cobrança, extratos e avisos de mora.</p>
                    </div>
                    <BtnSecondary onClick={handleTestSmtp} loading={testingSmtp} icon={RefreshCw}>
                      Testar Conexão SMTP
                    </BtnSecondary>
                  </div>

                  {smtpResult && (
                    <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 ${
                      smtpResult.status === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                        : 'bg-red-50 dark:bg-rose-950/40 border-red-200 dark:border-rose-800 text-red-900 dark:text-rose-100'
                    }`}>
                      {smtpResult.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Trash2 className="w-5 h-5 text-red-600 dark:text-rose-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold block">{smtpResult.status === 'success' ? 'Legação SMTP Bem Sucedida' : 'Falha na Ligação SMTP'}</span>
                        <span>{smtpResult.message}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-700 pb-2">Servidor SMTP</h3>
                      <FormField label="Host SMTP">
                        <input type="text" value={config.smtp_host} onChange={e => handleInputChange('smtp_host', e.target.value)} className={inputClass} />
                      </FormField>
                      <FormField label="Porta SMTP">
                        <input type="text" value={config.smtp_port} onChange={e => handleInputChange('smtp_port', e.target.value)} className={inputClass} />
                      </FormField>
                      <FormField label="Utilizador / Email SMTP">
                        <input type="text" value={config.smtp_user} onChange={e => handleInputChange('smtp_user', e.target.value)} className={inputClass} />
                      </FormField>
                      <FormField label="Palavra-passe SMTP">
                        <input type="password" value={config.smtp_pass} onChange={e => handleInputChange('smtp_pass', e.target.value)} className={inputClass} />
                      </FormField>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-700 pb-2">Gateway SMS & Backups</h3>
                      <FormField label="Endpoint Gateway SMS (Twilio / Local)">
                        <input type="text" value={config.sms_gateway} onChange={e => handleInputChange('sms_gateway', e.target.value)} className={inputClass} />
                      </FormField>
                      <FormField label="Bucket AWS S3 Backup">
                        <input type="text" value={config.s3_bucket} onChange={e => handleInputChange('s3_bucket', e.target.value)} className={inputClass} />
                      </FormField>
                      <FormField label="Região S3">
                        <input type="text" value={config.s3_region} onChange={e => handleInputChange('s3_region', e.target.value)} className={inputClass} />
                      </FormField>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: BACKUPS */}
              {activeTab === 'backups' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Database className="w-5 h-5 text-zinc-700 dark:text-zinc-300" /> Storage & Disaster Recovery MySQL
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Criação, carregamento (upload) e restauro (recover) de dumps de segurança SQL.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors shadow-xs">
                        <Upload className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        <span>Importar Ficheiro .SQL</span>
                        <input
                          type="file"
                          accept=".sql"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleUploadBackup(file)
                              e.target.value = ''
                            }
                          }}
                        />
                      </label>
                      <BtnPrimary onClick={handleCreateBackup} loading={isBackupAction} icon={HardDrive}>
                        Criar Backup Agora
                      </BtnPrimary>
                    </div>
                  </div>

                  <Table
                    headers={['Ficheiro SQL', 'Tamanho', 'Ações']}
                    empty={backupsList.length === 0}
                    emptyMessage='Nenhum backup encontrado. Clique em "Criar Backup Agora" ou "Importar Ficheiro .SQL".'
                  >
                    {backupsList.map(b => (
                      <tr key={b.filename} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-2">
                          <Database className="w-4 h-4 text-zinc-400" /> {b.filename}
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-500 dark:text-zinc-400 text-xs">{b.size}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <BtnSecondary onClick={() => handleDownloadBackup(b.filename)} icon={Download}>Download</BtnSecondary>
                            <BtnDanger onClick={() => handleRestoreBackup(b.filename)} icon={Play}>Restaurar (Recover)</BtnDanger>
                            <BtnSecondary onClick={() => handleDeleteBackup(b.filename)} icon={Trash2}>Apagar</BtnSecondary>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </Table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Adicionar Operador */}
      {showAddUserModal && (
        <Modal title="Adicionar Operador da Plataforma" icon={UserPlus} onClose={() => setShowAddUserModal(false)}>
          <form onSubmit={handleCreateUserSubmit} className="space-y-3.5">
            <FormField label="Nome Completo" required>
              <input type="text" required value={newUserForm.fullName} onChange={e => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                placeholder="Ex: Carlos António Silva" className={inputClass} />
            </FormField>

            <FormField label="Email Corporativo" required>
              <input type="email" required value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                placeholder="exemplo@gloxis.co.ao" className={inputClass} />
            </FormField>

            <FormField label="Palavra-passe Inicial" required>
              <input type="password" required value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                placeholder="Defina a palavra-passe do operador" className={inputClass} />
            </FormField>

            <FormField label="Perfil (Role RBAC)" required>
              <select value={newUserForm.role} onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })} className={selectClass}>
                <option value="ANALISTA_CREDITO">Analista de Risco & Crédito</option>
                <option value="GESTOR_FINANCEIRO">Gestor Financeiro / Tesoureiro</option>
                <option value="OPERADOR_TESOURARIA">Operador de Tesouraria / Caixa</option>
                <option value="AGENTE_CREDITO">Agente Comercial de Crédito</option>
                <option value="AUDITOR">Auditor & Compliance BNA</option>
                <option value="ADMIN">Administrador Supremo</option>
              </select>
            </FormField>

            <ModalFooter onCancel={() => setShowAddUserModal(false)}>
              <BtnPrimary type="submit" icon={UserPlus}>Criar Operador</BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </PageShell>
  )
}