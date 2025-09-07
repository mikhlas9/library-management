'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { BookOpen, Menu, X, LogOut } from 'lucide-react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout, isAuthenticated, isAdmin } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-stone-900">LibraryMS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-stone-600 hover:text-stone-900 font-medium transition-colors"
            >
              Books
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/my-books"
                  className="text-stone-600 hover:text-stone-900 font-medium transition-colors"
                >
                  My Books
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-stone-600 hover:text-stone-900 font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-semibold text-sm">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
                <span className="text-stone-700 font-medium">Hi, {user?.name}</span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-stone-600 hover:text-stone-900 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200">
            <div className="space-y-2">
              {isAuthenticated ? (
                <>
                  {/* Profile */}
                  <div className="flex items-center px-3 py-2 border-b border-stone-200">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-emerald-600 font-semibold text-sm">
                        {user?.name?.charAt(0)}
                      </span>
                    </div>
                    <span className="text-stone-700">Hi, {user?.name}</span>
                  </div>

                  {/* Books */}
                  <Link
                    href="/"
                    className="block px-3 py-2 text-stone-600 hover:text-stone-900"
                  >
                    Books
                  </Link>

                  {/* My Books */}
                  <Link
                    href="/my-books"
                    className="block px-3 py-2 text-stone-600 hover:text-stone-900"
                  >
                    My Books
                  </Link>

                  {/* Admin (if applicable) */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 text-stone-600 hover:text-stone-900"
                    >
                      Admin
                    </Link>
                  )}

                  {/* Logout */}
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center w-full text-left px-3 py-2 text-red-600 hover:text-red-700"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-stone-600 hover:text-stone-900"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
