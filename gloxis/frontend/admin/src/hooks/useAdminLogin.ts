import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { api } from '../api/client'
import { useAuth } from '../store/useAuth'

export interface LoginPayload {
  email: string
  password: string
  token?: string
}

export interface UserResponse {
  id: number
  email: string
  fullName?: string
  role: string
}

export interface LoginResponse {
  requires_2fa?: boolean
  data?: {
    requires_2fa?: boolean
    token?: string
    user?: UserResponse
  }
  token?: string
  user?: UserResponse
}

export function useAdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const [totpToken, setTotpToken] = useState('')
  const [requires2fa, setRequires2fa] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload: LoginPayload = { email, password }
      if (requires2fa) payload.token = totpToken

      const response = await api.post<LoginResponse>('/auth/login', payload)
      const data = response.data

      if (data.requires_2fa || data.data?.requires_2fa) {
        setRequires2fa(true)
        setLoading(false)
        return
      }

      const responseData = data.data || data
      const token = responseData.token
      let user = responseData.user as any

      if (user && user.transformerData && Array.isArray(user.transformerData) && user.transformerData[0]) {
        user = user.transformerData[0]
      }

      if (user && token && ['ADMIN', 'GESTOR', 'DIRETOR'].includes(user.role)) {
        login(token, user)
        navigate('/')
      } else {
        setError('Acesso negado. Apenas perfis administrativos podem aceder a este portal.')
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { errors?: Array<{ message?: string }>; error?: string } } }
      setError(errObj.response?.data?.errors?.[0]?.message || errObj.response?.data?.error || 'Erro ao realizar login')
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    totpToken,
    setTotpToken,
    requires2fa,
    error,
    loading,
    handleSubmit,
  }
}
