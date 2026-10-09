import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'

export type TabType = 'empresa' | 'utilizadores' | 'roles_rbac' | 'auditoria' | 'geral' | 'seguranca' | 'api' | 'notificacoes' | 'backups'

export interface PlatformUser {
  id: number
  fullName: string
  email: string
  role: string
  createdAt?: string
}

export interface RoleDefinition {
  code: string
  name: string
  description: string
  badgeColor: string
  permissions: string[]
}

export interface AuditLogPayload {
  [key: string]: unknown
}

export interface AuditLog {
  id: number
  action: string
  ip_address: string
  payload: AuditLogPayload | null
  created_at: string
  userName?: string
  userEmail?: string
  userRole?: string
}

export interface ServerMetrics {
  uptime: string
  ram_used_mb: number
  db_size_mb: string
  total_users: number
}

export interface SecurityStatus {
  jwt_algorithm: string
  admin_accounts: number
  rbac_active: boolean
}

export interface BackupItem {
  filename: string
  size: string
}

export interface SystemConfig {
  empresa_nome: string
  empresa_denominacao: string
  empresa_nif: string
  empresa_bna_registro: string
  empresa_capital_social: string
  empresa_endereco: string
  empresa_cidade: string
  empresa_email: string
  empresa_telefone: string
  empresa_website: string
  empresa_banco_nome: string
  empresa_iban: string
  empresa_swift: string
  empresa_taxa_juro_padrao: string
  empresa_multa_atraso_diaria: string
  empresa_agt_regime: string

  fuso_horario: string
  modo_manutencao: string
  require_2fa: string
  password_expiration_days: string
  session_timeout: string
  api_enabled: string
  webhook_url: string
  rate_limit: string
  smtp_host: string
  smtp_port: string
  smtp_user: string
  smtp_pass: string
  sms_gateway: string
  backup_daily: string
  s3_bucket: string
  s3_region: string
}

