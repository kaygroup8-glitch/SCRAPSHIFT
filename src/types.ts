/**
 * Core domain types for SCRAPSHIFT
 * Build with what you have. Learn from what happens.
 */

export interface MaterialItem {
  id: string;
  name: string;
  category: 'cardboard' | 'plastic' | 'glass' | 'metal' | 'wood' | 'fabric' | 'electronics' | 'other';
  quantity: string;
  condition: 'clean_scrap' | 'used_good' | 'damaged' | 'raw_remnant';
  notes?: string;
  photoUrl?: string; // Local preview only; not transmitted without consent
}

export type ConstructionDifficulty = 'beginner' | 'moderate' | 'ambitious';

export type BudgetTier = 'zero_cost' | 'under_5' | 'under_15' | 'any';

export interface InventionConstraint {
  budget: BudgetTier;
  availableTools: string[];
  difficulty: ConstructionDifficulty;
  intendedUse: string; // e.g. "small apartment desk", "balcony garden", "workshop garage"
  notes?: string;
}

export interface InventionStep {
  stepNumber: number;
  title: string;
  instruction: string;
  safetyTip?: string;
}

export interface MaterialHaveRef {
  name: string;
  quantity: string;
  role: string;
}

export interface MaterialNeedRef {
  name: string;
  estimatedCost: string;
  whereToFind: string;
}

export interface LessonChangeNote {
  lessonId: string;
  originalProblem: string;
  whatChanged: string;
  reason: string;
}

export interface InventionConcept {
  id: string;
  name: string;
  tagline: string;
  problemSolved: string;
  intendedUse: string;
  whyMaterialsSuitable: string;
  materialsHave: MaterialHaveRef[];
  materialsNeed: MaterialNeedRef[];
  toolsRequired: string[];
  difficulty: ConstructionDifficulty;
  estimatedTimeMinutes: number;
  estimatedCostRange: string;
  costAssumptions: string;
  limitations: string[];
  safetyConsiderations: string[];
  steps: InventionStep[];
  conceptImageKey?: string;
  sourceLessonsApplied: LessonChangeNote[];
  version: number;
  parentProjectId?: string;
  createdAt: string;
}

export type BuildOutcome =
  | 'worked'
  | 'partially_worked'
  | 'failed'
  | 'too_expensive'
  | 'missing_materials'
  | 'too_difficult';

export interface LearningLesson {
  id: string;
  projectId: string;
  projectTitle: string;
  materialsUsed: string[];
  outcome: BuildOutcome;
  userObservations: string;
  outcomePhoto?: string;
  relevantConstraints: {
    difficulty?: ConstructionDifficulty;
    toolsAvailable?: string[];
    intendedUse?: string;
  };
  suggestedDesignAdjustment: string;
  category: string;
  dateRecorded: string;
  verifiedResult: false; // Explicitly false: user-reported experience, not physically lab-verified
}

export type ProjectStatus =
  | 'saved_concept'
  | 'in_progress'
  | 'feedback_recorded'
  | 'revised_design';

export interface ProjectRecord {
  id: string;
  name: string;
  concept: InventionConcept;
  status: ProjectStatus;
  completedStepIndices: number[];
  userNotes?: string;
  versions: InventionConcept[];
  createdAt: string;
  updatedAt: string;
}

export interface GenerationInput {
  materials: MaterialItem[];
  goal: string;
  customGoal?: string;
  constraints: InventionConstraint;
  photoBase64?: string;
  photoMimeType?: string;
  triggerReason?: string;
}

