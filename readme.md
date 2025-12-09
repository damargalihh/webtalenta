[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/WeSVcWAK)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=21985950&assignment_repo_type=AssignmentRepo)

# Tugas Mata Kuliah: TIF 1336 Pemrograman Web Berbasis Framework
## Proyek: Aplikasi **Talenta Mahasiswa UMS**

---

## 1. Deskripsi Umum
Aplikasi **Talenta Mahasiswa UMS** adalah platform berbasis web yang digunakan untuk menampilkan profil, skill, portofolio, dan pengalaman mahasiswa UMS kepada publik. Aplikasi dibangun menggunakan:

- **Backend:** Django REST Framework  
- **Frontend:** ReactJS menggunakan Vite atau NextJS  
- **Database:** bebas (PostgreSQL direkomendasikan)

Aplikasi menyediakan fitur bagi mahasiswa untuk membuat dan mengelola profil talenta, serta menyediakan antarmuka publik agar masyarakat dapat melihat daftar dan detail talenta mahasiswa.

---

## 2. Tujuan Pembelajaran
1. Menerapkan arsitektur *frontend–backend* terpisah.  
2. Membangun REST API menggunakan Django REST Framework.  
3. Mengimplementasikan autentikasi dan otorisasi menggunakan Token/JWT.  
4. Membangun antarmuka dengan ReactJS dan state management.  
5. Mengembangkan aplikasi web dengan prinsip UX dan user journey.  

---

## 3. Role Pengguna
### **3.1. Mahasiswa**
- Login/Register  
- Mengisi & mengubah biodata  
- Menambah/mengedit skill  
- Menambah/mengedit pengalaman  
- Mengunggah foto profil  
- Melihat preview profil sebagai talenta publik
- Mendownload CV

### **3.2. Admin** (opsional)
- Login  
- Menampilkan seluruh data mahasiswa  
- Mengelola data mahasiswa (untuk keperluan moderasi)
  - Menonaktifkan profil mahasiswa 
  - Mengaktifkan kembali profil mahasiswa

### **3.3. Pengunjung Publik**
- Menjelajah daftar talenta (termasuk filter berdasarkan skill/prodi)
- Melihat detail talenta
- Mencari talenta berdasarkan nama, skill, atau prodi
- Melihat talenta terbaru (5 talenta terbaru di halaman utama)
- Menghubungi mahasiswa melalui email atau media sosial

---

## 4. User Journey
### **4.1. User Mahasiswa**
1. Masuk ke website → pilih Login  
2. Login/Register  
3. Masuk dashboard  
4. Mengisi biodata, foto, skill, pengalaman  
5. Profil muncul sebagai talenta publik  
6. Dapat kembali mengedit kapan saja
7. Dapat mendownload CV dalam format PDF

### **4.2. Admin**
1. Login admin  
2. Dashboard admin  
3. Mengelola data mahasiswa  
4. Menonaktifkan/mengaktifkan profil mahasiswa

### **4.3. Pengunjung Publik**
1. Masuk ke halaman Home  
2. Melihat talenta terbaru  
3. Menjelajah daftar talenta  
4. Melihat detail talenta  
5. Menghubungi mahasiswa melalui email atau media sosial

---

# Deployment
Aplikasi wajib di-deploy ke platform hosting (Heroku, Vercel, Netlify, GCP, AWS, dll).

## 5. Deliverables Tugas
1. Repository backend (GitHub Classroom)  
2. Repository frontend (GitHub Classroom)  
3. Dokumentasi API (Swagger/Redoc/Postman)  
4. Dokumentasi proyek (Markdown/PDF), berisi:  
   - ERD  
   - User flow  
   - Arsitektur aplikasi dan deployment  
   - Penjelasan singkat tiap fitur
5. Video demo aplikasi (3–10 menit)  

---

## 6. Bonus
1. Menggunakan TypeScript di frontend
2. Sistem rekomendasi talenta berdasarkan pencarian pengguna
3. Menampilkan profil mahasiswa yang sering dilihat
4. Fitur dark/light mode
5. Endorsement skill. Mahasiswa dapat mengendorse skill teman mereka.  
6. QR Code profil yang dapat diunduh dan dibagikan
7. Integrasi dengan sosial media
8. Deploy di custom domain (misal: talenta-ums.com)
9. Deploy menggunakan Docker

---
## 7. Administrasi Tugas
1. Tugas dikerjakan secara berkelompok (4-8 orang per kelompok).
2. Deadline pengumpulan tugas adalah tanggal 20 Desember 2025, pukul 23:59 WIB.
3. Aplikasi wajib diisi dengan data mahasiswa kelompok Anda (minimal 5 talenta).

---
## 8. Catatan
1. Pastikan menambahkan .gitignore di masing-masing repository. Jangan sampai anda mengunggah file sensitif seperti .env, settings.py, node_modules, dll.
2. Gunakan commit message yang baik dan deskriptif.
3. Setiap kelompok wajib memiliki minimal 20 commit di masing-masing repository (frontend & backend). Setiap anggota kelompok harus berkontribusi secara aktif dan minimal memiliki total 5 commit.
4. Gunakan branching dan pull request untuk setiap fitur yang ditambahkan.
5. Pastikan aplikasi berjalan dengan baik sebelum mengumpulkan tugas.
6. Jangan lupa untuk menambahkan dokumentasi yang jelas di README.md masing-masing repository.
7. Jika ada pertanyaan, silakan hubungi dosen atau asisten dosen yang bertugas.