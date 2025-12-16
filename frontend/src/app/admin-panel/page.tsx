'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Image from 'next/image'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Award, 
  Search, 
  LogOut,
  Eye,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react'

interface Mahasiswa {
  id: number
  nama: string
  nim: string
  prodi: string
  email: string
  telepon?: string
  foto_profil?: string
  is_active: boolean
  skills: any[]
  pengalaman: any[]
  views_count: number
  created_at: string
}

interface Statistics {
  total_mahasiswa: number
  active_mahasiswa: number
  inactive_mahasiswa: number
  total_users: number
  total_skills: number
}

export default function AdminPanel() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState('-created_at')

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadData()
    }
  }, [isAdmin, searchQuery, statusFilter, sortBy])

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/accounts/admin/check/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.status === 403 || res.status === 401) {
        alert('Akses ditolak! Hanya admin yang dapat mengakses halaman ini.')
        router.push('/dashboard')
        return
      }

      const data = await res.json()
      if (data.is_admin) {
        setIsAdmin(true)
      } else {
        alert('Anda bukan admin!')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    try {
      // Load statistics
      const statsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/accounts/admin/statistics/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const statsData = await statsRes.json()
      setStatistics(statsData)

      // Load mahasiswa list
      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/accounts/admin/mahasiswa/?order_by=${sortBy}`
      if (searchQuery) url += `&search=${searchQuery}`
      if (statusFilter !== 'all') url += `&status=${statusFilter}`

      const mahasiswaRes = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const mahasiswaData = await mahasiswaRes.json()
      setMahasiswa(mahasiswaData.results || [])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    if (!confirm(`Yakin ingin ${currentStatus ? 'menonaktifkan' : 'mengaktifkan'} profil ini?`)) {
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/accounts/admin/mahasiswa/${id}/toggle/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        const data = await res.json()
        alert(data.message)
        loadData()
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      alert('Gagal mengubah status profil')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memverifikasi akses admin...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kelola data mahasiswa</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Mahasiswa</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total_mahasiswa}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Aktif</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.active_mahasiswa}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nonaktif</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.inactive_mahasiswa}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Skills</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total_skills}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total_users}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Cari nama, NIM, atau prodi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="-created_at">Terbaru</option>
              <option value="created_at">Terlama</option>
              <option value="nama">Nama A-Z</option>
              <option value="-nama">Nama Z-A</option>
              <option value="nim">NIM Ascending</option>
              <option value="-nim">NIM Descending</option>
            </select>
          </div>
        </Card>

        {/* Data Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Mahasiswa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Kontak
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {mahasiswa.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                          {m.foto_profil ? (
                            <Image
                              src={m.foto_profil.startsWith('http') ? m.foto_profil : `${process.env.NEXT_PUBLIC_BACKEND_URL}${m.foto_profil}`}
                              alt={m.nama}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold">
                              {m.nama?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{m.nama}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{m.nim}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{m.prodi}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{m.email}</span>
                        </div>
                        {m.telepon && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Phone className="w-3 h-3" />
                            <span>{m.telepon}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>{m.skills?.length || 0} skills</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Briefcase className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span>{m.pengalaman?.length || 0} exp</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>{m.views_count} views</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {m.is_active ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          <XCircle className="w-3 h-3" />
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={m.is_active ? 'outline' : 'primary'}
                          onClick={() => toggleStatus(m.id, m.is_active)}
                        >
                          {m.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/talents/${m.id}`, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mahasiswa.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Tidak ada data mahasiswa</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
