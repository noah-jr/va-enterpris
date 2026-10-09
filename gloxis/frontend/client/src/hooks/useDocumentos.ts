import { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'
import { useAuth } from '../store/useAuth'

export interface Documento {
  id: number
  titulo: string
  caminho: string
  categoria: string
  status: string
  notas?: string
  clienteNome?: string
  clienteEmail?: string
  created_at: string
}

export function useDocumentos() {
  const { user } = useAuth()
  const [docs, setDocs] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODOS')
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [error, setError] = useState('')

  const carregar = useCallback(() => {
    setLoading(true)
    api.get('/documentos', {
      params: {
        cliente_email: user?.email,
        perPage: 100,
      }
    })
      .then((res: { data?: { data?: Documento[] } | Documento[] }) => {
        const d = res.data
        let all: Documento[] = []
        if (Array.isArray(d)) all = d
        else if (d && 'data' in d && Array.isArray(d.data)) all = d.data as Documento[]
        else if (d && 'data' in d && d.data && typeof d.data === 'object' && 'data' in d.data && Array.isArray(d.data.data)) all = d.data.data as Documento[]

        const myDocs = all.filter((doc: Documento) =>
          !doc.clienteEmail || doc.clienteEmail === user?.email || doc.clienteNome === user?.fullName
        )
        setDocs(myDocs)
      })
      .catch(() => setError('Não foi possível carregar os documentos.'))
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    carregar()
  }, [carregar])

  const handleDelete = async (id: number) => {
    if (!confirm('Tem a certeza que pretende remover este documento? Esta acção é irreversível.')) return
    setDeleting(id)
    try {
      await api.delete(`/documentos/${id}`)
      setDocs(prev => prev.filter(d => d.id !== id))
    } catch {
      alert('Não foi possível remover o documento.')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = docs.filter(d => {
    const matchCat = categoriaFiltro === 'TODOS' || d.categoria === categoriaFiltro
    const matchSearch = !search || d.titulo.toLowerCase().includes(search.toLowerCase()) || d.categoria.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const countFor = (cat: string) => cat === 'TODOS' ? docs.length : docs.filter(d => d.categoria === cat).length

  return {
    user,
    docs,
    loading,
    categoriaFiltro,
    setCategoriaFiltro,
    search,
    setSearch,
    showUpload,
    setShowUpload,
    deleting,
    error,
    carregar,
    handleDelete,
    filtered,
    countFor,
  }
}