export function useAdministracao() {
  const [activeTab, setActiveTab] = useState<TabType>('empresa')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [config, setConfig] = useState<SystemConfig>({
    empresa_nome: 'Gloxis Financial S.A.',
    empresa_denominacao: 'Sociedade de Microcrédito e Serviços Financeiros, S.A.',
    empresa_nif: '5417009823',
    empresa_bna_registro: '0491-MC',
    empresa_capital_social: '50000000',
    empresa_endereco: 'Av. 4 de Fevereiro, Edifício Gloxis Tower, 8º Andar',
    empresa_cidade: 'Luanda - Angola',
    empresa_email: 'contacto@gloxis.ao',
    empresa_telefone: '+244 923 000 111',
    empresa_website: 'https://gloxis.ao',
    empresa_banco_nome: 'Banco Angolano de Investimentos (BAI)',
    empresa_iban: 'AO06.0040.0000.1234.5678.1018.9',
    empresa_swift: 'BAIAAOAL',
    empresa_taxa_juro_padrao: '5.0',
    empresa_multa_atraso_diaria: '0.5',
    empresa_agt_regime: 'Regime Geral de IVA - Faturação Eletrónica Certificada',

    fuso_horario: 'Africa/Luanda',
    modo_manutencao: 'false',
    require_2fa: 'false',
    password_expiration_days: '90',
    session_timeout: '30',
    api_enabled: 'true',
    webhook_url: '',
    rate_limit: '1000',
    smtp_host: 'smtp.mailgun.org',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    sms_gateway: 'https://api.twilio.com',
    backup_daily: 'true',
    s3_bucket: 'gloxis-backup-vault',
    s3_region: 'af-south-1'
  })

  const [metrics, setMetrics] = useState<ServerMetrics | null>(null)
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null)
  const [testingSmtp, setTestingSmtp] = useState(false)
  const [smtpResult, setSmtpResult] = useState<{ status: string; message: string } | null>(null)
  const [backupsList, setBackupsList] = useState<BackupItem[]>([])
  const [isBackupAction, setIsBackupAction] = useState(false)

  // UTILIZADORES
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([])
  const [usersSearch, setUsersSearch] = useState('')
  const [usersRoleFilter, setUsersRoleFilter] = useState('')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'ANALISTA_CREDITO'
  })

  // ROLES & RBAC
  const [rolesList, setRolesList] = useState<RoleDefinition[]>([])
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null)

  // AUDITORIA
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/administracao/configuracoes')
      const data = res.data?.data !== undefined ? res.data.data : res.data
      if (data && Object.keys(data).length > 0) {
        setConfig(prev => ({ ...prev, ...data }))
      }
    } catch (err) {
      console.error("Falha ao carregar configurações", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMetrics = useCallback(async () => {
    try {
      const res = await api.get('/administracao/metrics')
      setMetrics(res.data.data)
    } catch (err) {
      console.error("Erro ao carregar métricas", err)
    }
  }, [])

  const loadSecurityStatus = useCallback(async () => {
    try {
      const res = await api.get('/administracao/security-status')
      setSecurityStatus(res.data.data)
    } catch (err) {
      console.error("Erro ao carregar status de segurança", err)
    }
  }, [])

  const loadPlatformUsers = useCallback(async () => {
    try {
      const query = new URLSearchParams()
      if (usersSearch) query.append('search', usersSearch)
      if (usersRoleFilter) query.append('role', usersRoleFilter)

      const res = await api.get(`/administracao/users?${query.toString()}`)
      const payload = res.data?.data !== undefined ? res.data.data : res.data
      setPlatformUsers(Array.isArray(payload) ? payload : (payload?.data || []))
    } catch (err) {
      console.error("Falha ao carregar utilizadores da plataforma", err)
    }
  }, [usersSearch, usersRoleFilter])

  const loadRolesAndPermissions = useCallback(async () => {
    try {
      const res = await api.get('/administracao/roles')
      const payload = res.data?.data !== undefined ? res.data.data : res.data
      const data = Array.isArray(payload) ? payload : (payload?.data || [])
      setRolesList(data)
      if (data.length > 0 && !selectedRole) {
        setSelectedRole(data[0])
      }
    } catch (err) {
      console.error("Falha ao carregar roles de permissão", err)
    }
  }, [selectedRole])

  const loadAuditLogs = useCallback(async () => {
    try {
      const res = await api.get('/administracao/audit-logs?limit=30')
      const payload = res.data?.data !== undefined ? res.data.data : res.data
      const data = Array.isArray(payload) ? payload : (payload?.data || [])
      setAuditLogs(data)
    } catch (err) {
      console.error("Falha ao carregar logs de auditoria", err)
    }
  }, [])

  const loadBackups = useCallback(async () => {
    try {
      const res = await api.get('/administracao/backups')
      const payload = res.data?.data !== undefined ? res.data.data : res.data
      const data = Array.isArray(payload) ? payload : (payload?.data || [])
      setBackupsList(data)
    } catch (err) {
      console.error("Falha ao carregar lista de backups", err)
    }
  }, [])

  useEffect(() => {
    loadSettings()
    loadMetrics()
    loadSecurityStatus()
  }, [loadSettings, loadMetrics, loadSecurityStatus])

  useEffect(() => {
    if (activeTab === 'utilizadores') loadPlatformUsers()
    if (activeTab === 'roles_rbac') loadRolesAndPermissions()
    if (activeTab === 'auditoria') loadAuditLogs()
    if (activeTab === 'backups') loadBackups()
  }, [activeTab, loadPlatformUsers, loadRolesAndPermissions, loadAuditLogs, loadBackups])

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserForm.email || !newUserForm.password || !newUserForm.role) {
      alert("Preencha todos os campos obrigatórios (Email, Palavra-passe e Perfil).")
      return
    }

    try {
      await api.post('/administracao/users', newUserForm)
      alert("Utilizador da plataforma criado com sucesso!")
      setShowAddUserModal(false)
      setNewUserForm({ fullName: '', email: '', password: '', role: 'ANALISTA_CREDITO' })
      loadPlatformUsers()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Erro ao criar utilizador."
      alert(msg)
    }
  }

  const handleDeleteUser = async (id: number, email: string) => {
    if (!confirm(`Remover o utilizador ${email} da plataforma?`)) return
    try {
      await api.delete(`/administracao/users/${id}`)
      alert("Utilizador removido com sucesso.")
      loadPlatformUsers()
    } catch (err) {
      console.error(err)
      alert("Erro ao eliminar utilizador.")
    }
  }

  const handleResetPassword = async (id: number, email: string) => {
    const newPass = prompt(`Introduza a nova palavra-passe para ${email}:`)
    if (!newPass || newPass.trim() === '') return
    try {
      await api.post(`/administracao/users/${id}/reset-password`, { newPassword: newPass })
      alert("Palavra-passe redefinida com sucesso.")
    } catch (err) {
      console.error(err)
      alert("Erro ao redefinir palavra-passe.")
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post('/administracao/configuracoes', config)
      alert("Configurações salvas e aplicadas com sucesso.")
    } catch (err) {
      console.error(err)
      alert("Erro ao gravar as configurações.")
    } finally {
      setSaving(false)
    }
  }

  const handleTestSmtp = async () => {
    setTestingSmtp(true)
    setSmtpResult(null)
    try {
      const res = await api.post('/administracao/test-smtp', {
        host: config.smtp_host,
        port: config.smtp_port
      })
      setSmtpResult({ status: 'success', message: res.data.message })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Não foi possível ligar ao servidor SMTP.'
      setSmtpResult({ status: 'error', message: msg })
    } finally {
      setTestingSmtp(false)
    }
  }

  const handleCreateBackup = async () => {
    setIsBackupAction(true)
    try {
      const res = await api.post('/administracao/backups')
      alert(res.data.message || "Backup MySQL gerado com sucesso!")
      loadBackups()
    } catch (err) {
      console.error(err)
      alert("Erro ao criar backup.")
    } finally {
      setIsBackupAction(false)
    }
  }

  const handleRestoreBackup = async (filename: string) => {
    if (!confirm(`CUIDADO: Vai sobrepor a base de dados com ${filename}. Continuar?`)) return
    setIsBackupAction(true)
    try {
      const res = await api.post('/administracao/backups/restore', { filename })
      alert(res.data.message || "Base de dados restaurada com sucesso.")
    } catch (err) {
      console.error(err)
      alert("Erro ao restaurar a base de dados.")
    } finally {
      setIsBackupAction(false)
    }
  }

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm("Remover permanentemente este backup?")) return
    try {
      await api.delete('/administracao/backups', { data: { filename } })
      loadBackups()
    } catch (err) {
      console.error(err)
      alert("Erro ao eliminar o ficheiro.")
    }
  }

  const handleUploadBackup = async (file: File) => {
    if (!file.name.endsWith('.sql')) {
      alert("Por favor selecione um ficheiro com extensão .sql")
      return
    }
    setIsBackupAction(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/administracao/backups/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert(res.data.message || "Ficheiro SQL carregado com sucesso!")
      await loadBackups()
      const uploadedName = res.data.data?.filename
      if (uploadedName && confirm(`Deseja restaurar a base de dados imediatamente com o ficheiro carregado?`)) {
        await handleRestoreBackup(uploadedName)
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Erro ao carregar ficheiro SQL."
      alert(msg)
    } finally {
      setIsBackupAction(false)
    }
  }

  const handleDownloadBackup = (filename: string) => {
    const baseURL = api.defaults.baseURL || 'http://localhost:3333/api/v1'
    const token = localStorage.getItem('gloxis_admin_token') || localStorage.getItem('gloxis_token') || localStorage.getItem('token') || ''
    const downloadUrl = `${baseURL}/administracao/backups/download/${encodeURIComponent(filename)}${token ? `?token=${encodeURIComponent(token)}` : ''}`
    window.open(downloadUrl, '_blank')
  }

  const handleInputChange = (field: keyof SystemConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: String(value) }))
  }

  return {
    activeTab,
    setActiveTab,
    loading,
    saving,
    config,
    metrics,
    securityStatus,
    testingSmtp,
    smtpResult,
    backupsList,
    isBackupAction,
    platformUsers,
    usersSearch,
    setUsersSearch,
    usersRoleFilter,
    setUsersRoleFilter,
    showAddUserModal,
    setShowAddUserModal,
    newUserForm,
    setNewUserForm,
    rolesList,
    selectedRole,
    setSelectedRole,
    auditLogs,
    handleCreateUserSubmit,
    handleDeleteUser,
    handleResetPassword,
    handleSave,
    handleTestSmtp,
    handleCreateBackup,
    handleRestoreBackup,
    handleDeleteBackup,
    handleUploadBackup,
    handleDownloadBackup,
    handleInputChange,
    loadAuditLogs,
  }
}
