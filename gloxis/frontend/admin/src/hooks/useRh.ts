import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'

interface Funcionario {
  id: number
  nome: string
  cargo: string
  departamento: string
  nif: string | null
  iban: string | null
  salario: number
  subsidioAlimentacao: number
  subsidioTransporte: number
  status: 'ATIVO' | 'FERIAS' | 'LICENCA' | 'DESLIGADO'
  createdAt: string
}

interface RhKpis {
  totalFuncionarios?: number
  totalColaboradores?: number
  funcionariosAtivos?: number
  ativos?: number
  massaSalarialTotal?: number
  massaSalarial?: number
  mediaSalarial?: number
}

export function useRh() {
  const [rhs, setRhs] = useState<Funcionario[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cargoFilter, setCargoFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [kpis, setKpis] = useState<RhKpis>({})
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [nome, setNome] = useState('')
  const [cargo, setCargo] = useState('ANALISTA')
  const [departamento, setDepartamento] = useState('TI & ENGENHARIA')
  const [salario, setSalario] = useState(450000)
  const [dataAdmissao, setDataAdmissao] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState('ATIVO')
  const [isSaving, setIsSaving] = useState(false)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const load = useCallback(() => {
    setLoading(true)
    api.get('/rh')
      .then(res => {
        const p = res.data?.data ?? res.data
        setRhs(Array.isArray(p) ? p : (p?.data || []))
      })
      .catch(() => setRhs([]))
      .finally(() => setLoading(false))
  }, [])

  const loadKpis = useCallback(() => {
    api.get('/rh/kpis')
      .then(res => { if (res.data) setKpis(res.data) })
      .catch(() => {})
  }, [])

  useEffect(() => { load(); loadKpis() }, [load, loadKpis])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await api.post('/rh', {
        nome, cargo, departamento, salario: Number(salario),
        dataAdmissao, status,
        subsidio_alimentacao: 35000, subsidio_transporte: 25000
      })
      showToast('Colaborador registado com sucesso!', 'success')
      setShowModal(false)
      setNome('')
      load(); loadKpis()
    } catch {
      showToast('Erro ao registar colaborador.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Confirmar remoção do colaborador?')) return
    try {
      await api.delete(`/rh/${id}`)
      showToast('Colaborador removido.', 'success')
      load(); loadKpis()
    } catch {
      showToast('Erro ao remover colaborador.', 'error')
    }
  }

  const filtered = rhs.filter(r => {
    const matchSearch = r.nome?.toLowerCase().includes(search.toLowerCase()) ||
      r.cargo?.toLowerCase().includes(search.toLowerCase()) ||
      r.departamento?.toLowerCase().includes(search.toLowerCase())
    const matchCargo = !cargoFilter || r.cargo === cargoFilter
    return matchSearch && matchCargo
  })

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const normalizedKpis = {
    totalColaboradores: kpis.totalColaboradores ?? kpis.totalFuncionarios ?? rhs.length,
    ativos: kpis.ativos ?? kpis.funcionariosAtivos ?? rhs.filter(r => r.status === 'ATIVO').length,
    massaSalarial: kpis.massaSalarial ?? kpis.massaSalarialTotal ?? rhs.reduce((acc, r) => acc + Number(r.salario), 0),
    mediaSalarial: kpis.mediaSalarial ?? 0,
  }

  return {
    rhs, loading, search, setSearch, cargoFilter, setCargoFilter,
    currentPage, setCurrentPage, perPage, setPerPage, toast, kpis: normalizedKpis,
    showModal, setShowModal, nome, setNome, cargo, setCargo, salario, setSalario,
    departamento, setDepartamento, dataAdmissao, setDataAdmissao, status, setStatus,
    isSaving, handleSubmit, handleDelete, totalItems, totalPages, paginated, load,
  }
}
