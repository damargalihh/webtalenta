'use client'

import { useEffect, useState, use } from 'react'
import Image from 'next/image'
import { mahasiswaAPI, skillsAPI } from '@/lib/api/endpoints'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Mail, Download, QrCode, Eye, Linkedin, Github, Instagram, Award, ThumbsUp, Phone, Globe, MapPin, User, Briefcase, Calendar, Building2 } from 'lucide-react'

export default function TalentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [talent, setTalent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [showQR, setShowQR] = useState(false)
  const [endorsing, setEndorsing] = useState<number | null>(null)
  const [loadingQR, setLoadingQR] = useState(false)
  const [downloadingCV, setDownloadingCV] = useState(false)
  const [viewTracked, setViewTracked] = useState(false) // Flag to prevent duplicate tracking

  useEffect(() => {
    let isMounted = true // Flag to prevent state updates after unmount
    
    const loadData = async () => {
      try {
        console.log('🔍 Loading talent detail for ID:', id)
        
        // Fetch talent data first
        const response = await mahasiswaAPI.getDetail(Number(id))
        if (!isMounted) return
        
        console.log('✅ Talent data loaded:', response.data)
        setTalent(response.data)
        
        // Track view ONLY ONCE per page load
        if (!viewTracked && isMounted) {
          setViewTracked(true) // Set flag immediately to prevent duplicate
          try {
            const trackResponse = await mahasiswaAPI.trackView(Number(id))
            console.log('👁️ View tracked (+1):', trackResponse.data.total_views)
          } catch (trackError: any) {
            // Silent error - view tracking is non-critical
            console.warn('⚠️ View tracking skipped (non-critical)')
          }
        }
        
        // Set QR code URL directly - let browser handle the request
        const qrUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mahasiswa/${id}/qr-code/?download=false`
        if (isMounted) {
          setQrCodeUrl(qrUrl)
          setLoadingQR(false)
        }
      } catch (error: any) {
        if (!isMounted) return
        
        console.error('❌ Failed to load talent:', error)
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          baseURL: error.config?.baseURL,
          url: error.config?.url
        })
        
        if (error.code === 'ERR_NETWORK') {
          alert('⚠️ Cannot connect to server. Please ensure:\n1. Backend is running (http://localhost:8000)\n2. Check browser console for CORS errors')
        } else if (error.response?.status === 404) {
          alert('❌ Talent not found with ID: ' + id)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    if (id) {
      loadData()
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false
    }
  }, [id, viewTracked])

  const handleDownloadCV = async () => {
    if (downloadingCV || !talent?.id) return
    setDownloadingCV(true)
    try {
      console.log('Downloading CV for mahasiswa ID:', talent.id)
      
      // Try using direct fetch as fallback for better error handling
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      const headers: any = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mahasiswa/${talent.id}/download-cv/`,
        { headers }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${talent.nama.replace(/\s+/g, '_')}_CV.pdf`
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    } catch (error: any) {
      console.error('Download CV error:', error)
      const errorMsg = error.message || 'Gagal mengunduh CV'
      alert(`Error: ${errorMsg}\n\nPastikan:\n1. Backend server running (port 8000)\n2. Mahasiswa memiliki data profil lengkap`)
    } finally {
      setDownloadingCV(false)
    }
  }

  const handleDownloadQR = async () => {
    if (!talent?.id) return
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mahasiswa/${talent.id}/qr-code/?download=true`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${talent.nama.replace(/\s+/g, '_')}_QRCode.png`
      document.body.appendChild(a)
      a.click()
      
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error('Download QR error:', error)
      alert('Gagal mengunduh QR Code')
    }
  }

  const handleEndorse = async (skillId: number) => {
    if (endorsing) return // Prevent multiple clicks
    
    // Check if user is logged in
    const token = localStorage.getItem('access_token')
    if (!token) {
      // Show nice login prompt
      if (confirm('🔐 Anda harus login terlebih dahulu untuk memberikan endorsement.\n\nKlik OK untuk menuju halaman login.')) {
        window.location.href = '/auth/login'
      }
      return
    }
    
    setEndorsing(skillId)
    
    // Optimistic update - update UI immediately
    setTalent((prev: any) => {
      if (!prev) return prev
      return {
        ...prev,
        skills: prev.skills.map((skill: any) => 
          skill.id === skillId 
            ? { 
                ...skill, 
                endorsement_count: (skill.endorsement_count || 0) + 1,
                user_has_endorsed: true
              }
            : skill
        )
      }
    })
    
    try {
      const response = await skillsAPI.endorse(skillId)
      
      // Show success feedback
      const skillName = talent.skills.find((s: any) => s.id === skillId)?.nama
      console.log(`✅ Successfully endorsed: ${skillName}`)
      
      // Refresh from server to ensure consistency
      const detailResponse = await mahasiswaAPI.getDetail(Number(id))
      setTalent(detailResponse.data)
    } catch (error: any) {
      // Revert optimistic update on error
      try {
        const response = await mahasiswaAPI.getDetail(Number(id))
        setTalent(response.data)
      } catch (refreshError) {
        console.warn('⚠️ Failed to refresh talent data')
      }
      
      // Show user-friendly error message
      const errorDetail = error.response?.data?.detail || error.response?.data?.error || error.message
      
      if (error.response?.status === 400) {
        if (errorDetail.includes('own skill') || errorDetail.includes('Cannot endorse your own')) {
          // User trying to endorse own skill
          alert('❌ Anda tidak dapat memberikan endorsement untuk skill Anda sendiri.')
        } else if (errorDetail.includes('Already endorsed')) {
          // Already endorsed this skill
          alert('ℹ️ Anda sudah memberikan endorsement untuk skill ini sebelumnya.')
        } else {
          console.warn('⚠️ Endorsement validation error:', errorDetail)
          alert('⚠️ ' + errorDetail)
        }
      } else if (error.response?.status === 401) {
        if (confirm('🔐 Sesi Anda telah berakhir.\n\nKlik OK untuk login kembali.')) {
          window.location.href = '/auth/login'
        }
      } else {
        console.error('❌ Unexpected endorsement error:', error.response?.status, errorDetail)
        alert('❌ Gagal memberikan endorsement. Silakan coba lagi.')
      }
    } finally {
      setEndorsing(null)
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 h-96 rounded-2xl mb-8"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="bg-gray-200 dark:bg-gray-700 h-8 w-3/4 rounded mb-4"></div>
                <div className="bg-gray-200 dark:bg-gray-700 h-6 w-1/2 rounded mb-6"></div>
                <div className="bg-gray-200 dark:bg-gray-700 h-32 rounded"></div>
              </div>
              <div>
                <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!talent) {
    return (
      <main className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto text-center p-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Talent Tidak Ditemukan</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Maaf, profil yang Anda cari tidak tersedia.</p>
          <Button onClick={() => window.history.back()}>Kembali</Button>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Simple Profile Header Card */}
          <Card className="overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Profile Photo - Larger */}
                <div className="flex-shrink-0">
                  <div className="relative w-48 h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl">
                    {talent.foto_profil ? (
                      <Image
                        src={talent.foto_profil.startsWith('http') ? talent.foto_profil : `${process.env.NEXT_PUBLIC_BACKEND_URL}${talent.foto_profil}`}
                        alt={talent.nama}
                        fill
                        sizes="192px"
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl font-bold text-white">
                          {talent.nama?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {talent.nama}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      {talent.prodi}
                    </p>
                  </div>

                  {/* Info Pills */}
                  <div className="flex flex-wrap gap-2">
                    {talent.fakultas && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        {talent.fakultas}
                      </span>
                    )}
                    {talent.nim && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                        <User className="w-4 h-4 text-gray-500" />
                        NIM: {talent.nim}
                      </span>
                    )}
                    {talent.angkatan && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        Angkatan {talent.angkatan}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats - Separated on Right */}
                <div className="flex gap-4 md:gap-6">
                  {/* Skills Count */}
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                      {talent.skills?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Skills</div>
                  </div>
                  
                  {/* Experience Count */}
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                      {talent.pengalaman?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pengalaman</div>
                  </div>
                  
                  {/* Views Count */}
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">
                      {talent.views_count || 0}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Views</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Main Content Grid */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {/* Left Column - Bio & Skills */}
            <div className="md:col-span-2 space-y-6">
              {/* About Section */}
              {talent.bio && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    About
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {talent.bio}
                  </p>
                </Card>
              )}

              {/* Skills Section with Modern Cards */}
              {talent.skills && talent.skills.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Skills & Expertise
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {talent.skills.map((skill: any) => (
                      <div
                        key={skill.id}
                        className="group relative flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all"
                      >
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {skill.nama}
                        </span>
                        <button
                          onClick={() => handleEndorse(skill.id)}
                          disabled={endorsing === skill.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full border border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:scale-105 transition-all disabled:opacity-50 shadow-sm"
                        >
                          <ThumbsUp className={`w-4 h-4 text-blue-600 dark:text-blue-400 ${endorsing === skill.id ? 'animate-pulse' : ''}`} />
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{skill.endorsement_count || 0}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Experience Section */}
              {talent.pengalaman && talent.pengalaman.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Experience
                  </h2>
                  <div className="space-y-6">
                    {talent.pengalaman.map((exp: any, idx: number) => (
                      <div key={idx} className="relative pl-8 pb-6 border-l-2 border-blue-200 dark:border-blue-800 last:pb-0">
                        <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white dark:border-gray-800"></div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{exp.posisi}</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">{exp.organisasi}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {exp.tahun_mulai} - {exp.tahun_selesai || 'Present'}
                        </p>
                        {exp.deskripsi && (
                          <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            {exp.deskripsi}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Sidebar - Contact & Actions */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card className="p-6">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Get in Touch</h3>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.location.href = `mailto:${talent.email}`}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  
                  {talent.telepon && (
                    <Button
                      variant="outline"
                      className="w-full justify-center"
                      onClick={() => window.location.href = `tel:${talent.telepon}`}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  )}
                </div>
              </Card>

              {/* Social Links */}
              {(talent.linkedin || talent.github || talent.instagram || talent.website) && (
                <Card className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Social Links</h3>
                  <div className="space-y-2">
                    {talent.linkedin && (
                      <a
                        href={talent.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Linkedin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">LinkedIn</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">View profile</div>
                        </div>
                      </a>
                    )}
                    
                    {talent.github && (
                      <a
                        href={talent.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Github className="w-5 h-5 text-gray-900 dark:text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">GitHub</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">View repositories</div>
                        </div>
                      </a>
                    )}
                    
                    {talent.instagram && (
                      <a
                        href={talent.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Instagram className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">Instagram</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Follow me</div>
                        </div>
                      </a>
                    )}
                    
                    {talent.website && (
                      <a
                        href={talent.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">Website</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Visit site</div>
                        </div>
                      </a>
                    )}
                  </div>
                </Card>
              )}

              {/* Downloads Card */}
              <Card className="p-6">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Downloads</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={handleDownloadCV}
                    disabled={downloadingCV}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {downloadingCV ? 'Downloading...' : 'Download CV'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => setShowQR(!showQR)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    {showQR ? 'Hide QR' : 'Show QR Code'}
                  </Button>
                </div>
              </Card>

              {/* QR Code Display */}
              {showQR && qrCodeUrl && (
                <Card className="p-4 bg-gray-50 dark:bg-gray-700/50">
                  <div className="bg-white p-4 rounded-lg">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-full h-auto mx-auto"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error('QR image failed to load')
                        e.currentTarget.style.display = 'none'
                        const parent = e.currentTarget.parentElement
                        if (parent) {
                          parent.innerHTML = '<p class="text-center text-red-500 py-6">Gagal memuat QR Code</p>'
                        }
                      }}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-3"
                    onClick={handleDownloadQR}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR
                  </Button>
                </Card>
              )}
            </div>
          </div>

          {/* Recommendations Section */}
          <RecommendationsSection talentId={Number(id)} currentTalentName={talent.nama} />
        </div>
      </div>
    </main>
  )
}

// Recommendations Component
function RecommendationsSection({ talentId, currentTalentName }: { talentId: number, currentTalentName: string }) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mahasiswa/${talentId}/recommendations/`
        )
        const data = await response.json()
        setRecommendations(data.results || [])
      } catch (error) {
        console.error('Failed to load recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [talentId])

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Talent Serupa</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Award className="w-6 h-6 text-blue-600" />
        Talent Serupa dengan {currentTalentName}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="group cursor-pointer" hover={true}>
            <a href={`/talents/${rec.id}`} className="block">
              <div className="relative h-48 rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-blue-600 to-blue-700">
                {rec.foto_profil ? (
                  <Image
                    src={rec.foto_profil.startsWith('http') ? rec.foto_profil : `${process.env.NEXT_PUBLIC_BACKEND_URL}${rec.foto_profil}`}
                    alt={rec.nama}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl font-bold text-white">
                      {rec.nama?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {rec.nama}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {rec.prodi}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{rec.skills?.length || 0} skills</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{rec.views_count || 0} views</span>
                </div>
              </div>
              
              {rec.skills && rec.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {rec.skills.slice(0, 3).map((skill: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                    >
                      {skill.nama}
                    </span>
                  ))}
                  {rec.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                      +{rec.skills.length - 3}
                    </span>
                  )}
                </div>
              )}
            </a>
          </Card>
        ))}
      </div>
    </div>
  )
}
