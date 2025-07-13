'use client';

import Link from 'next/link';

export default function PengajarLayout({ children }) {
  return (
    <div>
      {/* Breadcrumb Navigation - tanpa navbar utama */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            <nav className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 text-sm font-medium">Pengajar</span>
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-blue-600 text-sm font-medium">Kelola Kursus</span>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
