'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { BookOpen, Calendar, Clock, ArrowLeft, User, CheckCircle, AlertCircle, Loader, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

export default function MyBooks() {
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth()
  const [borrowedBooks, setBorrowedBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login'
      return
    }
    
    if (isAuthenticated) {
      fetchMyBooks()
    }
  }, [isAuthenticated, authLoading])

  const fetchMyBooks = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/books/my-books`)
      
      if (response.data.success) {
        setBorrowedBooks(response.data.borrowedBooks || [])
      }
    } catch (error) {
      console.error('Error fetching borrowed books:', error)
      showNotification('Failed to fetch borrowed books', 'error')
      // Fallback to user data from context
      setBorrowedBooks(user?.borrowedBooks || [])
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleReturn = async (bookId) => {
    setActionLoading(bookId)
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/books/${bookId}/return`)
      
      if (response.data.success) {
        showNotification('Book returned successfully! ✅')
        // Refresh both borrowed books and user data
        await Promise.all([fetchMyBooks(), refreshUser()])
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to return book'
      showNotification(errorMessage, 'error')
      console.error('Return error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date()
  }

  const getDaysUntilDue = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusColor = (dueDate) => {
    const days = getDaysUntilDue(dueDate)
    if (days < 0) return 'text-red-600 bg-gradient-to-r from-red-50 to-red-100'
    if (days <= 3) return 'text-amber-600 bg-gradient-to-r from-amber-50 to-amber-100'
    return 'text-emerald-600 bg-gradient-to-r from-emerald-50 to-emerald-100'
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-emerald-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-emerald-600" />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
<div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-emerald-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 px-5 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 transform transition-all duration-500 backdrop-blur-sm ${
          notification.type === 'success' 
            ? 'bg-emerald-500/95 text-white border border-emerald-400/50' 
            : 'bg-red-500/95 text-white border border-red-400/50'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center mb-4">
              <Link
                href="/"
                className="flex items-center text-slate-600 hover:text-slate-800 font-medium transition-colors group mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Library
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
              My Books
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Manage your borrowed books and track due dates
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/20 mb-3">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-slate-600 font-medium">
              {borrowedBooks.length} book{borrowedBooks.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={fetchMyBooks}
              className="mt-2 text-emerald-600 hover:text-emerald-700 transition-colors p-1 rounded-full hover:bg-emerald-50"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 mb-8 ring-1 ring-slate-200/50">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-slate-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-1">{user?.name}</h2>
              <p className="text-slate-600 text-lg mb-3">{user?.email}</p>
              <div className="flex items-center gap-4">
                <span className={`inline-block px-4 py-2 rounded-2xl text-sm font-semibold ${
                  user?.role === 'Admin' 
                    ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700' 
                    : 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700'
                }`}>
                  {user?.role}
                </span>
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                  Member since {new Date(user?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Borrowed Books */}
        {borrowedBooks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BookOpen className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No borrowed books</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto text-lg">
              You haven't borrowed any books yet. Browse our collection and start your reading journey!
            </p>
            <Link
              href="/"
              className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {borrowedBooks.map((borrowedBook) => {
              const book = borrowedBook.book
              const daysUntilDue = getDaysUntilDue(borrowedBook.dueDate)
              const overdue = isOverdue(borrowedBook.dueDate)
              const isCurrentlyLoading = actionLoading === book?._id
              
              return (
                <div
                  key={borrowedBook._id || book?._id}
                  className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 overflow-hidden ring-1 ring-slate-200/50 group"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      {/* Book Info */}
                      <div className="flex-1 mb-6 lg:mb-0">
                        <div className="flex items-start space-x-5">
                          <div className="w-20 h-24 bg-gradient-to-br from-emerald-100 via-blue-50 to-teal-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                            <BookOpen className="w-10 h-10 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">
                              {book?.title || 'Book Title'}
                            </h3>
                            <div className="flex items-center text-slate-600 mb-3">
                              <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                                <User size={14} className="text-slate-500" />
                              </div>
                              <span className="font-medium">{book?.author || 'Unknown Author'}</span>
                            </div>
                            {book?.isbn && (
                              <p className="text-sm text-slate-500 mb-2">ISBN: {book.isbn}</p>
                            )}
                            {book?.genre && (
                              <span className="inline-block text-xs bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-3 py-1.5 rounded-full font-semibold">
                                {book.genre}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Due Date Info */}
                      <div className="flex flex-col lg:items-end space-y-4">
                        <div className="flex items-center space-x-3 text-slate-600">
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                            <Calendar size={14} />
                          </div>
                          <span className="text-sm font-medium">
                            Borrowed: {new Date(borrowedBook.borrowDate).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl shadow-sm ${getStatusColor(borrowedBook.dueDate)}`}>
                          <Clock size={16} />
                          <span className="text-sm font-semibold">
                            {overdue 
                              ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`
                              : daysUntilDue === 0 
                                ? 'Due today'
                                : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
                            }
                          </span>
                        </div>
                        
                        <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                          Due: {new Date(borrowedBook.dueDate).toLocaleDateString()}
                        </div>
                        
                        {/* Return Button */}
                        <button
                          onClick={() => handleReturn(book?._id)}
                          disabled={isCurrentlyLoading}
                          className={`px-6 py-3.5 cursor-pointer rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center min-w-[140px] ${
                            overdue 
                              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
                              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                          }`}
                        >
                          {isCurrentlyLoading ? (
                            <>
                              <Loader className="animate-spin w-4 h-4 mr-2" />
                              Returning...
                            </>
                          ) : (
                            'Return Book'
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar for Due Date */}
                    <div className="mt-6">
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            overdue 
                              ? 'bg-gradient-to-r from-red-400 to-red-500' 
                              : daysUntilDue <= 3 
                                ? 'bg-gradient-to-r from-amber-400 to-amber-500' 
                                : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                          }`}
                          style={{ 
                            width: overdue ? '100%' : `${Math.max(8, 100 - (daysUntilDue / 14) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-2">
                        <span>Borrowed</span>
                        <span>Due Date</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}