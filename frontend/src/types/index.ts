export interface Mahasiswa {
  id: number
  nama: string
  nim: string
  prodi: string
  email: string
  bio: string
  foto_profil?: string
  linkedin?: string
  github?: string
  views_count: number
  is_active: boolean
}

export interface SkillEndorsement {
  id: number
  endorsed_by: number
  endorsed_by_username: string
  created_at: string
}

export interface Skill {
  id: number
  nama: string
  level: string
  endorsement_count: number
  endorsements: SkillEndorsement[]
}

export interface Talent {
  id: number
  judul: string
  deskripsi: string
  kategori?: string
  link_portfolio?: string
}