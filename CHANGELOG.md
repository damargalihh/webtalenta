# Changelog

## [Unreleased] - 2025-12-15

### Added Backend
- Implementasi model Mahasiswa dengan field lengkap (NIM, nama, email, dll)
- Tracking model untuk ProfileView
- Model Pengalaman untuk riwayat mahasiswa
- Model Skill dengan sistem endorsement
- Model Talent dengan galeri gambar
- Admin views untuk manajemen data
- CV Generator untuk generate CV otomatis

### Added Frontend
- Implementasi layout dengan Header dan Footer responsif
- Halaman authentication (login & register) dengan gradient modern
- Dashboard mahasiswa
- Admin panel untuk pengelolaan data
- Halaman talents dengan search dan filter
- Theme toggle (light/dark mode)
- Image cropper untuk upload foto profil
- UI components (Button, Card, Input, Skeleton)

### Added Testing
- Test suite untuk modul accounts
- Test suite untuk modul mahasiswa
- Test suite untuk modul skills
- Test suite untuk modul talents
- Integration tests untuk semua fitur

### Configuration
- Setup Next.js 14 dengan TypeScript
- Konfigurasi Tailwind CSS v3
- Setup Django REST Framework
- Konfigurasi CORS untuk komunikasi frontend-backend
- Dependencies management untuk kedua environment

### Documentation
- README dengan instruksi setup
- API testing HTML file
- Requirements.txt untuk Python packages
