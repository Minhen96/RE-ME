'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, User, Sprout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavHeaderProps {
  userName?: string;
}

export default function NavHeader({ userName }: NavHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Navigation links (Profile removed)
  const navLinks = [
    { name: 'Dashboard', path: '/', emoji: '🏠' },
    { name: 'Hobbies', path: '/hobbies', emoji: '🎨' },
    { name: 'Moments', path: '/moments', emoji: '❤️' },
    { name: 'Soulmate', path: '/soulmate', emoji: '💕' },
    { name: 'Life Tree', path: '/tree', emoji: '🌳' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => router.push('/')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <Sprout className="w-8 h-8 text-primary-600 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold text-gray-900">RE:ME</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-2">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => router.push(link.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive(link.path)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{link.emoji}</span>
                {link.name}
              </button>
            ))}
          </div>

          {/* Profile Button - Desktop */}
          <div className="hidden md:flex">
            <button
              onClick={() => router.push('/profile')}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-primary-300 to-primary-500 text-white text-sm font-semibold flex items-center gap-2 shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-200"
            >
              <User className="w-5 h-5" />
              Profile
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-200 py-4 space-y-2 overflow-hidden"
            >
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    router.push(link.path);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive(link.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{link.emoji}</span>
                  {link.name}
                </button>
              ))}

              {/* Profile Button - Mobile */}
              <button
                onClick={() => {
                  router.push('/profile');
                  setShowMobileMenu(false);
                }}
                className="w-full px-5 py-2 rounded-full bg-gradient-to-r from-primary-300 to-primary-500 text-white text-sm font-semibold flex items-center gap-2 justify-center shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-200"
              >
                <User className="w-5 h-5" />
                Profile
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
