'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Search, BookOpen, User, Calendar, CheckCircle, XCircle, Clock, Star, Filter, Loader } from 'lucide-react'
import axios from 'axios'

export default function Home() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [notification, setNotification] = useState(null)
  const { isAuthenticated, user, refreshUser } = useAuth()

  const genres = ['All', 'Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Fantasy', 'Romance', 'Mystery', 'Thriller', 'Science Fiction']

  useEffect(() => {
    fetchBooks()
  }, [searchTerm, selectedGenre])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedGenre && selectedGenre !== 'All') params.append('genre', selectedGenre)

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/books?${params}`)
      
      if (response.data.success) {
        setBooks(response.data.books || [])
      } else {
        setBooks([])
        showNotification('Failed to fetch books', 'error')
      }
    } catch (error) {
      console.error('Error fetching books:', error)
      setBooks([])
      if (error.response?.status === 0 || error.code === 'ERR_NETWORK') {
        showNotification('Cannot connect to server. Please make sure the backend is running.', 'error')
      } else {
        showNotification('Failed to fetch books', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const dismissNotification = () => {
    setNotification(null)
  }

  const handleBorrow = async (bookId) => {
    if (!isAuthenticated) {
      showNotification('Please login to borrow books', 'error')
      return
    }

    setActionLoading(bookId)
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/books/${bookId}/borrow`)
      
      if (response.data.success) {
        showNotification('Book borrowed successfully! 📚')
        await Promise.all([fetchBooks(), refreshUser()])
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to borrow book'
      showNotification(errorMessage, 'error')
      console.error('Borrow error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReturn = async (bookId) => {
    setActionLoading(bookId)
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/books/${bookId}/return`)
      
      if (response.data.success) {
        showNotification('Book returned successfully! ✅')
        await Promise.all([fetchBooks(), refreshUser()])
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to return book'
      showNotification(errorMessage, 'error')
      console.error('Return error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const isBookBorrowed = (bookId) => {
    if (!user?.borrowedBooks) return false
    return user.borrowedBooks.some(borrowed => 
      (borrowed.book._id && borrowed.book._id === bookId) || 
      (borrowed.book && borrowed.book === bookId)
    )
  }

  return (
<div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-emerald-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 px-5 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 transform transition-all duration-500 backdrop-blur-sm ${
          notification.type === 'success' 
            ? 'bg-emerald-500/95 text-white border border-emerald-400/50' 
            : 'bg-red-500/95 text-white border border-red-400/50'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span className="font-medium">{notification.message}</span>
          <button 
            onClick={dismissNotification}
            className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Beautiful Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/20">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            Library Collection
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover amazing books from our curated collection
          </p>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 mb-8 ring-1 ring-slate-200/50">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search books by title or author..."
                className="w-full pl-12 pr-4 py-4 bg-white/50 border-2 border-slate-200/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-slate-400 text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filter</span>
              </div>
              <select
                className="px-4 py-4 bg-white/50 border-2 border-slate-200/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 min-w-[160px] transition-all font-medium"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <BookOpen size={16} className="text-emerald-600" />
              </div>
              <span className="font-medium">
                {loading ? 'Loading books...' : `${books.length} book${books.length !== 1 ? 's' : ''} available`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Live updates</span>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-emerald-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No books found</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto text-lg">
              {searchTerm || selectedGenre !== 'All' 
                ? "We couldn't find any books matching your search criteria."
                : "No books are available in the library at the moment."
              }
            </p>
            {(searchTerm || selectedGenre !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedGenre('All')
                }}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => {
              const isAvailable = book.availableCopies > 0
              const isBorrowed = isBookBorrowed(book._id)
              const isLoading = actionLoading === book._id
              
              return (
                <div
                  key={book._id}
                  className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-white/50 group ring-1 ring-slate-200/50"
                >
                  {/* Book Cover */}
                  <div className="h-40 bg-gradient-to-br from-emerald-100 via-blue-50 to-teal-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 group-hover:from-emerald-400/20 group-hover:to-teal-400/20 transition-all duration-300"></div>
                    <BookOpen className="w-14 h-14 text-emerald-600 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                    {!isAvailable && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                        Unavailable
                      </div>
                    )}
                    {isBorrowed && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                        Borrowed
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    {/* Book Info */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {book.title}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                            <User size={12} className="text-slate-500" />
                          </div>
                          <span className="font-medium">{book.author}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                            <Calendar size={12} className="text-slate-500" />
                          </div>
                          <span>{book.publishedYear}</span>
                        </div>
                      </div>
                      
                      <span className="inline-block mt-3 text-xs bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-3 py-1.5 rounded-full font-semibold">
                        {book.genre}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-slate-700 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {book.description}
                    </p>

                    {/* Availability */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl">
                      <div className="flex items-center gap-2">
                        {isAvailable ? (
                          <CheckCircle size={16} className="text-emerald-600" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )}
                        <span className={`text-sm font-semibold ${
                          isAvailable ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {isAvailable ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-600 bg-white px-2 py-1 rounded-full font-medium">
                        <BookOpen size={12} />
                        <span>{book.availableCopies}/{book.totalCopies}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {isAuthenticated ? (
                      isBorrowed ? (
                        <button
                          onClick={() => handleReturn(book._id)}
                          disabled={isLoading}
                          className="w-full cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-3.5 px-4 rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                        >
                          {isLoading ? (
                            <>
                              <Loader className="animate-spin w-4 h-4 mr-2" />
                              Returning...
                            </>
                          ) : (
                            'Return Book'
                          )}
                        </button>
                      ) : isAvailable ? (
                        <button
                          onClick={() => handleBorrow(book._id)}
                          disabled={isLoading}
                          className="w-full cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3.5 px-4 rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                        >
                          {isLoading ? (
                            <>
                              <Loader className="animate-spin w-4 h-4 mr-2" />
                              Borrowing...
                            </>
                          ) : (
                            'Borrow Book'
                          )}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full bg-gradient-to-r from-slate-300 to-slate-400 text-slate-500 font-semibold py-3.5 px-4 rounded-2xl cursor-not-allowed"
                        >
                          Not Available
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => showNotification('Please login to borrow books', 'error')}
                        className="w-full cursor-pointer bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold py-3.5 px-4 rounded-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Login to Borrow
                      </button>
                    )}
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