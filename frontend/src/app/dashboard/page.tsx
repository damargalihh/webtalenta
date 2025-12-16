'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ImageCropper } from '@/components/ui/ImageCropper'
import Link from 'next/link'
import { mahasiswaAPI } from '@/lib/api/endpoints'
import { User, Mail, MapPin, Phone, Award, Briefcase, Download, Eye, QrCode, Save, Camera, Plus, Trash2, Calendar, Building2, Globe } from 'lucide-react'
import Image from 'next/image'

export default function Dashboard() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({
    nama: '',
    nim: '',
    prodi: '',
    angkatan: '',
    fakultas: '',
    bio: '',
    email: '',
    telepon: '',
    alamat: '',
    tanggal_lahir: '',
    linkedin: '',
    github: '',
    instagram: '',
    website: ''
  })
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [pengalaman, setPengalaman] = useState<any[]>([])
  const [initialForm, setInitialForm] = useState<typeof form | null>(null) // Track original values
  const [newExp, setNewExp] = useState({
    posisi: '',
    organisasi: '',
    tahun_mulai: '',
    tahun_selesai: '',
    deskripsi: ''
  })
  const [showCropper, setShowCropper] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string>('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    } else {
      loadProfile()
    }
  }, [isAuthenticated, router])

  // Cleanup memory saat component unmount
  useEffect(() => {
    return () => {
      // Revoke all object URLs to free memory
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview)
      }
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop)
      }
    }
  }, [photoPreview, imageToCrop])

  const loadProfile = async () => {
    try {
      // Get current user's profile directly
      const res = await mahasiswaAPI.getMyProfile()
      const profileData = res.data
      
      // Check if user has profile
      if (profileData.has_profile === false) {
        console.log('No existing profile found - will create new')
        // Set default email from user data if available
        if (profileData.user?.email) {
          setForm(prev => ({ ...prev, email: profileData.user.email }))
        }
        return
      }
      
      console.log('Found existing profile:', profileData)
      setProfile(profileData)
      const loadedForm = {
        nama: profileData.nama || '',
        nim: profileData.nim || '',
        prodi: profileData.prodi || '',
        angkatan: profileData.angkatan || '',
        fakultas: profileData.fakultas || '',
        bio: profileData.bio || '',
        email: profileData.email || '',
        telepon: profileData.telepon || '',
        alamat: profileData.alamat || '',
        tanggal_lahir: profileData.tanggal_lahir || '',
        linkedin: profileData.linkedin || '',
        github: profileData.github || '',
        instagram: profileData.instagram || '',
        website: profileData.website || ''
      }
      setForm(loadedForm)
      setInitialForm(loadedForm) // Save initial values
      
      // Check if foto_profil is already a full URL or just path
      const photoUrl = profileData.foto_profil 
        ? (profileData.foto_profil.startsWith('http') 
            ? profileData.foto_profil 
            : `${process.env.NEXT_PUBLIC_BACKEND_URL}${profileData.foto_profil}`)
        : ''
      setPhotoPreview(photoUrl)
      
      // Load skills if available
      if (profileData.skills) {
        setSkills(profileData.skills.map((s: any) => s.nama))
      }
      
      // Load pengalaman if available
      if (profileData.pengalaman) {
        setPengalaman(profileData.pengalaman)
      }
    } catch (err: any) {
      console.log('No existing profile found - will create new')
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setImageToCrop(imageUrl)
      setShowCropper(true)
    }
    // Reset input
    e.target.value = ''
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    // Convert blob to file
    const croppedFile = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' })
    
    // Create temporary preview URL
    const tempPreviewUrl = URL.createObjectURL(croppedBlob)
    setPhotoFile(croppedFile)
    setPhotoPreview(tempPreviewUrl)
    setShowCropper(false)
    
    // Cleanup imageToCrop URL untuk free memory
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop)
    }
    setImageToCrop('')
    
    // Jika profil sudah ada, auto-upload foto profil langsung ke server
    if (profile) {
      try {
        setLoading(true)
        const formData = new FormData()
        formData.append('foto_profil', croppedFile)
        
        console.log('Uploading profile photo...')
        await mahasiswaAPI.create(formData)
        
        // Cleanup temporary preview URL setelah upload sukses
        URL.revokeObjectURL(tempPreviewUrl)
        
        // Reload profile to get updated photo URL from server
        await loadProfile()
        
        // Clear local file state karena sudah di server
        setPhotoFile(null)
        
        alert('✅ Foto profil berhasil diupload!')
      } catch (err: any) {
        console.error('Photo upload error:', err)
        alert('❌ Gagal mengupload foto profil. Silakan coba lagi.')
        
        // Cleanup on error juga
        URL.revokeObjectURL(tempPreviewUrl)
      } finally {
        setLoading(false)
      }
    } else {
      // Jika belum ada profil, simpan foto untuk diupload nanti saat save profile
      console.log('Profile not created yet, photo will be uploaded with profile data')
    }
  }

  const handleCropCancel = () => {
    // Cleanup imageToCrop URL saat cancel
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop)
    }
    setShowCropper(false)
    setImageToCrop('')
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // Validate required fields for new profile
      if (!profile?.id) {
        const requiredFields = ['nama', 'nim', 'prodi', 'email']
        const missingFields = requiredFields.filter(field => !form[field as keyof typeof form]?.trim())
        
        if (missingFields.length > 0) {
          alert('⚠️ Field wajib belum terisi:\n\n' + missingFields.map(f => {
            const labels: any = { nama: 'Nama', nim: 'NIM', prodi: 'Program Studi', email: 'Email' }
            return `• ${labels[f]}`
          }).join('\n'))
          setLoading(false)
          return
        }
      }

      const formData = new FormData()
      
      // For UPDATE: Only send fields that changed
      if (profile?.id && initialForm) {
        let hasChanges = false
        
        Object.keys(form).forEach(key => {
          const currentValue = (form as any)[key]
          const initialValue = (initialForm as any)[key]
          
          // Only append if value changed AND not empty
          if (currentValue !== initialValue && currentValue && currentValue.toString().trim()) {
            formData.append(key, currentValue)
            hasChanges = true
            console.log(`  Changed: ${key} from "${initialValue}" to "${currentValue}"`)
          }
        })
        
        if (!hasChanges && !photoFile && skills.length === 0 && pengalaman.length === 0) {
          alert('ℹ️ Tidak ada perubahan untuk disimpan')
          setLoading(false)
          return
        }
      } else {
        // For CREATE: Send all fields (with validation for required fields)
        Object.keys(form).forEach(key => {
          const value = (form as any)[key]
          if (value && value.toString().trim()) {
            formData.append(key, value)
          }
        })
      }
      
      // Debug: Log what we're sending
      console.log('Form data to send:')
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value)
      }
      
      // Append photo if exists
      if (photoFile) {
        formData.append('foto_profil', photoFile)
        console.log('  foto_profil:', photoFile.name)
      }
      
      // Append skills as JSON array if any
      if (skills.length > 0) {
        formData.append('skills', JSON.stringify(skills))
        console.log('  skills:', JSON.stringify(skills))
      }
      
      // Append pengalaman as JSON array if any
      if (pengalaman.length > 0) {
        formData.append('pengalaman', JSON.stringify(pengalaman))
        console.log('  pengalaman:', JSON.stringify(pengalaman))
      }

      console.log('Profile ID:', profile?.id)
      console.log('Request type:', profile?.id ? 'UPDATE' : 'CREATE')

      // Always POST - backend handles create or update automatically
      const hadProfile = !!profile?.id
      
      // Debug: Check if FormData has any data (including skills/pengalaman)
      let hasData = false
      for (let pair of formData.entries()) {
        hasData = true
        break
      }
      
      // Check if there's any data to save
      if (!hasData && !photoFile && skills.length === 0 && pengalaman.length === 0) {
        alert('⚠️ Tidak ada data untuk disimpan. Silakan isi minimal satu field atau tambah skills/pengalaman.')
        setLoading(false)
        return
      }
      
      const response = await mahasiswaAPI.create(formData)
      
      if (hadProfile) {
        alert('✅ Profil berhasil diperbarui!')
      } else {
        alert('🎉 Profil berhasil dipublikasikan!\n\nKlik "Preview Profil" untuk melihat.')
      }
      
      await loadProfile() // Reload to get updated data including ID
    } catch (err: any) {
      console.error('Save error:', err)
      console.error('Error response:', err.response)
      console.error('Error data:', err.response?.data)
      console.error('Error status:', err.response?.status)
      
      // Parse backend error messages
      let errorMsg = 'Terjadi kesalahan saat menyimpan profil'
      
      if (err.response?.status === 400) {
        errorMsg = '⚠️ Validasi gagal:\n\n'
        
        if (err.response?.data) {
          const errData = err.response.data
          
          if (typeof errData === 'string') {
            errorMsg += errData
          } else if (errData.error) {
            errorMsg += errData.error
          } else if (errData.message) {
            errorMsg += errData.message
          } else if (typeof errData === 'object') {
            // Field-specific errors
            const errors = Object.entries(errData)
              .map(([field, msgs]: [string, any]) => {
                const fieldLabels: any = {
                  nama: 'Nama', nim: 'NIM', prodi: 'Program Studi',
                  email: 'Email', bio: 'Bio', telepon: 'No Telepon', angkatan: 'Angkatan',
                  fakultas: 'Fakultas', alamat: 'Alamat', tanggal_lahir: 'Tanggal Lahir',
                  website: 'Website', linkedin: 'LinkedIn', github: 'GitHub', instagram: 'Instagram'
                }
                const label = fieldLabels[field] || field
                const message = Array.isArray(msgs) ? msgs.join(', ') : msgs
                return `• ${label}: ${message}`
              })
            
            errorMsg += errors.join('\n')
          } else {
            errorMsg = 'Data tidak valid. Silakan periksa kembali input Anda.'
          }
        } else {
          errorMsg = 'Error 400: Bad Request. Silakan coba lagi.'
        }
      } else if (err.response?.status === 500) {
        errorMsg = '🔧 Terjadi kesalahan di server.\n\nSilakan coba lagi atau hubungi administrator.'
      } else if (err.message) {
        errorMsg = err.message
      }
      
      alert('❌ Gagal menyimpan profil!\n\n' + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  const addExperience = () => {
    if (newExp.posisi && newExp.organisasi) {
      setPengalaman([...pengalaman, { ...newExp, id: Date.now() }])
      setNewExp({ posisi: '', organisasi: '', tahun_mulai: '', tahun_selesai: '', deskripsi: '' })
    }
  }

  const removeExperience = (id: number) => {
    setPengalaman(pengalaman.filter(exp => exp.id !== id))
  }

  const downloadCV = async () => {
    if (!profile?.id) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mahasiswa/${profile.id}/download-cv/`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CV_${profile.nama}.pdf`
      a.click()
    } catch (err) {
      alert('Gagal download CV')
    }
  }

  const downloadQR = async () => {
    if (!profile?.id) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/mahasiswa/${profile.id}/qr-code/`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `QR_${profile.nama}.png`
      a.click()
    } catch (err) {
      alert('Gagal download QR Code')
    }
  }

  if (!isAuthenticated) return null

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-blue-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Selamat datang, {user?.username}!</p>
            </div>
            <div className="flex gap-3">
              {profile?.id && (
                <Link href={`/talents/${profile.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Profil
                  </Button>
                </Link>
              )}
            </div>
          </div>



        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Photo & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center relative border-4 border-blue-100 dark:border-blue-900/50">
                    {photoPreview ? (
                      <Image 
                        src={photoPreview} 
                        alt="Profile" 
                        fill 
                        sizes="128px" 
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-blue-300 dark:text-blue-600" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>
                
                <h3 className="text-xl font-bold mt-4 text-gray-900 dark:text-white">{form.nama || 'Lengkapi Profil'}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{form.nim || 'NIM'}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{form.prodi || 'Program Studi'}</p>
                
                {/* Quick Stats */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{skills.length}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Skills</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{pengalaman.length}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Pengalaman</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{profile?.views_count || 0}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Views</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Preview
              </h3>
              <div className="space-y-2">
                {profile?.id ? (
                  <Link href={`/talents/${profile.id}`}>
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Lihat Profil Publik
                    </Button>
                  </Link>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    Simpan profil terlebih dahulu
                  </p>
                )}
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Unduh
              </h3>
              <div className="space-y-2">
                <Button onClick={downloadCV} variant="outline" className="w-full" disabled={!profile}>
                  <Download className="h-4 w-4 mr-2" />
                  Download CV (PDF)
                </Button>
                <Button onClick={downloadQR} variant="outline" className="w-full" disabled={!profile}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Biodata */}
            <Card>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                Biodata
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nama Lengkap"
                  value={form.nama}
                  onChange={(e) => setForm({...form, nama: e.target.value})}
                  icon={<User className="h-5 w-5" />}
                  placeholder="Masukkan nama lengkap"
                />
                <Input
                  label="NIM"
                  value={form.nim}
                  onChange={(e) => setForm({...form, nim: e.target.value})}
                  placeholder="Nomor Induk Mahasiswa"
                />
                <Input
                  label="Program Studi"
                  value={form.prodi}
                  onChange={(e) => setForm({...form, prodi: e.target.value})}
                  placeholder="Teknik Informatika"
                />
                <Input
                  label="Angkatan"
                  value={form.angkatan}
                  onChange={(e) => setForm({...form, angkatan: e.target.value})}
                  placeholder="2021"
                />
                <Input
                  label="Fakultas"
                  value={form.fakultas}
                  onChange={(e) => setForm({...form, fakultas: e.target.value})}
                  icon={<Building2 className="h-5 w-5" />}
                  placeholder="Fakultas Komunikasi dan Informatika"
                />
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  icon={<Mail className="h-5 w-5" />}
                  placeholder="email@ums.ac.id"
                />
                <Input
                  label="No. Telepon"
                  value={form.telepon}
                  onChange={(e) => setForm({...form, telepon: e.target.value})}
                  icon={<Phone className="h-5 w-5" />}
                  placeholder="08xxxxxxxxxx"
                />
                <Input
                  label="Tanggal Lahir"
                  type="date"
                  value={form.tanggal_lahir}
                  onChange={(e) => setForm({...form, tanggal_lahir: e.target.value})}
                  icon={<Calendar className="h-5 w-5" />}
                  className="md:col-span-2"
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alamat</label>
                  <textarea
                    value={form.alamat}
                    onChange={(e) => setForm({...form, alamat: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Alamat lengkap..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({...form, bio: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Ceritakan tentang diri Anda..."
                  />
                </div>
              </div>
            </Card>

            {/* Social Media */}
            <Card>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                Media Sosial & Website
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="LinkedIn"
                  value={form.linkedin}
                  onChange={(e) => setForm({...form, linkedin: e.target.value})}
                  placeholder="https://linkedin.com/in/username"
                />
                <Input
                  label="GitHub"
                  value={form.github}
                  onChange={(e) => setForm({...form, github: e.target.value})}
                  placeholder="https://github.com/username"
                />
                <Input
                  label="Instagram"
                  value={form.instagram}
                  onChange={(e) => setForm({...form, instagram: e.target.value})}
                  placeholder="https://instagram.com/username"
                />
                <Input
                  label="Website / Portfolio"
                  value={form.website}
                  onChange={(e) => setForm({...form, website: e.target.value})}
                  icon={<Globe className="h-5 w-5" />}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </Card>

            {/* Skills */}
            <Card>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                Skills
              </h2>
              <div className="flex gap-2 mb-4">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Tambah skill baru..."
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <div key={idx} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full flex items-center gap-2">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pengalaman */}
            <Card>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                Pengalaman Kerja / Magang
              </h2>
              
              {/* Form Tambah Pengalaman */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Posisi"
                    value={newExp.posisi}
                    onChange={(e) => setNewExp({...newExp, posisi: e.target.value})}
                    placeholder="Software Engineer / Intern"
                  />
                  <Input
                    label="Organisasi/Perusahaan"
                    value={newExp.organisasi}
                    onChange={(e) => setNewExp({...newExp, organisasi: e.target.value})}
                    placeholder="PT. Tech Indonesia"
                  />
                  <Input
                    label="Tahun Mulai"
                    value={newExp.tahun_mulai}
                    onChange={(e) => setNewExp({...newExp, tahun_mulai: e.target.value})}
                    placeholder="2021"
                  />
                  <Input
                    label="Tahun Selesai"
                    value={newExp.tahun_selesai}
                    onChange={(e) => setNewExp({...newExp, tahun_selesai: e.target.value})}
                    placeholder="2023 atau kosongkan jika masih aktif"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deskripsi</label>
                  <textarea
                    value={newExp.deskripsi}
                    onChange={(e) => setNewExp({...newExp, deskripsi: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="Deskripsikan pengalaman dan tanggung jawab Anda..."
                  />
                </div>
                <Button onClick={addExperience} size="sm" className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pengalaman
                </Button>
              </div>

              {/* List Pengalaman */}
              <div className="space-y-4">
                {pengalaman.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-6">
                    Belum ada pengalaman. Tambahkan pengalaman Anda di atas!
                  </p>
                ) : (
                  pengalaman.map((exp) => (
                    <div key={exp.id} className="border-l-4 border-blue-600 pl-4 p-4 bg-white dark:bg-gray-800 rounded-r-lg relative group hover:shadow-md transition-shadow">
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{exp.posisi}</h3>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">{exp.organisasi}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        {exp.tahun_mulai} - {exp.tahun_selesai || 'Sekarang'}
                      </p>
                      {exp.deskripsi && (
                        <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm">{exp.deskripsi}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Save Button - Highlighted */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 border-0 shadow-xl">
              <Button 
                onClick={handleSaveProfile} 
                size="lg" 
                className="w-full bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-none" 
                loading={loading}
              >
                <Save className="h-5 w-5 mr-2" />
                {profile?.id ? 'Simpan Perubahan' : 'Publikasikan Profil'}
              </Button>
              <p className="text-white text-xs text-center mt-2 opacity-90">
                {profile?.id 
                  ? '✓ Profil Anda sudah dipublikasikan' 
                  : 'Klik untuk mempublikasikan profil Anda'}
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
        />
      )}
    </main>
  )
}