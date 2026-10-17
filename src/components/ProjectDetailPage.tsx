/**
 * Project Detail Page (/projects/:id)
 * Full build blueprint with interactive step completion, adaptive redesign modal,
 * and outcome feedback loop recording.
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckSquare,
  Square,
  Wrench,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Bookmark,
  Share2,
  Clock,
  DollarSign,
  Shield,
  Layers,
  Sparkles,
  Camera,
  CheckCircle,
} from 'lucide-react';
import {
  ProjectRecord,
  InventionConcept,
  BuildOutcome,
  LearningLesson,
  InventionConstraint,
  ConstructionDifficulty,
  BudgetTier,
} from '../types';
import { StorageService } from '../services/storage';
import { InventionEngine } from '../services/inventionEngine';

interface ProjectDetailPageProps {
  project: ProjectRecord;
  onUpdateProject: (updated: ProjectRecord) => void;
  onNavigateProjects: () => void;
}

const CONCEPT_IMAGE_MAP: Record<string, string> = {
  cardboard_organizer: '/src/assets/images/concept_cardboard_organizer_1792255110536.jpg',
  reclaimed_planter: '/src/assets/images/concept_reclaimed_planter_1792255110783.jpg',
  packaging_storage: '/src/assets/images/concept_packaging_storage_1792255110822.jpg',
  hero_default: '/src/assets/images/hero_scrapshift_transformation_1792255109387.jpg',
};

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  project,
  onUpdateProject,
  onNavigateProjects,
}) => {
  const [selectedVersionIdx, setSelectedVersionIdx] = useState<number>(
    (project.versions?.length || 1) - 1
  );

  const activeConcept: InventionConcept =
    project.versions && project.versions[selectedVersionIdx]
      ? project.versions[selectedVersionIdx]
      : project.concept;

  // Step completion state
  const [completedSteps, setCompletedSteps] = useState<number[]>(
    project.completedStepIndices || []
  );

  // Modals
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isRedesignModalOpen, setIsRedesignModalOpen] = useState(false);

  // Feedback form state
  const [outcome, setOutcome] = useState<BuildOutcome>('failed');
  const [userObservations, setUserObservations] = useState('');
  const [suggestedAdjustment, setSuggestedAdjustment] = useState('');
  const [outcomePhoto, setOutcomePhoto] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Redesign form state
  const [redesignBudget, setRedesignBudget] = useState<BudgetTier>('zero_cost');
  const [redesignDifficulty, setRedesignDifficulty] = useState<ConstructionDifficulty>('beginner');
  const [redesignTools, setRedesignTools] = useState<string[]>(activeConcept.toolsRequired);
  const [redesignReason, setRedesignReason] = useState('');
  const [adaptationReport, setAdaptationReport] = useState<{
    whatChanged: string;
    constraintCause: string;
    lessonInfluence: string;
  } | null>(null);

  // Toggle step completion
  const handleToggleStep = (stepNumber: number) => {
    let updated: number[];
    if (completedSteps.includes(stepNumber)) {
      updated = completedSteps.filter((s) => s !== stepNumber);
    } else {
      updated = [...completedSteps, stepNumber];
    }
    setCompletedSteps(updated);
    const updatedProject = StorageService.updateProjectProgress(project.id, updated);
    if (updatedProject) onUpdateProject(updatedProject);
  };

  // Submit Feedback & Record Structured Lesson
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userObservations.trim()) return;

    const newLesson: LearningLesson = {
      id: `lesson_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId: project.id,
      projectTitle: activeConcept.name,
      materialsUsed: activeConcept.materialsHave.map((m) => m.name),
      outcome,
      userObservations: userObservations.trim(),
      outcomePhoto: outcomePhoto || undefined,
      relevantConstraints: {
        difficulty: activeConcept.difficulty,
        toolsAvailable: activeConcept.toolsRequired,
        intendedUse: activeConcept.intendedUse,
      },
      suggestedDesignAdjustment:
        suggestedAdjustment.trim() ||
        'Reinforce joinery or switch to alternate material orientation for structural stability.',
      category: activeConcept.name,
      dateRecorded: new Date().toISOString().split('T')[0],
      verifiedResult: false,
    };

    StorageService.saveLesson(newLesson);

    const updatedProjects = StorageService.getProjectById(project.id);
    if (updatedProjects) onUpdateProject(updatedProjects);

    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackSuccess(false);
      setIsFeedbackModalOpen(false);
    }, 1500);
  };

  // Submit Adaptive Redesign
  const handleApplyRedesign = (e: React.FormEvent) => {
    e.preventDefault();

    const { adaptedConcept, changeExplanation } = InventionEngine.adaptDesign(
      activeConcept,
      {
        budget: redesignBudget,
        difficulty: redesignDifficulty,
        availableTools: redesignTools,
      },
      redesignReason
    );

    const updatedProject = StorageService.saveProject(adaptedConcept, 'revised_design');
    onUpdateProject(updatedProject);
    setAdaptationReport(changeExplanation);
    setSelectedVersionIdx((updatedProject.versions?.length || 1) - 1);
  };

  const imageSrc =
    activeConcept.conceptImageKey && CONCEPT_IMAGE_MAP[activeConcept.conceptImageKey]
      ? CONCEPT_IMAGE_MAP[activeConcept.conceptImageKey]
      : CONCEPT_IMAGE_MAP.hero_default;

  const totalSteps = activeConcept.steps?.length || 1;
  const progressPct = Math.round((completedSteps.length / totalSteps) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-10">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#20211E]/10">
        <button
          onClick={onNavigateProjects}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#20211E]/70 hover:text-[#20211E]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Projects Library
        </button>

        <div className="flex items-center gap-3">
          {/* Version Switcher if multiple iterations exist */}
          {project.versions && project.versions.length > 1 && (
            <div className="flex items-center gap-1 p-1 bg-[#E8E4DA] text-xs font-mono">
              <span className="px-2 text-[#20211E]/60">ITERATION:</span>
              {project.versions.map((ver, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedVersionIdx(idx)}
                  className={`px-2 py-1 text-xs font-bold transition-colors ${
                    selectedVersionIdx === idx
                      ? 'bg-[#173D32] text-white'
                      : 'text-[#20211E] hover:bg-[#D4CEBF]'
                  }`}
                >
                  v{ver.version || idx + 1}
                </button>
              ))}
            </div>
          )}

          <span className="text-xs font-mono uppercase px-2.5 py-1 bg-[#20211E] text-white font-bold">
            Status: {project.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Main Blueprint Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#173D32] font-bold uppercase">
            <span>SCRAPSHIFT BLUEPRINT</span>
            <span>·</span>
            <span>VERSION {activeConcept.version || 1}.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-[#20211E] leading-tight">
            {activeConcept.name}
          </h1>
          <p className="text-base sm:text-lg text-[#173D32] font-medium">
            {activeConcept.tagline}
          </p>
          <p className="text-sm text-[#20211E]/80 leading-relaxed">
            <strong>Intended purpose:</strong> {activeConcept.problemSolved}
          </p>
        </div>

        {/* Blueprint Action Dock */}
        <div className="lg:col-span-4 p-5 bg-[#E8E4DA]/40 border border-[#20211E]/15 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#173D32] font-bold block">
            WORKBENCH CONTROLS
          </span>
          <button
            onClick={() => setIsRedesignModalOpen(true)}
            className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider font-heading bg-[#173D32] text-white hover:bg-[#215445] transition-colors flex items-center justify-center gap-2"
          >
            <Sliders className="w-3.5 h-3.5" />
            Improve This Design
          </button>
          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider font-heading bg-[#FF6B35] text-white hover:bg-[#E85A26] transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Record Build Outcome
          </button>
          <p className="text-[11px] text-[#20211E]/60 text-center pt-1">
            Logging physical results trains the continual learning loop.
          </p>
        </div>
      </div>

      {/* Visual & Core Specifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="border border-[#20211E]/15 bg-white p-2">
            <div className="aspect-[4/3] bg-[#E8E4DA] overflow-hidden">
              <img
                src={imageSrc}
                alt={activeConcept.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 bg-[#F7F5EF] border-t border-[#20211E]/10 flex items-center justify-between text-xs font-mono text-[#20211E]/70">
              <span>CONCEPT BLUEPRINT SPECIFICATION</span>
              <span>EST. TIME: {activeConcept.estimatedTimeMinutes} MIN</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          {/* Engineering Specifications Card */}
          <div className="p-6 border border-[#20211E]/15 bg-white space-y-4">
            <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-[#173D32] border-b border-[#20211E]/10 pb-2">
              BUILD SPECIFICATIONS
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#20211E]/50 block">DIFFICULTY</span>
                <span className="font-bold font-heading text-[#20211E] uppercase">
                  {activeConcept.difficulty}
                </span>
              </div>
              <div>
                <span className="text-[#20211E]/50 block">ESTIMATED COST</span>
                <span className="font-bold font-heading text-[#20211E]">
                  {activeConcept.estimatedCostRange}
                </span>
              </div>
              <div>
                <span className="text-[#20211E]/50 block">LOCATION</span>
                <span className="font-bold text-[#20211E]">{activeConcept.intendedUse}</span>
              </div>
              <div>
                <span className="text-[#20211E]/50 block">CONSTRUCTION TIME</span>
                <span className="font-bold text-[#20211E]">{activeConcept.estimatedTimeMinutes} min</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-[#20211E]/75 border-t border-[#20211E]/10">
              <strong>Cost assumptions:</strong> {activeConcept.costAssumptions}
            </div>

            <div className="pt-2 text-xs border-t border-[#20211E]/10">
              <strong className="block text-[#173D32] mb-1">Tools required:</strong>
              <div className="flex flex-wrap gap-1.5">
                {activeConcept.toolsRequired.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-[#E8E4DA] text-[11px] text-[#20211E] font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Safety Considerations Box */}
          <div className="p-5 border border-[#FF6B35]/30 bg-[#FF6B35]/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#FF6B35]">
              <AlertTriangle className="w-4 h-4" />
              <span>SAFETY PRECAUTIONS</span>
            </div>
            <ul className="list-disc list-inside text-xs text-[#20211E]/80 space-y-1">
              {activeConcept.safetyConsiderations.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Materials Inventory Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border border-[#20211E]/15 bg-white space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#20211E]/10">
            <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-[#173D32]">
              Materials On Hand (From Pile)
            </h3>
            <span className="text-xs font-mono text-[#173D32]">AVAILABLE</span>
          </div>
          <ul className="space-y-2 text-xs">
            {activeConcept.materialsHave.map((item, idx) => (
              <li key={idx} className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-[#20211E] block">{item.name}</span>
                  <span className="text-[#20211E]/60 text-[11px]">{item.role}</span>
                </div>
                <span className="font-mono text-[#173D32]">{item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 border border-[#20211E]/15 bg-white space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#20211E]/10">
            <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-[#FF6B35]">
              Additional Items Needed
            </h3>
            <span className="text-xs font-mono text-[#FF6B35]">SUPPLY LIST</span>
          </div>
          <ul className="space-y-2 text-xs">
            {activeConcept.materialsNeed.map((item, idx) => (
              <li key={idx} className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-[#20211E] block">{item.name}</span>
                  <span className="text-[#20211E]/60 text-[11px]">{item.whereToFind}</span>
                </div>
                <span className="font-mono text-[#20211E]/70">{item.estimatedCost}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Construction Instructions with Progress Tracking */}
      <div className="p-6 sm:p-8 border border-[#20211E]/15 bg-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#20211E]/10">
          <div>
            <h3 className="text-lg font-bold font-heading text-[#20211E]">
              Construction Instructions
            </h3>
            <p className="text-xs text-[#20211E]/70 mt-0.5">
              Check off steps as you complete them on your workbench.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 bg-[#E8E4DA] h-2 overflow-hidden">
              <div
                className="bg-[#173D32] h-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-[#173D32]">
              {completedSteps.length} / {totalSteps} ({progressPct}%)
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {activeConcept.steps.map((st) => {
            const isDone = completedSteps.includes(st.stepNumber);
            return (
              <div
                key={st.stepNumber}
                onClick={() => handleToggleStep(st.stepNumber)}
                className={`p-4 border transition-all cursor-pointer flex items-start gap-4 ${
                  isDone
                    ? 'border-[#173D32]/30 bg-[#173D32]/5'
                    : 'border-[#20211E]/15 bg-[#F7F5EF] hover:border-[#20211E]/30'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-[#173D32] shrink-0"
                  aria-label={`Mark step ${st.stepNumber} as ${isDone ? 'incomplete' : 'complete'}`}
                >
                  {isDone ? (
                    <CheckSquare className="w-5 h-5 text-[#173D32]" />
                  ) : (
                    <Square className="w-5 h-5 text-[#20211E]/40" />
                  )}
                </button>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#FF6B35]">
                      STEP 0{st.stepNumber}
                    </span>
                    <h4
                      className={`text-sm font-bold font-heading ${
                        isDone ? 'line-through text-[#20211E]/60' : 'text-[#20211E]'
                      }`}
                    >
                      {st.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#20211E]/80 leading-relaxed">
                    {st.instruction}
                  </p>
                  {st.safetyTip && (
                    <p className="text-[11px] text-[#FF6B35] font-mono pt-1">
                      Caution: {st.safetyTip}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FEEDBACK RECORDING MODAL */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#20211E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F7F5EF] border border-[#20211E] max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#FF6B35] font-bold block mb-1">
                CONTINUAL LEARNING LOOP
              </span>
              <h2 className="text-2xl font-bold font-heading text-[#20211E]">
                Record Build Outcome
              </h2>
              <p className="text-xs text-[#20211E]/75 mt-1">
                Tell SCRAPSHIFT what happened on the workbench. Your report will be saved to your local Learning Journal and will directly influence future recommendations.
              </p>
            </div>

            {feedbackSuccess ? (
              <div className="p-6 bg-[#173D32] text-white text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-[#FF6B35] mx-auto" />
                <h3 className="text-lg font-bold font-heading">Outcome Saved to Journal</h3>
                <p className="text-xs text-white/80">
                  This observation is now active in your persistent learning loop.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#20211E]/80 uppercase mb-1.5 font-bold">
                    PHYSICAL OUTCOME *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'worked', label: 'Worked' },
                      { id: 'partially_worked', label: 'Partially Worked' },
                      { id: 'failed', label: 'Failed' },
                      { id: 'too_expensive', label: 'Too Expensive' },
                      { id: 'missing_materials', label: 'Missing Materials' },
                      { id: 'too_difficult', label: 'Too Difficult' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setOutcome(opt.id as BuildOutcome)}
                        className={`p-2 text-xs font-heading font-medium border text-center transition-all ${
                          outcome === opt.id
                            ? 'border-[#FF6B35] bg-[#FF6B35] text-white font-bold'
                            : 'border-[#20211E]/20 bg-white text-[#20211E] hover:border-[#20211E]/40'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#20211E]/80 uppercase mb-1 font-bold">
                    WHAT HAPPENED? (OBSERVATIONS) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. The phone cradle held for 10 minutes, but bent at the horizontal fold line under the weight of the phone."
                    value={userObservations}
                    onChange={(e) => setUserObservations(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#20211E]/30 bg-white text-[#20211E] focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#20211E]/80 uppercase mb-1 font-bold">
                    SUGGESTED DESIGN ADJUSTMENT
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Align corrugation grain vertically and brace with triangular gussets."
                    value={suggestedAdjustment}
                    onChange={(e) => setSuggestedAdjustment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#20211E]/30 bg-white text-[#20211E] focus:outline-none focus:border-[#FF6B35]"
                  />
                  <span className="text-[11px] text-[#20211E]/60 mt-1 block">
                    What should change when generating a comparable invention later?
                  </span>
                </div>

                <div className="pt-4 border-t border-[#20211E]/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackModalOpen(false)}
                    className="text-xs text-[#20211E]/70 underline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider font-heading bg-[#FF6B35] text-white hover:bg-[#E85A26]"
                  >
                    Save Lesson to Journal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ADAPTIVE REDESIGN MODAL */}
      {isRedesignModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#20211E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F7F5EF] border border-[#20211E] max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#173D32] font-bold block mb-1">
                ADAPTIVE BLUEPRINT SYNTHESIS
              </span>
              <h2 className="text-2xl font-bold font-heading text-[#20211E]">
                Improve This Design
              </h2>
              <p className="text-xs text-[#20211E]/75 mt-1">
                Adjust constraints or missing tools. SCRAPSHIFT will retrieve relevant lessons and generate a versioned redesign linked to this project.
              </p>
            </div>

            {adaptationReport ? (
              <div className="space-y-4">
                <div className="p-4 bg-white border border-[#173D32] space-y-2">
                  <span className="text-xs font-mono uppercase text-[#173D32] font-bold block">
                    REDESIGN APPLIED SUCCESSFULLY
                  </span>
                  <p className="text-xs text-[#20211E]">
                    <strong>What changed:</strong> {adaptationReport.whatChanged}
                  </p>
                  <p className="text-xs text-[#20211E]/80">
                    <strong>Constraint trigger:</strong> {adaptationReport.constraintCause}
                  </p>
                  <p className="text-xs text-[#173D32]">
                    <strong>Lesson influence:</strong> {adaptationReport.lessonInfluence}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAdaptationReport(null);
                    setIsRedesignModalOpen(false);
                  }}
                  className="w-full py-3 text-xs uppercase tracking-wider font-bold font-heading bg-[#173D32] text-white"
                >
                  View Version {activeConcept.version} Blueprint
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyRedesign} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#20211E]/80 uppercase mb-1 font-bold">
                    REASON FOR REDESIGN
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cardboard sagged under phone weight, need stronger bracing"
                    value={redesignReason}
                    onChange={(e) => setRedesignReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#20211E]/30 bg-white text-[#20211E] focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#20211E]/80 uppercase mb-1 font-bold">
                    PREFERRED DIFFICULTY
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['beginner', 'moderate', 'ambitious'] as ConstructionDifficulty[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setRedesignDifficulty(d)}
                        className={`py-2 text-center text-xs font-heading capitalize border transition-all ${
                          redesignDifficulty === d
                            ? 'border-[#173D32] bg-[#173D32] text-white font-bold'
                            : 'border-[#20211E]/20 bg-white text-[#20211E]'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#20211E]/80 uppercase mb-1 font-bold">
                    BUDGET CONSTRAINTS
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'zero_cost', label: 'Zero Cost ($0 only)' },
                      { id: 'under_5', label: 'Under $5 (Glue/Tape)' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setRedesignBudget(b.id as BudgetTier)}
                        className={`p-2 text-center text-xs border transition-all ${
                          redesignBudget === b.id
                            ? 'border-[#173D32] bg-[#173D32] text-white font-bold'
                            : 'border-[#20211E]/20 bg-white text-[#20211E]'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#20211E]/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsRedesignModalOpen(false)}
                    className="text-xs text-[#20211E]/70 underline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider font-heading bg-[#173D32] text-white hover:bg-[#215445]"
                  >
                    Generate Revised Blueprint (v{(activeConcept.version || 1) + 1})
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
