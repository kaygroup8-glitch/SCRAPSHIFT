/**
 * Learning Journal Page (/learning) for SCRAPSHIFT
 * The continual memory core of the application:
 * Lists recorded workbench outcomes, failure analyses, and corrective design adjustments.
 * Clearly marks records as user-reported experiences, not lab-verified results.
 */

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  BookOpen,
  Info,
  Lightbulb,
  X,
} from 'lucide-react';
import { LearningLesson, BuildOutcome } from '../types';
import { StorageService } from '../services/storage';

interface LearningJournalPageProps {
  lessons: LearningLesson[];
  onUpdateLesson: (updated: LearningLesson) => void;
  onDeleteLesson: (id: string) => void;
  onNavigateCreate: () => void;
}

export const LearningJournalPage: React.FC<LearningJournalPageProps> = ({
  lessons,
  onUpdateLesson,
  onDeleteLesson,
  onNavigateCreate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | BuildOutcome>('all');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editObservations, setEditObservations] = useState('');
  const [editAdjustment, setEditAdjustment] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredLessons = lessons.filter((l) => {
    if (outcomeFilter !== 'all' && l.outcome !== outcomeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${l.projectTitle} ${l.userObservations} ${l.suggestedDesignAdjustment} ${l.materialsUsed.join(' ')}`.toLowerCase();
      return matchText.includes(q);
    }
    return true;
  });

  const handleStartEdit = (lesson: LearningLesson) => {
    setEditingLessonId(lesson.id);
    setEditObservations(lesson.userObservations);
    setEditAdjustment(lesson.suggestedDesignAdjustment);
  };

  const handleSaveEdit = (lesson: LearningLesson) => {
    const updated: LearningLesson = {
      ...lesson,
      userObservations: editObservations.trim(),
      suggestedDesignAdjustment: editAdjustment.trim(),
    };
    onUpdateLesson(updated);
    StorageService.saveLesson(updated);
    setEditingLessonId(null);
  };

  const handleDelete = (id: string) => {
    onDeleteLesson(id);
    StorageService.deleteLesson(id);
    setDeleteConfirmId(null);
  };

  const getOutcomeColor = (outcome: BuildOutcome) => {
    switch (outcome) {
      case 'worked':
        return 'text-[#173D32] bg-[#173D32]/10 border-[#173D32]/30';
      case 'partially_worked':
        return 'text-[#FF6B35] bg-[#FF6B35]/10 border-[#FF6B35]/30';
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'too_expensive':
      case 'missing_materials':
      case 'too_difficult':
        return 'text-[#20211E] bg-[#E8E4DA] border-[#20211E]/20';
      default:
        return 'text-[#20211E] bg-[#E8E4DA] border-[#20211E]/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#20211E]/10">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#173D32] font-heading block mb-1">
            Continual Memory Engine
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#20211E] tracking-tight">
            Learning Journal ({lessons.length})
          </h1>
          <p className="text-xs sm:text-sm text-[#20211E]/70 mt-1 max-w-2xl">
            Every failure, partial success, or material limitation recorded here is queried when generating future blueprints to prevent repeated construction bottlenecks.
          </p>
        </div>

        <button
          onClick={onNavigateCreate}
          className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-bold font-heading bg-[#FF6B35] text-white hover:bg-[#E85A26] transition-colors self-start sm:self-auto shadow-sm"
        >
          Start An Invention
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Advisory Banner */}
      <div className="p-4 bg-[#E8E4DA]/40 border border-[#20211E]/15 flex items-start gap-3 text-xs text-[#20211E]/80">
        <Info className="w-4 h-4 text-[#173D32] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#20211E] font-heading uppercase tracking-wide block mb-0.5">
            User-Reported Experiences Notice:
          </strong>
          Entries in this journal reflect subjective maker reports and physical workbench trials. They are not lab-certified structural test results. Variations in humidity, adhesive age, and cardboard flute density will affect real-world outcomes.
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#20211E]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search observations, materials, or fixes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#20211E]/30 bg-white text-[#20211E] focus:outline-none focus:border-[#FF6B35]"
          />
        </div>

        {/* Outcome Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-heading">
          {(
            [
              'all',
              'failed',
              'partially_worked',
              'worked',
              'too_difficult',
              'missing_materials',
            ] as const
          ).map((filterKey) => {
            const isSelected = outcomeFilter === filterKey;
            return (
              <button
                key={filterKey}
                onClick={() => setOutcomeFilter(filterKey)}
                className={`px-3 py-1.5 transition-colors whitespace-nowrap shrink-0 capitalize ${
                  isSelected
                    ? 'bg-[#173D32] text-white font-bold'
                    : 'bg-[#E8E4DA] text-[#20211E] hover:bg-[#D4CEBF]'
                }`}
              >
                {filterKey.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lessons List or Empty State */}
      {filteredLessons.length === 0 ? (
        <div className="p-12 sm:p-16 text-center border border-dashed border-[#20211E]/20 bg-[#F7F5EF] space-y-4 max-w-xl mx-auto">
          <BookOpen className="w-10 h-10 text-[#173D32] mx-auto opacity-60" />
          <h3 className="text-lg font-bold font-heading text-[#20211E]">
            {lessons.length === 0 ? 'No lessons recorded yet' : 'No lessons match your search'}
          </h3>
          <p className="text-xs text-[#20211E]/70 max-w-md mx-auto leading-relaxed">
            {lessons.length === 0
              ? 'Build a prototype from your scrap pile and record what happened. The continual learning loop will record your observations.'
              : 'Try clearing your search query or selecting "All" to view all recorded outcomes.'}
          </p>
          {lessons.length === 0 && (
            <button
              onClick={onNavigateCreate}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-bold font-heading bg-[#FF6B35] text-white hover:bg-[#E85A26]"
            >
              Start First Build
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLessons.map((lesson) => {
            const isEditing = editingLessonId === lesson.id;
            const isConfirmingDelete = deleteConfirmId === lesson.id;

            return (
              <div
                key={lesson.id}
                className="border border-[#20211E]/15 bg-white p-6 space-y-4 hover:border-[#20211E]/40 transition-colors shadow-sm"
              >
                {/* Header Metadata (Zero-Pill: unboxed text with separators) */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#20211E]/10 pb-3">
                  <div className="flex flex-wrap items-center gap-2 text-[#20211E]/60 font-mono">
                    <span className="font-bold text-[#20211E]">{lesson.id}</span>
                    <span>·</span>
                    <span>Recorded: {lesson.dateRecorded}</span>
                    <span>·</span>
                    <span>Materials: {lesson.materialsUsed.join(', ')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold uppercase px-2 py-0.5 border ${getOutcomeColor(
                        lesson.outcome
                      )}`}
                    >
                      Outcome: {lesson.outcome.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Project Title */}
                <div>
                  <h3 className="text-lg font-bold font-heading text-[#20211E]">
                    {lesson.projectTitle}
                  </h3>
                </div>

                {/* Main Observations & Design Directives */}
                {isEditing ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-mono text-[#20211E]/70 uppercase mb-1">
                        USER OBSERVATIONS:
                      </label>
                      <textarea
                        rows={3}
                        value={editObservations}
                        onChange={(e) => setEditObservations(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#20211E]/30 bg-[#F7F5EF] text-[#20211E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#20211E]/70 uppercase mb-1">
                        SUGGESTED DESIGN ADJUSTMENT:
                      </label>
                      <input
                        type="text"
                        value={editAdjustment}
                        onChange={(e) => setEditAdjustment(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#20211E]/30 bg-[#F7F5EF] text-[#20211E]"
                      />
                    </div>
                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button
                        onClick={() => setEditingLessonId(null)}
                        className="px-3 py-1.5 text-xs text-[#20211E]/70 hover:underline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(lesson)}
                        className="px-4 py-1.5 text-xs font-bold font-heading bg-[#173D32] text-white"
                      >
                        Save Updates
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                    <div className="p-4 bg-[#F7F5EF] border border-[#20211E]/10 space-y-1">
                      <span className="font-mono font-bold text-[#20211E]/50 block">
                        OBSERVED BEHAVIOR
                      </span>
                      <p className="text-[#20211E] leading-relaxed">
                        {lesson.userObservations}
                      </p>
                    </div>

                    <div className="p-4 bg-[#173D32]/5 border border-[#173D32]/20 space-y-1">
                      <span className="font-mono font-bold text-[#173D32] flex items-center gap-1.5 block">
                        <Lightbulb className="w-3.5 h-3.5 text-[#FF6B35]" />
                        ADAPTATION DIRECTIVE (APPLIED TO FUTURE BLUEPRINTS)
                      </span>
                      <p className="text-[#173D32] font-semibold leading-relaxed">
                        {lesson.suggestedDesignAdjustment}
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                {!isEditing && (
                  <div className="flex items-center justify-between pt-2 border-t border-[#20211E]/10 text-xs">
                    <span className="text-[#20211E]/50 font-mono text-[11px]">
                      Not physically verified lab data · Subjective maker test
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleStartEdit(lesson)}
                        className="text-[#20211E]/70 hover:text-[#20211E] flex items-center gap-1 font-mono text-[11px]"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit Lesson
                      </button>

                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(lesson.id)}
                            className="px-2 py-0.5 text-[11px] font-bold bg-red-600 text-white"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-[11px] text-[#20211E]/60 underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(lesson.id)}
                          className="text-[#20211E]/40 hover:text-red-600 transition-colors p-1"
                          title="Delete lesson"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
