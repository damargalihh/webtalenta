'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api/endpoints'
import { useAuthStore } from '@/lib/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { User, Lock, LogIn, GraduationCap } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      localStorage.setItem('access_token', res.data.tokens.access)
      localStorage.setItem('refresh_token', res.data.tokens.refresh)
      setAuth(res.data.user, res.data.tokens.access)
      
      // Check if user is admin and redirect accordingly
      try {
        const adminCheck = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/accounts/admin/check/`, {
          headers: { 'Authorization': `Bearer ${res.data.tokens.access}` }
        })
        
        if (adminCheck.ok) {
          const adminData = await adminCheck.json()
          if (adminData.is_admin) {
            router.push('/admin-panel')
            return
          }
        }
      } catch {
        // Not admin, continue to dashboard
      }
      
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Username atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Selamat Datang Kembali</h1>
          <p className="text-gray-600 dark:text-gray-400">Login ke akun Talenta UMS Anda</p>
        </div>

        <Card className="shadow-2xl border-0 dark:bg-gray-900 dark:border-gray-800 animate-fadeIn">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm text-center font-medium">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username"
              icon={<User className="h-5 w-5" />}
              value={form.username}
              onChange={(e) => setForm({...form, username: e.target.value})}
              placeholder="Masukkan username"
              required
            />
            <Input
              label="Password"
              type="password"
              icon={<Lock className="h-5 w-5" />}
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              placeholder="Masukkan password"
              required
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              loading={loading}
            >
              <LogIn className="h-5 w-5 mr-2" />
              {loading ? 'Memproses...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Belum punya akun?{' '}
              <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors">
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </Card>

        <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-6">
          Platform Talenta Mahasiswa UMS
        </p>
      </div>
    </div>
  )
}
