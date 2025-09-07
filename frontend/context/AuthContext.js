'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  // Set up axios interceptor
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/me`)
      if (response.data.success) {
        setUser(response.data.data.user)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        email,
        password
      })
      
      if (response.data.success) {
        const { token: newToken, data } = response.data
        
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser(data.user)
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        
        return { success: true }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (name, email, password, role = 'Member') => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        name,
        email,
        password,
        role
      })
      
      if (response.data.success) {
        const { token: newToken, data } = response.data
        
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser(data.user)
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        
        return { success: true }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    refreshUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
