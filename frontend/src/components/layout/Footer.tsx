import Link from 'next/link'
import { Mail, MapPin, Phone, Facebook, Instagram, Twitter, Linkedin, Sparkles } from 'lucide-react'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl blur-md opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-2xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Talenta UMS
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Excellence in Talent</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
              Platform untuk menampilkan skill dan portofolio mahasiswa
              Universitas Muhammadiyah Surakarta
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              <Sparkles className="h-4 w-4" />
              Mencerahkan, Unggul, Mendunia
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Menu</h4>
            <ul className="space-y-2.5 text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  <span className="text-blue-500 dark:text-blue-400 group-hover:translate-x-1 transition-transform">›</span> Home
                </Link>
              </li>
              <li>
                <Link href="/talents" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  <span className="text-blue-500 dark:text-blue-400 group-hover:translate-x-1 transition-transform">›</span> Explore Talents
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  <span className="text-blue-500 dark:text-blue-400 group-hover:translate-x-1 transition-transform">›</span> Daftar
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  <span className="text-blue-500 dark:text-blue-400 group-hover:translate-x-1 transition-transform">›</span> Login
                </Link>
              </li>
              <li>
                <a href="https://www.ums.ac.id" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group">
                  <span className="text-blue-500 dark:text-blue-400 group-hover:translate-x-1 transition-transform">›</span> UMS Official
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Kontak</h4>
            <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="flex-shrink-0 mt-1 text-blue-400" />
                <span>
                  Jl. A. Yani, Pabelan, Kartasura, Sukoharjo, Jawa Tengah
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-blue-400" />
                <a href="tel:+62271717417" className="hover:text-white transition-colors">
                  +62 (271) 717-417
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-blue-400" />
                <a
                  href="mailto:info@ums.ac.id"
                  className="hover:text-white transition-colors"
                >
                  info@ums.ac.id
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>
              © {currentYear} Talenta Mahasiswa UMS. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="https://facebook.com/umsofficial" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com/umsofficial" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://twitter.com/umsofficial" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
