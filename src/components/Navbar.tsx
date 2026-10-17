/**
 * Top Navigation Bar adhering to the Top Bar Contract:
 * Zone 1: Single text wordmark in display face
 * Zone 2: 4-5 clean single-line text links
 * Zone 3: 1 primary CTA button
 */

import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    navigate(path);
  };

  const navLinks = [
    { label: 'How It Works', path: '/#how-it-works' },
    { label: 'Create', path: '/create' },
    { label: 'My Projects', path: '/projects' },
    { label: 'Learning Journal', path: '/learning' },
    { label: 'Privacy', path: '/privacy' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F7F5EF]/95 backdrop-blur-sm border-b border-[#20211E]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => handleLinkClick('/', e)}
          className="text-xl sm:text-2xl font-bold tracking-tight text-[#20211E] font-heading whitespace-nowrap shrink-0 hover:text-[#173D32] transition-colors"
        >
          SCRAPSHIFT
        </a>

        {/* Zone 2: 4-5 concise single-line text links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#20211E]/80">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <a
                key={link.label}
                href={link.path}
                onClick={(e) => handleLinkClick(link.path, e)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  isActive
                    ? 'text-[#FF6B35] font-semibold border-b-2 border-[#FF6B35]'
                    : 'hover:text-[#20211E]'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary CTA Button */}
        <div className="hidden sm:flex items-center shrink-0">
          <button
            onClick={() => navigate('/create')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-bold text-white bg-[#FF6B35] rounded-none hover:bg-[#E85A26] active:translate-y-px transition-all whitespace-nowrap shrink-0 font-heading"
          >
            Start Building
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => navigate('/create')}
            className="px-3 py-1.5 text-xs font-bold text-white bg-[#FF6B35] font-heading"
          >
            Start
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#20211E] hover:bg-[#E8E4DA] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#20211E]/10 bg-[#F7F5EF] px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.path}
              onClick={(e) => handleLinkClick(link.path, e)}
              className={`block px-3 py-2 text-base font-medium rounded-none ${
                currentPath === link.path
                  ? 'bg-[#173D32] text-white font-semibold'
                  : 'text-[#20211E] hover:bg-[#E8E4DA]'
              }`}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/create');
              }}
              className="w-full py-3 text-center text-sm uppercase tracking-wider font-bold text-white bg-[#FF6B35] font-heading"
            >
              Start Building With Materials
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
