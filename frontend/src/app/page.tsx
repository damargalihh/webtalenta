'use client'

import { useEffect, useState } from 'react'
import { mahasiswaAPI } from '@/lib/api/endpoints'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { ArrowRight, Sparkles, Users, Award, TrendingUp, Eye } from 'lucide-react'
import Image from 'next/image'

export default function Home() {
  const [talents, setTalents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [mostViewed, setMostViewed] = useState<any[]>([])
  
  useEffect(() => {
    // Load latest talents
    mahasiswaAPI.getLatest()
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : (r.data.results || [])
        setTalents(data)
      })
      .catch(err => {
        console.error('Error fetching talents:', err)
        setTalents([])
      })
      .finally(() => setLoading(false))

    // Load most viewed talents
    mahasiswaAPI.getMostViewed()
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : (r.data.results || [])
        setMostViewed(data)
      })
      .catch(err => console.error('Error fetching most viewed:', err))
  }, [])

  const stats = [
    { icon: Users, label: 'Active Students', value: '1,000+' },
    { icon: Award, label: 'Skills Listed', value: '500+' },
    { icon: TrendingUp, label: 'Success Stories', value: '200+' },
  ]

  return (
    <main className="min-h-screen">
      {/* Hero Section - Transparent to show wallpaper */}
      <section className="relative text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-indigo-900/25 to-purple-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent" />
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 shadow-lg">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">Showcase Your Talent</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight drop-shadow-lg">
              Temukan & Tampilkan
              <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-2xl">
                Talenta Mahasiswa UMS
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white drop-shadow-md max-w-2xl mx-auto">
              Platform untuk menampilkan skill, portofolio, dan prestasi mahasiswa Universitas Muhammadiyah Surakarta
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/talents">
                <Button size="lg" className="group text-lg px-8 shadow-2xl hover:shadow-blue-500/50 transition-all">
                  Jelajahi Talenta
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/30 hover:bg-white/20">
                  Daftar Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container mx-auto px-4 pb-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <stat.icon className="h-8 w-8 text-yellow-300 mb-3" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-blue-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Talents - Solid background */}
      <section className="bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-900 to-blue-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Talenta Terbaru
            </h2>
            <p className="text-gray-600 dark:text-gray-300">Mahasiswa berbakat dari UMS</p>
          </div>
          <Link href="/talents">
            <Button variant="outline" className="group">
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : talents.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Talenta</h3>
            <p className="text-gray-500">Jadilah yang pertama untuk bergabung!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talents.slice(0, 6).map((t: any) => (
              <Link key={t.id} href={`/talents/${t.id}`}>
                <Card hover className="cursor-pointer h-full overflow-hidden group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="relative h-48 bg-white dark:bg-gray-900 overflow-hidden">
                    {t.foto_profil ? (
                      <Image
                        src={t.foto_profil.startsWith('http') ? t.foto_profil : `${process.env.NEXT_PUBLIC_BACKEND_URL}${t.foto_profil}`}
                        alt={t.nama}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        style={{ objectPosition: 'center 20%' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Users className="h-16 w-16 text-blue-300 dark:text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-xl mb-1 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {t.nama}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-3">{t.prodi}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                      {t.bio || 'Mahasiswa berbakat dari UMS'}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
        </div>
      </section>

      {/* Most Viewed Talents - Solid background */}
      {mostViewed.length > 0 && (
        <section className="bg-gray-50 dark:bg-gray-950">
          <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-900 to-indigo-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Paling Banyak Dilihat
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Talenta yang paling diminati</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mostViewed.slice(0, 4).map((t: any) => (
              <Link key={t.id} href={`/talents/${t.id}`}>
                <Card hover className="cursor-pointer h-full overflow-hidden group relative bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="absolute top-3 right-3 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {t.views_count || 0}
                  </div>
                  <div className="relative h-48 bg-white dark:bg-gray-900 overflow-hidden">
                    {t.foto_profil ? (
                      <Image
                        src={t.foto_profil.startsWith('http') ? t.foto_profil : `${process.env.NEXT_PUBLIC_BACKEND_URL}${t.foto_profil}`}
                        alt={t.nama}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        style={{ objectPosition: 'center 20%' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Users className="h-16 w-16 text-indigo-300 dark:text-indigo-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-xl mb-1 text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {t.nama}
                    </h3>
                    <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-3">{t.prodi}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
                      {t.bio || 'Mahasiswa berbakat dari UMS'}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          </div>
        </section>
      )}
    </main>
  )
}