import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { api } from '../api/client'
import { useAuth } from '../store/useAuth'

export interface LoginPayload {
  email: string
  password?: string
  token?: string
}

export interface SignupPayload {
  fullName: string
  nif?: string
  email: string
  password?: string
  telefone?: string
}

export interface UserAuthData {
  id: number
  fullName: string
  email: string
  role: string
  nif?: string
  [key: string]: unknown
}

export interface LoginResponseBody {
  requires_2fa?: boolean
  requires_password_change?: boolean
  token?: string
  user?: UserAuthData
  message?: string
  error?: string
}

export function useLoginFlow() {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN')

  // Login inputs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [totpToken, setTotpToken] = useState('')
  const [requires2fa, setRequires2fa] = useState(false)

  // Signup inputs
  const [fullName, setFullName] = useState('')
  const [nif, setNif] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [telefone, setTelefone] = useState('')
  const [signupError, setSignupError] = useState('')
  const [signupLoading, setSignupLoading] = useState(false)

  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload: LoginPayload = { email, password }
      if (requires2fa) {
        payload.token = totpToken
      }

      const response = await api.post<LoginResponseBody | { data: LoginResponseBody }>('/auth/login', payload)
      const resData = response.data
      const body: LoginResponseBody = ('data' in resData && resData.data ? resData.data : resData) as LoginResponseBody

      if (body.requires_2fa) {
        setRequires2fa(true)
        return
      }

      if (body.requires_password_change && body.token) {
        localStorage.setItem('gloxis_temp_token', body.token)
        navigate('/change-password')
        return
      }

      const { token, user } = body
      if (!token || !user) {
        setError('Resposta inválida do servidor.')
        return
      }

      login(token, user)
      navigate('/')
    } catch (err: unknown) {
      const errObj = err as {
        response?: {
          data?: {
            data?: { message?: string }
            message?: string
            errors?: Array<{ message?: string }>
            error?: string
          }
        }
      }
      const msg = errObj.response?.data?.data?.message
        || errObj.response?.data?.message
        || errObj.response?.data?.errors?.[0]?.message
        || errObj.response?.data?.error
        || 'Credenciais inválidas. Verifique o NIF / E-mail e a palavra-passe.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupLoading(true)
    setSignupError('')
    try {
      const payload: SignupPayload = {
        fullName,
        nif,
        email: signupEmail,
        password: signupPassword,
        telefone,
      }

      const response = await api.post<LoginResponseBody | { data: LoginResponseBody }>('/auth/signup', payload)
      const resData = response.data
      const body: LoginResponseBody = ('data' in resData && resData.data ? resData.data : resData) as LoginResponseBody

      const { token, user } = body
      if (!token || !user) {
        setSignupError('Resposta inválida ao criar conta.')
        return
      }

      login(token, user)
      navigate('/')
    } catch (err: unknown) {
      const errObj = err as {
        response?: {
          data?: {
            message?: string
            errors?: Array<{ message?: string }>
            error?: string
          }
        }
      }
      const msg = errObj.response?.data?.error
        || errObj.response?.data?.message
        || errObj.response?.data?.errors?.[0]?.message
        || 'Erro ao criar conta. Verifique se o E-mail ou NIF já estão registados.'
      setSignupError(msg)
    } finally {
      setSignupLoading(false)
    }
  }

  return {
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    showPw,
    setShowPw,
    error,
    loading,
    totpToken,
    setTotpToken,
    requires2fa,
    setRequires2fa,
    handleSubmit,
    // Signup
    fullName,
    setFullName,
    nif,
    setNif,
    signupEmail,
    setSignupEmail,
    signupPassword,
    setSignupPassword,
    telefone,
    setTelefone,
    signupError,
    signupLoading,
    handleSignupSubmit,
  }
}
