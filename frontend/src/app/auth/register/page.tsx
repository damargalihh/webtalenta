'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api/endpoints'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { User, Mail, Lock, UserPlus, GraduationCap } from 'lucide-react'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }
    
    setLoading(true)
    try {
      await authAPI.register(form)
      router.push('/auth/login?registered=true')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registrasi gagal. Username atau email mungkin sudah digunakan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bergabung dengan Kami</h1>
          <p className="text-gray-600 dark:text-gray-400">Daftar akun Talenta UMS Anda</p>
        </div>

        <Card className="shadow-2xl border-0 dark:bg-gray-900 dark:border-gray-800 animate-fadeIn">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm text-center font-medium">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              icon={<User className="h-5 w-5" />}
              value={form.username}
              onChange={(e) => setForm({...form, username: e.target.value})}
              placeholder="Pilih username unik"
              required
            />
            <Input
              label="Email"
              type="email"
              icon={<Mail className="h-5 w-5" />}
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              placeholder="email@ums.ac.id"
              required
            />
            <Input
              label="Password"
              type="password"
              icon={<Lock className="h-5 w-5" />}
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              placeholder="Minimal 6 karakter"
              required
            />
            
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              <UserPlus className="h-5 w-5 mr-2" />
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors">
                Login Di Sini
              </Link>
            </p>
          </div>
        </Card>

        <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-6">Platform Talenta Mahasiswa UMS</p>
      </div>
    </div>
  )
}
