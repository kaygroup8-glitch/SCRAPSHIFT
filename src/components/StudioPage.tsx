/**
 * Studio Page (/studio) for SCRAPSHIFT
 * Displays 3 generated, grounded invention concepts incorporating lessons
 * retrieved from previous user-reported failures.
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock,
  Layers,
  Wrench,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Info,
  RotateCcw,
} from 'lucide-react';
import { InventionConcept, LessonChangeNote } from '../types';

interface StudioPageProps {
  concepts: InventionConcept[];
  sourceLessons: LessonChangeNote[];
  engineSource: 'gemini' | 'deterministic';
  learningNotes: string;
  isLoading: boolean;
  onSelectConcept: (concept: InventionConcept) => void;
  onSaveConcept: (concept: InventionConcept) => void;
  onBackToCreate: () => void;
  onTriggerDemo: () => void;
}

const CONCEPT_IMAGE_MAP: Record<string, string> = {
  cardboard_organizer: '/src/assets/images/concept_cardboard_organizer_1792255110536.jpg',
  reclaimed_planter: '/src/assets/images/concept_reclaimed_planter_1792255110783.jpg',
  packaging_storage: '/src/assets/images/concept_packaging_storage_1792255110822.jpg',
  hero_default: '/src/assets/images/hero_scrapshift_transformation_1792255109387.jpg',
};

export const StudioPage: React.FC<StudioPageProps> = ({
  concepts,
  sourceLessons,
  engineSource,
  learningNotes,
  isLoading,
  onSelectConcept,
  onSaveConcept,
  onBackToCreate,
  onTriggerDemo,
}) => {
  const [savedConceptIds, setSavedConceptIds] = useState<string[]>([]);

  const handleSaveClick = (concept: InventionConcept, e: React.MouseEvent) => {
    e.stopPropagation();
    onSaveConcept(concept);
    if (!savedConceptIds.includes(concept.id)) {
      setSavedConceptIds([...savedConceptIds, concept.id]);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="inline-block p-4 bg-[#E8E4DA] border border-[#20211E]/20 animate-pulse">
          <Layers className="w-8 h-8 text-[#FF6B35] animate-spin" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#173D32] block">
            RETRIEVING LESSONS & SYNTHESIZING INVENTIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#20211E]">
            Evaluating material mechanics...
          </h2>
          <p className="text-sm text-[#20211E]/70 max-w-md mx-auto">
            Checking your Learning Journal for prior stress points and matching geometries.
          </p>
        </div>
      </div>
    );
  }

  if (!concepts || concepts.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <h2 className="text-2xl font-bold font-heading text-[#20211E]">
          No inventions generated yet.
        </h2>
        <p className="text-sm text-[#20211E]/75">
          Start by cataloging your materials in the creation wizard.
        </p>
        <button
          onClick={onBackToCreate}
          className="px-6 py-3 text-xs uppercase tracking-wider font-bold font-heading bg-[#FF6B35] text-white"
        >
          Open Material Intake
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-12">
      {/* Studio Header & Back Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#20211E]/10">
        <div>
          <button
            onClick={onBackToCreate}
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#20211E]/70 hover:text-[#20211E] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Adjust Materials and Constraints
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#20211E] tracking-tight">
            Generated Invention Blueprints
          </h1>
          <div className="flex items-center gap-2 text-xs text-[#20211E]/80 mt-1.5 font-mono">
            {engineSource === 'gemini' ? (
              <span className="inline-flex items-center gap-1.5 text-[#173D32] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#173D32]" />
                POWERED BY GOOGLE GEMINI 2.5 FLASH · DEEP MATERIAL SYNTHESIS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[#20211E]/70 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#FF6B35]" />
                DETERMINISTIC SCRAP RULES ENGINE (OFFLINE)
              </span>
            )}
            <span>·</span>
            <span>3 Grounded Functional Blueprints</span>
          </div>

        </div>

        <button
          onClick={onTriggerDemo}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-bold font-heading bg-[#E8E4DA] hover:bg-[#D4CEBF] text-[#20211E] self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#FF6B35]" />
          Run Learning Loop Demo
        </button>
      </div>

      {/* CONTINUAL LEARNING BANNER: "Changed because of what you learned" */}
      <div className="p-6 border border-[#173D32]/30 bg-[#173D32]/5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#173D32]">
          <Lightbulb className="w-4 h-4 text-[#FF6B35]" />
          <span>Changed because of what you learned</span>
        </div>

        {sourceLessons.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-[#20211E] font-medium leading-relaxed">
              {learningNotes}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {sourceLessons.map((note, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border border-[#20211E]/10 text-xs space-y-1"
                >
                  <span className="font-mono font-bold text-[#FF6B35] block">
                    LESSON INFLUENCE #{idx + 1}
                  </span>
                  <p className="text-[#20211E]/75">
                    <strong>Previous failure observed:</strong> {note.originalProblem}
                  </p>
                  <p className="text-[#173D32] font-semibold">
                    <strong>Adjusted recommendation:</strong> {note.whatChanged}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#20211E]/80 leading-relaxed">
            <p>
              No past failure or adjustment records directly matched this material combination. The recommendations follow baseline scrap engineering rules. Once you build and log an outcome in your Learning Journal, future runs will incorporate your real-world findings.
            </p>
          </div>
        )}

        <div className="pt-2 border-t border-[#20211E]/10 flex items-center gap-2 text-[11px] text-[#20211E]/60">
          <Info className="w-3.5 h-3.5 text-[#173D32] shrink-0" />
          <span>
            Physical verification notice: Reclaimed scrap materials vary in moisture, fiber fatigue, and adhesive quality. Always test joints safely before relying on load-bearing assemblies.
          </span>
        </div>
      </div>

      {/* 3 DISTINCT CONCEPT CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {concepts.map((concept, index) => {
          const imageSrc =
            concept.conceptImageKey && CONCEPT_IMAGE_MAP[concept.conceptImageKey]
              ? CONCEPT_IMAGE_MAP[concept.conceptImageKey]
              : CONCEPT_IMAGE_MAP.hero_default;
          const isSaved = savedConceptIds.includes(concept.id);

          return (
            <div
              key={concept.id}
              className="border border-[#20211E]/15 bg-white flex flex-col justify-between hover:border-[#20211E]/40 transition-all shadow-sm"
            >
              <div>
                {/* Visual Header */}
                <div className="relative aspect-[4/3] bg-[#E8E4DA] overflow-hidden border-b border-[#20211E]/10">
                  <img
                    src={imageSrc}
                    alt={concept.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#20211E] text-white text-[11px] font-mono uppercase font-bold">
                    Concept 0{index + 1}
                  </div>
                  {concept.sourceLessonsApplied.length > 0 && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-[#FF6B35] text-white text-[10px] font-mono uppercase font-bold">
                      Learning Adapted
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold font-heading text-[#20211E] leading-snug">
                      {concept.name}
                    </h3>
                    <p className="text-xs text-[#173D32] font-medium mt-1">
                      {concept.tagline}
                    </p>
                  </div>

                  <p className="text-xs text-[#20211E]/80 leading-relaxed">
                    <strong>Problem solved:</strong> {concept.problemSolved}
                  </p>

                  <div className="space-y-2 text-xs border-t border-[#20211E]/10 pt-3">
                    <div>
                      <span className="text-[#173D32] font-bold block mb-1">
                        Materials from your pile (Available):
                      </span>
                      <ul className="list-disc list-inside text-[#20211E]/80 space-y-0.5">
                        {concept.materialsHave.map((m, i) => (
                          <li key={i}>
                            {m.name} ({m.quantity})
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[#FF6B35] font-bold block mb-1">
                        Additional supplies needed:
                      </span>
                      <ul className="list-disc list-inside text-[#20211E]/80 space-y-0.5">
                        {concept.materialsNeed.map((m, i) => (
                          <li key={i}>
                            {m.name} <span className="text-[#20211E]/60">({m.estimatedCost})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Metadata strip */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#20211E]/70 pt-2 border-t border-[#20211E]/10">
                    <div>
                      <span className="block text-[#20211E]/50">DIFFICULTY</span>
                      <span className="font-bold text-[#20211E] uppercase">{concept.difficulty}</span>
                    </div>
                    <div>
                      <span className="block text-[#20211E]/50">TIME EST.</span>
                      <span className="font-bold text-[#20211E]">{concept.estimatedTimeMinutes} min</span>
                    </div>
                  </div>

                  {/* Limitations callout */}
                  {concept.limitations.length > 0 && (
                    <div className="p-3 bg-[#E8E4DA]/40 border border-[#20211E]/10 text-[11px] text-[#20211E]/80 space-y-1">
                      <span className="font-bold text-[#20211E] block">Known Limitations:</span>
                      <p>{concept.limitations[0]}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-6 pt-0 space-y-2 border-t border-[#20211E]/10 mt-4">
                <button
                  onClick={() => onSelectConcept(concept)}
                  className="w-full py-3 text-xs uppercase tracking-wider font-bold font-heading bg-[#173D32] text-white hover:bg-[#215445] transition-colors flex items-center justify-center gap-2"
                >
                  Open Build Guide
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={(e) => handleSaveClick(concept, e)}
                  className={`w-full py-2 text-xs uppercase tracking-wider font-bold font-heading border transition-colors flex items-center justify-center gap-1.5 ${
                    isSaved
                      ? 'border-[#173D32] bg-[#173D32]/10 text-[#173D32]'
                      : 'border-[#20211E]/20 text-[#20211E] hover:border-[#20211E]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {isSaved ? 'Saved to Projects' : 'Save Concept'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
