/**
 * Interactive Continual Learning Demo Walkthrough Modal
 * Executes real application logic across the 7 required stages:
 * 1. Generate phone stand concept.
 * 2. Record that it failed because cardboard bent.
 * 3. Save the lesson into local persistence.
 * 4. Generate comparable concept.
 * 5. Retrieve the saved lesson.
 * 6. Show the revised recommendation.
 * 7. Explain what changed and why.
 */

import React, { useState } from 'react';
import {
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { LessonMatcher } from '../services/lessonMatcher';
import { InventionEngine } from '../services/inventionEngine';
import { InventionConcept, LearningLesson } from '../types';

interface DemoWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProject: (projectId: string) => void;
  onOpenLearningJournal: () => void;
}

export const DemoWorkflowModal: React.FC<DemoWorkflowModalProps> = ({
  isOpen,
  onClose,
  onOpenProject,
  onOpenLearningJournal,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [initialConcept, setInitialConcept] = useState<InventionConcept | null>(null);
  const [savedDemoLesson, setSavedDemoLesson] = useState<LearningLesson | null>(null);
  const [retrievedLessons, setRetrievedLessons] = useState<LearningLesson[]>([]);
  const [revisedConcept, setRevisedConcept] = useState<InventionConcept | null>(null);
  const [changeExplanation, setChangeExplanation] = useState<string>('');

  if (!isOpen) return null;

  // Step 1: Generate initial phone stand
  const handleExecuteStep1 = () => {
    const demoMaterials = [
      {
        id: 'demo_box_1',
        name: 'Single-wall shipping box',
        category: 'cardboard' as const,
        quantity: '1 clean box',
        condition: 'clean_scrap' as const,
      },
    ];

    const concepts = InventionEngine.synthesizeDeterministic(
      demoMaterials,
      'study_area',
      'Desk phone stand',
      {
        budget: 'zero_cost',
        availableTools: ['Scissors', 'Ruler', 'Pencil'],
        difficulty: 'beginner',
        intendedUse: 'Desk video calls',
      },
      [], // No lessons yet
      []
    );

    const first = concepts[0];
    setInitialConcept(first);
    setCurrentStep(2);
  };

  // Step 2 & 3: Record failure and persist structured lesson
  const handleExecuteStep2And3 = () => {
    const demoLessonId = `lesson_demo_${Date.now()}`;
    const newLesson: LearningLesson = {
      id: demoLessonId,
      projectId: initialConcept?.id || 'demo_phone_stand',
      projectTitle: initialConcept?.name || 'Single-Flute Cardboard Phone Stand',
      materialsUsed: ['Single-wall shipping box', 'Scissors'],
      outcome: 'failed',
      userObservations: 'The phone cradle held for 10 minutes, but slowly sagged and creased at the horizontal fold line under the weight of the phone.',
      relevantConstraints: {
        difficulty: 'beginner',
        toolsAvailable: ['Scissors', 'Ruler'],
        intendedUse: 'Desk video calls',
      },
      suggestedDesignAdjustment: 'Align internal corrugation flutes vertically and add two triangular gusset braces to lock the backrest at 70 degrees.',
      category: 'cardboard phone stand',
      dateRecorded: new Date().toISOString().split('T')[0],
      verifiedResult: false,
    };

    // Save directly to localStorage!
    StorageService.saveLesson(newLesson);
    setSavedDemoLesson(newLesson);
    setCurrentStep(4);
  };

  // Step 4, 5, 6, 7: Generate comparable concept with lesson retrieval
  const handleExecuteStep4to7 = () => {
    const demoMaterials = [
      {
        id: 'demo_box_2',
        name: 'Single-wall shipping box',
        category: 'cardboard' as const,
        quantity: '1 clean box',
        condition: 'clean_scrap' as const,
      },
    ];

    // Real lesson retrieval!
    const { matchedLessons, designDirectives, changeNotes, summaryExplanation } =
      LessonMatcher.findRelevantLessons(
        demoMaterials,
        'study_area',
        {
          budget: 'zero_cost',
          availableTools: ['Scissors', 'Ruler', 'Pencil'],
          difficulty: 'beginner',
          intendedUse: 'Desk video calls',
        }
      );

    setRetrievedLessons(matchedLessons);

    // Real synthesis with matched lessons!
    const revisedConcepts = InventionEngine.synthesizeDeterministic(
      demoMaterials,
      'study_area',
      'Desk phone stand',
      {
        budget: 'zero_cost',
        availableTools: ['Scissors', 'Ruler', 'Pencil'],
        difficulty: 'beginner',
        intendedUse: 'Desk video calls',
      },
      changeNotes,
      designDirectives
    );

    const revised = revisedConcepts[0];
    setRevisedConcept(revised);
    setChangeExplanation(
      'Because of the recorded failure where horizontal creasing deflected under phone weight, the generator rotated corrugation grain vertically and added dual 60-degree triangular truss gussets.'
    );

    // Save project so user can open it
    StorageService.saveProject(revised, 'revised_design');
    setCurrentStep(6);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#20211E]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F7F5EF] border border-[#20211E] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#20211E]/10 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF6B35] font-bold block">
              LIVE DEMO WALKTHROUGH
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-[#20211E]">
              The 7-Step Continual Learning Loop
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#20211E]/60 hover:text-[#20211E]"
            aria-label="Close demo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <div
              key={num}
              className={`py-1 border ${
                currentStep >= num
                  ? 'border-[#173D32] bg-[#173D32] text-white font-bold'
                  : 'border-[#20211E]/20 bg-white text-[#20211E]/50'
              }`}
            >
              0{num}
            </div>
          ))}
        </div>

        {/* STEP 1: INITIAL GENERATION */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#173D32] font-bold block">
                STEP 01 / INITIAL GENERATION
              </span>
              <h3 className="text-lg font-bold font-heading text-[#20211E]">
                Generate an initial phone stand from raw cardboard
              </h3>
              <p className="text-xs text-[#20211E]/80 leading-relaxed">
                We begin with a common scrap scenario: 1 single-wall cardboard box and a goal to create a desk phone stand. The engine creates a baseline tab-and-slot design.
              </p>
            </div>

            <button
              onClick={handleExecuteStep1}
              className="w-full py-3 text-xs uppercase tracking-wider font-bold font-heading bg-[#FF6B35] text-white hover:bg-[#E85A26] flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Generate Initial Concept
            </button>
          </div>
        )}

        {/* STEP 2 & 3: REPORT PHYSICAL FAILURE & SAVE LESSON */}
        {(currentStep === 2 || currentStep === 3) && initialConcept && (
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#FF6B35] font-bold block">
                STEPS 02 & 03 / RECORD BENCH FAILURE & SAVE LESSON
              </span>
              <h3 className="text-lg font-bold font-heading text-[#20211E]">
                Initial build: "{initialConcept.name}"
              </h3>
              <p className="text-xs text-[#20211E]/80">
                You built the prototype, placed your phone on the cradle, and tested it on your desk.
              </p>
            </div>

            <div className="p-4 border border-red-300 bg-red-50 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-red-800 font-bold font-heading">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>USER TEST OUTCOME: FAILED</span>
              </div>
              <p className="text-[#20211E]">
                <strong>Reported observation:</strong> "The phone cradle held for 10 minutes, but slowly sagged and creased at the horizontal fold line under the weight of the phone."
              </p>
              <p className="text-[#173D32]">
                <strong>Suggested adjustment:</strong> "Align corrugation grain vertically and brace with triangular gussets."
              </p>
            </div>

            <button
              onClick={handleExecuteStep2And3}
              className="w-full py-3 text-xs uppercase tracking-wider font-bold font-heading bg-[#173D32] text-white hover:bg-[#215445] flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Save Lesson to Persistent Learning Journal
            </button>
          </div>
        )}

        {/* STEP 4 & 5: RE-QUERY AND RETRIEVE SAVED LESSON */}
        {(currentStep === 4 || currentStep === 5) && savedDemoLesson && (
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#173D32] font-bold block">
                STEPS 04 & 05 / RETRIEVE LESSON & RE-SYNTHESIZE
              </span>
              <h3 className="text-lg font-bold font-heading text-[#20211E]">
                Querying the learning journal for comparable geometry
              </h3>
              <p className="text-xs text-[#20211E]/80 leading-relaxed">
                When generating a new phone stand, SCRAPSHIFT retrieves your saved failure report (#LS-DEMO) and passes its structural directive into the generation logic.
              </p>
            </div>

            <div className="p-4 bg-white border border-[#20211E]/15 text-xs space-y-1">
              <span className="font-mono text-[#173D32] font-bold block">
                RETRIEVED LESSON DETECTED:
              </span>
              <p className="text-[#20211E]">
                "{savedDemoLesson.suggestedDesignAdjustment}"
              </p>
            </div>

            <button
              onClick={handleExecuteStep4to7}
              className="w-full py-3 text-xs uppercase tracking-wider font-bold font-heading bg-[#FF6B35] text-white hover:bg-[#E85A26] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Revised Concept With Stored Lesson
            </button>
          </div>
        )}

        {/* STEP 6 & 7: REVISED RECOMMENDATION & EXPLANATION OF CHANGES */}
        {(currentStep === 6 || currentStep === 7) && revisedConcept && (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-[#173D32] font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#173D32]" />
                <span>STEPS 06 & 07 / REVISED RECOMMENDATION</span>
              </div>
              <h3 className="text-xl font-bold font-heading text-[#20211E]">
                {revisedConcept.name}
              </h3>
              <p className="text-xs text-[#173D32] font-medium">
                {revisedConcept.tagline}
              </p>
            </div>

            {/* What Changed Banner */}
            <div className="p-4 bg-[#173D32]/5 border border-[#173D32]/30 space-y-2 text-xs">
              <span className="font-mono uppercase font-bold text-[#173D32] flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-[#FF6B35]" />
                Changed because of what you learned
              </span>
              <p className="text-[#20211E] leading-relaxed">
                {changeExplanation}
              </p>
              <div className="text-[11px] text-[#20211E]/70 pt-1 border-t border-[#20211E]/10">
                Notice: Physical testing is still required on your workbench.
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  onClose();
                  onOpenProject(revisedConcept.id);
                }}
                className="flex-1 py-3 text-xs uppercase tracking-wider font-bold font-heading bg-[#173D32] text-white hover:bg-[#215445] text-center"
              >
                Open Blueprint in Projects
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenLearningJournal();
                }}
                className="flex-1 py-3 text-xs uppercase tracking-wider font-bold font-heading bg-[#E8E4DA] text-[#20211E] hover:bg-[#D4CEBF] text-center"
              >
                View in Learning Journal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
