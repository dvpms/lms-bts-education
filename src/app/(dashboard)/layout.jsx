'use client';

import { useState, useEffect } from 'react';

export default function DashboardLayout({ children }) {
  const [userName, setUserName] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Pastikan kode ini hanya berjalan di client
    setIsClient(true);
    const name = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'User';
    setUserName(name);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                LMS BTS Education
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {isClient ? userName : ''}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="py-6">
        {children}
      </main>
    </div>
  );
}
