import { create } from 'zustand'

interface User {
  id: number
  fullName: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuth = create<AuthState>((set) => {
  const storedToken = localStorage.getItem('token')
  const storedUser = localStorage.getItem('user')

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
    isAuthenticated: !!storedToken,

    login: (token, user) => {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ token, user, isAuthenticated: true })
    },
    
    logout: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({ token: null, user: null, isAuthenticated: false })
    }
  }
})
