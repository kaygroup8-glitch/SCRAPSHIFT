/**
 * Privacy Policy & Data Controls Page (/privacy) for SCRAPSHIFT
 * Completely honest, transparent privacy practices:
 * Covers local storage, photograph handling, external AI provider terms,
 * and includes functional JSON export and data deletion with double confirmation.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  HardDrive,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface PrivacyPageProps {
  onDataCleared: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onDataCleared }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationWord, setDeleteConfirmationWord] = useState('');
  const [isDeletedSuccess, setIsDeletedSuccess] = useState(false);

  const handleExportData = () => {
    const jsonStr = StorageService.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scrapshift-data-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExecuteDelete = () => {
    if (deleteConfirmationWord.toUpperCase() !== 'DELETE') return;
    StorageService.clearAllLocalData();
    setIsDeletedSuccess(true);
    setTimeout(() => {
      setIsDeletedSuccess(false);
      setShowDeleteModal(false);
      setDeleteConfirmationWord('');
      onDataCleared();
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12">
      {/* Header */}
      <div className="border-b border-[#20211E]/10 pb-6 space-y-2">
        <span className="text-xs uppercase tracking-widest font-bold text-[#173D32] font-heading block">
          Transparent Operations
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#20211E] tracking-tight">
          Privacy Policy and Data Controls
        </h1>
        <p className="text-xs sm:text-sm text-[#20211E]/70 max-w-2xl leading-relaxed">
          SCRAPSHIFT operates on a local-first architecture. Your materials inventory, project notes, and recorded failures remain stored on your device unless you opt into external synthesis.
        </p>
      </div>

      {/* Interactive Data Controls Box */}
      <div className="p-6 border border-[#20211E]/20 bg-[#E8E4DA]/40 space-y-4">
        <h3 className="text-sm font-bold font-heading text-[#20211E] uppercase tracking-wider flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[#173D32]" />
          Your Stored Data Controls
        </h3>
        <p className="text-xs text-[#20211E]/80 leading-relaxed">
          You can inspect your data, back up records into an offline JSON file, or permanently wipe your local browser memory at any time.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider font-heading bg-white border border-[#20211E]/30 text-[#20211E] hover:border-[#20211E] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#173D32]" />
            Export My Records (JSON)
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider font-heading bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete All Stored Data
          </button>
        </div>
      </div>

      {/* Structured Sections */}
      <div className="space-y-8 text-xs sm:text-sm text-[#20211E]/80 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold font-heading text-[#20211E]">
            1. Information Users Enter
          </h2>
          <p>
            When utilizing SCRAPSHIFT, you may submit text descriptions of salvaged materials, approximate quantities, condition assessments, tool checklists, preferred construction difficulty, and subjective build observations. All of these inputs are stored directly within your local web browser storage (localStorage).
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold font-heading text-[#20211E]">
            2. Uploaded Photographs
          </h2>
          <p>
            You may optionally upload photographs of your materials pile or finished prototypes. These photographs are processed client-side via standard HTML5 FileReader technology for your local preview convenience. They are never transmitted across the network, stored on third-party servers, or analyzed via external computer vision models without explicit affirmative consent.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold font-heading text-[#20211E]">
            3. How Information is Processed
          </h2>
          <p>
            Invention blueprint generation and continual lesson matching execute client-side by default using a deterministic scrap engineering rules engine. When an optional server-side integration is configured, textual descriptions of materials and constraints may be processed via an Express backend route to query Google Gemini for structured recommendations.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold font-heading text-[#20211E]">
            4. Local Browser Storage
          </h2>
          <p>
            All saved projects, active step checklists, and learning journal entries are retained in standard browser localStorage under the namespace <code>scrapshift_*</code>. Please note that clearing your browser cache, browsing in private/incognito mode, or resetting site data will erase these local records unless you have exported a JSON backup.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold font-heading text-[#20211E]">
            5. External AI Providers
          </h2>
          <p>
            If server-side synthesis is configured and you have checked the consent toggle, submitted text parameters are transmitted securely from our server to Google's Gemini API endpoints. Google's processing of that data is subject to Google's standard enterprise API data governance terms.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold font-heading text-[#20211E]">
            6. Data Retention and Deletion
          </h2>
          <p>
            Because records are stored client-side on your hardware, data retention is entirely under your control. You may delete individual lessons in the Learning Journal, remove projects from the archive, or trigger a full wipe using the data controls above.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold font-heading text-[#20211E]">
            7. Contact Information
          </h2>
          <p>
            This application is deployed as a self-hosted instance. For privacy inquiries or server administrator questions, please contact the site operator or technical maintainer responsible for hosting this deployment.
          </p>
        </section>
      </div>

      {/* Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-[#20211E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F7F5EF] border border-[#20211E] max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-lg font-bold font-heading">
                Confirm Permanent Data Wipe
              </h3>
            </div>

            <p className="text-xs text-[#20211E]/80 leading-relaxed">
              This action will erase all saved projects, custom materials drafts, and continual learning records from your browser. This cannot be undone.
            </p>

            {isDeletedSuccess ? (
              <div className="p-4 bg-[#173D32] text-white text-center text-xs font-mono">
                All local data successfully cleared.
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-mono text-[#20211E]/70 uppercase">
                  Type <strong>DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationWord}
                  onChange={(e) => setDeleteConfirmationWord(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 text-xs border border-[#20211E]/40 bg-white text-[#20211E] uppercase font-mono"
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmationWord('');
                    }}
                    className="text-xs text-[#20211E]/70 underline"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteDelete}
                    disabled={deleteConfirmationWord.toUpperCase() !== 'DELETE'}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider font-heading ${
                      deleteConfirmationWord.toUpperCase() === 'DELETE'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-[#20211E]/20 text-[#20211E]/40 cursor-not-allowed'
                    }`}
                  >
                    Wipe All Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
