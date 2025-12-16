'use client'

import { useEffect, useState } from 'react'
import { mahasiswaAPI } from '@/lib/api/endpoints'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { Search, Filter, Users, Sparkles, ChevronDown, X } from 'lucide-react'
import Image from 'next/image'

export default function Talents() {
  const [talents, setTalents] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filterProdi, setFilterProdi] = useState('')
  const [filterAngkatan, setFilterAngkatan] = useState('')
  const [sortBy, setSortBy] = useState('-created_at')
  
  const prodiList = [
    'Teknik Informatika',
    'Sistem Informasi',
    'Teknik Elektro',
    'Teknik Industri',
    'Teknik Sipil',
    'Arsitektur',
    'Manajemen',
    'Akuntansi',
    'Ilmu Komunikasi',
    'Hukum',
    'Psikologi'
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      const params: any = {}
      if (search) params.search = search
      if (filterProdi) params.prodi = filterProdi
      if (filterAngkatan) params.angkatan = filterAngkatan
      if (sortBy) params.order_by = sortBy
      
      mahasiswaAPI.getList(params)
        .then(r => setTalents(r.data.results || r.data))
        .catch(err => console.error('Error fetching talents:', err))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [search, filterProdi, filterAngkatan, sortBy])

  const clearFilters = () => {
    setFilterProdi('')
    setFilterAngkatan('')
    setSortBy('-created_at')
  }

  const activeFiltersCount = [filterProdi, filterAngkatan].filter(Boolean).length

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4 animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-2">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium">Temukan Talenta Terbaik</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold">
              Jelajahi Talenta
            </h1>
            <p className="text-xl text-blue-100 dark:text-blue-200">
              Ribuan mahasiswa berbakat siap berkolaborasi
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
            {/* Search Input */}
            <Input
              icon={<Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />}
              placeholder="Cari nama, NIM, prodi, atau skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />

            {/* Filter Toggle Button */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-300 dark:border-gray-600"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter & Urutan
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Reset Filter
                </button>
              )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
                {/* Program Studi Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Program Studi
                  </label>
                  <select
                    value={filterProdi}
                    onChange={(e) => setFilterProdi(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Semua Prodi</option>
                    {prodiList.map((prodi) => (
                      <option key={prodi} value={prodi}>{prodi}</option>
                    ))}
                  </select>
                </div>

                {/* Angkatan Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Angkatan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 2023"
                    value={filterAngkatan}
                    onChange={(e) => setFilterAngkatan(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Urutkan
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="-created_at">Terbaru</option>
                    <option value="created_at">Terlama</option>
                    <option value="nama">Nama A-Z</option>
                    <option value="-nama">Nama Z-A</option>
                    <option value="-views_count">Paling Banyak Dilihat</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : talents.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
              <Users className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {search ? 'Tidak Ada Hasil' : 'Belum Ada Talenta'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {search 
                ? `Tidak ditemukan talenta dengan kata kunci "${search}"`
                : 'Jadilah yang pertama untuk bergabung!'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Ditemukan <span className="font-semibold text-blue-600 dark:text-blue-400">{talents.length}</span> talenta
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {talents.map((t: any) => (
                <Link key={t.id} href={`/talents/${t.id}`} className="block">
                  <Card hover className="cursor-pointer h-full overflow-hidden group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="relative h-56 bg-white dark:bg-gray-900 overflow-hidden">
                      {t.foto_profil ? (
                        <Image
                          src={t.foto_profil.startsWith('http') ? t.foto_profil : `${process.env.NEXT_PUBLIC_BACKEND_URL}${t.foto_profil}`}
                          alt={t.nama}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          style={{ objectPosition: 'center 20%' }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Users className="h-20 w-20 text-blue-300 dark:text-blue-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {t.nama}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-2 line-clamp-1">
                        {t.prodi}
                      </p>
                      {t.bio && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                          {t.bio}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}