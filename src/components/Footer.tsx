/**
 * Footer component with navigation mirror, project links, privacy notices,
 * and data ownership reminders. No em dashes used.
 */

import React from 'react';
import { ShieldCheck, HardDrive, RefreshCw } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
  onClearDataClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate, onClearDataClick }) => {
  return (
    <footer className="border-t border-[#20211E]/10 bg-[#E8E4DA]/40 text-[#20211E] pt-14 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#20211E]/10">
          {/* Brand & Purpose Column */}
          <div className="md:col-span-2 space-y-4">
            <span className="text-2xl font-bold font-heading tracking-tight text-[#20211E] block">
              SCRAPSHIFT
            </span>
            <p className="text-sm text-[#20211E]/80 max-w-md leading-relaxed">
              Build with what you have. Learn from what happens.
            </p>
            <p className="text-xs text-[#20211E]/70 max-w-md leading-relaxed">
              A utilitarian platform helping people transform discarded household remnants into functional inventions. Continual feedback loops turn structural failures into smarter construction blueprints.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#173D32] pt-2">
              <HardDrive className="w-3.5 h-3.5" />
              <span>All records stored locally in your browser storage.</span>
            </div>
          </div>

          {/* Application Navigation */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#173D32] font-heading mb-4">
              Workspace
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigate('/create')}
                  className="text-[#20211E]/80 hover:text-[#FF6B35] transition-colors"
                >
                  Start Building
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/projects')}
                  className="text-[#20211E]/80 hover:text-[#FF6B35] transition-colors"
                >
                  My Saved Projects
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/learning')}
                  className="text-[#20211E]/80 hover:text-[#FF6B35] transition-colors"
                >
                  Learning Journal
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate('/#how-it-works');
                    const el = document.getElementById('how-it-works');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[#20211E]/80 hover:text-[#FF6B35] transition-colors"
                >
                  How It Works
                </button>
              </li>
            </ul>
          </div>

          {/* Privacy & Trust */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#173D32] font-heading mb-4">
              Data & Ethics
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigate('/privacy')}
                  className="text-[#20211E]/80 hover:text-[#FF6B35] transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <span className="text-xs text-[#20211E]/60 block leading-tight">
                  No automated image transmission without user consent.
                </span>
              </li>
              <li>
                <span className="text-xs text-[#20211E]/60 block leading-tight">
                  Advisory concepts require hands-on physical testing.
                </span>
              </li>
              {onClearDataClick && (
                <li className="pt-2">
                  <button
                    onClick={onClearDataClick}
                    className="text-xs text-[#FF6B35] hover:underline flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reset Local Storage
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#20211E]/60">
          <p>© {new Date().getFullYear()} SCRAPSHIFT. Built for practical makers and salvage inventiveness.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#173D32]" />
              Local-first data architecture
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
