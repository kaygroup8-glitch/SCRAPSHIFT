/**
 * Projects Library Page (/projects)
 * Displays user's saved inventions, active builds, and revised designs.
 */

import React, { useState } from 'react';
import {
  ArrowRight,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Archive,
} from 'lucide-react';
import { ProjectRecord, ProjectStatus } from '../types';

interface ProjectsPageProps {
  projects: ProjectRecord[];
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onNavigateCreate: () => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  onOpenProject,
  onDeleteProject,
  onNavigateCreate,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | ProjectStatus>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.status === activeFilter;
  });

  const handleDeleteConfirmed = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteProject(id);
    setConfirmDeleteId(null);
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case 'saved_concept':
        return 'Saved Concept';
      case 'in_progress':
        return 'In Progress';
      case 'feedback_recorded':
        return 'Feedback Recorded';
      case 'revised_design':
        return 'Revised Design';
      default:
        return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#20211E]/10">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#173D32] font-heading block mb-1">
            Maker Archive
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#20211E] tracking-tight">
            Saved Projects ({projects.length})
          </h1>
          <p className="text-xs sm:text-sm text-[#20211E]/70 mt-1">
            Track prototypes, check off build instructions, and iterate on revised blueprints.
          </p>
        </div>

        <button
          onClick={onNavigateCreate}
          className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-bold font-heading bg-[#FF6B35] text-white hover:bg-[#E85A26] transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Start New Invention
        </button>
      </div>

      {/* Filter Bar (Segmented Controls) */}
      {projects.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#20211E]/10 text-xs font-heading">
          <span className="text-[#20211E]/50 uppercase tracking-wider font-mono mr-2">Filter:</span>
          {(['all', 'saved_concept', 'in_progress', 'feedback_recorded', 'revised_design'] as const).map(
            (statusKey) => {
              const count =
                statusKey === 'all'
                  ? projects.length
                  : projects.filter((p) => p.status === statusKey).length;
              const isSelected = activeFilter === statusKey;
              return (
                <button
                  key={statusKey}
                  onClick={() => setActiveFilter(statusKey)}
                  className={`px-3 py-1.5 transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-[#173D32] text-white font-bold'
                      : 'bg-[#E8E4DA] text-[#20211E] hover:bg-[#D4CEBF]'
                  }`}
                >
                  {statusKey === 'all' ? 'All Projects' : getStatusLabel(statusKey)} ({count})
                </button>
              );
            }
          )}
        </div>
      )}

      {/* Projects List or Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 sm:p-16 text-center border border-dashed border-[#20211E]/20 bg-[#F7F5EF] space-y-4 max-w-xl mx-auto">
          <Archive className="w-10 h-10 text-[#173D32] mx-auto opacity-60" />
          <h3 className="text-lg font-bold font-heading text-[#20211E]">
            {projects.length === 0 ? 'No saved projects yet' : 'No projects match this filter'}
          </h3>
          <p className="text-xs text-[#20211E]/70 max-w-md mx-auto leading-relaxed">
            {projects.length === 0
              ? 'Catalog your salvage pile and generate your first set of practical invention blueprints.'
              : 'Try selecting a different status filter above to view your archived designs.'}
          </p>
          {projects.length === 0 && (
            <button
              onClick={onNavigateCreate}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-bold font-heading bg-[#FF6B35] text-white hover:bg-[#E85A26]"
            >
              Start First Build
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => {
            const concept = p.concept;
            const completedCount = p.completedStepIndices?.length || 0;
            const totalCount = concept.steps?.length || 1;
            const progressPct = Math.round((completedCount / totalCount) * 100);
            const isDeletingThis = confirmDeleteId === p.id;

            return (
              <div
                key={p.id}
                onClick={() => onOpenProject(p.id)}
                className="border border-[#20211E]/15 bg-white flex flex-col justify-between hover:border-[#20211E]/40 transition-all cursor-pointer shadow-sm group"
              >
                <div className="p-6 space-y-4">
                  {/* Status & Date */}
                  <div className="flex items-center justify-between text-xs font-mono text-[#20211E]/60 border-b border-[#20211E]/10 pb-2">
                    <span className="font-bold text-[#173D32] uppercase">
                      {getStatusLabel(p.status)}
                    </span>
                    <span>{p.createdAt}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold font-heading text-[#20211E] group-hover:text-[#FF6B35] transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-[#173D32] font-medium mt-0.5 line-clamp-1">
                      {concept.tagline}
                    </p>
                  </div>

                  {/* Material summary */}
                  <div className="text-xs text-[#20211E]/75 space-y-1">
                    <span className="text-[11px] font-mono text-[#20211E]/50 block">MATERIALS:</span>
                    <p className="line-clamp-2">
                      {concept.materialsHave.map((m) => m.name).join(', ')}
                    </p>
                  </div>

                  {/* Progress Strip */}
                  <div className="space-y-1.5 pt-2 border-t border-[#20211E]/10">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#20211E]/60">
                      <span>BUILD PROGRESS</span>
                      <span>{completedCount}/{totalCount} steps ({progressPct}%)</span>
                    </div>
                    <div className="w-full bg-[#E8E4DA] h-1.5 overflow-hidden">
                      <div
                        className="bg-[#173D32] h-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-[#F7F5EF] border-t border-[#20211E]/10 flex items-center justify-between">
                  <span className="text-xs font-heading font-bold text-[#20211E] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Open Blueprint
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF6B35]" />
                  </span>

                  {isDeletingThis ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDeleteConfirmed(p.id, e)}
                        className="px-2 py-1 text-[11px] font-bold font-heading bg-red-600 text-white"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="text-[11px] text-[#20211E]/60 underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(p.id);
                      }}
                      className="text-[#20211E]/40 hover:text-red-600 transition-colors p-1"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
