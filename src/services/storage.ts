/**
 * Storage Service for SCRAPSHIFT
 * Manages persistent local browser storage (localStorage) for projects, lessons, and draft state.
 * All data stays local to the user's device unless explicitly submitted for AI synthesis.
 */

import { ProjectRecord, LearningLesson, InventionConcept, MaterialItem, InventionConstraint } from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'scrapshift_projects_v1',
  LESSONS: 'scrapshift_lessons_v1',
  DRAFT_MATERIALS: 'scrapshift_draft_materials_v1',
  DRAFT_GOAL: 'scrapshift_draft_goal_v1',
  DRAFT_CONSTRAINTS: 'scrapshift_draft_constraints_v1',
  CONSENT_GIVEN: 'scrapshift_ai_consent_v1',
  INITIALIZED: 'scrapshift_storage_seeded_v1',
};

// Seed illustrative lessons to demonstrate continual learning immediately
const SEED_LESSONS: LearningLesson[] = [
  {
    id: 'lesson_seed_01',
    projectId: 'demo_phone_stand_seed',
    projectTitle: 'Single-Flute Cardboard Phone Cradle',
    materialsUsed: ['corrugated cardboard', 'masking tape'],
    outcome: 'failed',
    userObservations: 'The phone cradle held for 10 minutes, but slowly sagged and creased at the horizontal fold line under the weight of the smartphone.',
    relevantConstraints: {
      difficulty: 'beginner',
      toolsAvailable: ['scissors', 'ruler'],
      intendedUse: 'desk video calls',
    },
    suggestedDesignAdjustment: 'Align the internal corrugation grain vertically instead of horizontally, and add triangular gusset wedges to brace the main angle against bending.',
    category: 'cardboard desk organizer',
    dateRecorded: '2026-09-12',
    verifiedResult: false,
  },
  {
    id: 'lesson_seed_02',
    projectId: 'demo_planter_seed',
    projectTitle: 'Inverted Glass Jar Herb Reservoir',
    materialsUsed: ['glass jar', 'cotton cord', 'plastic bottle neck'],
    outcome: 'partially_worked',
    userObservations: 'The cotton wick pulled too much water into the soil and saturated the seedling roots because the wick was too thick and lacked a flow restrictor.',
    relevantConstraints: {
      difficulty: 'moderate',
      toolsAvailable: ['box cutter', 'pliers'],
      intendedUse: 'kitchen windowsill',
    },
    suggestedDesignAdjustment: 'Use a single braided 4mm cotton cord rather than double thickness, and loosely knot the top end inside the neck to moderate capillary action.',
    category: 'recycled container planter',
    dateRecorded: '2026-09-28',
    verifiedResult: false,
  },
  {
    id: 'lesson_seed_03',
    projectId: 'demo_drawer_seed',
    projectTitle: 'Cardboard Sliding Hardware Bin',
    materialsUsed: ['packaging cardboard', 'pva glue', 'wooden dowel'],
    outcome: 'worked',
    userObservations: 'Reinforcing the drawer slide track with a thin strip of clear packaging tape eliminated friction and prevented cardboard abrasion.',
    relevantConstraints: {
      difficulty: 'moderate',
      toolsAvailable: ['utility knife', 'glue gun', 'ruler'],
      intendedUse: 'workshop fastener sorting',
    },
    suggestedDesignAdjustment: 'Always line sliding contact channels with slick packaging tape or rub with candle wax to prevent paper-on-paper binding.',
    category: 'storage solution',
    dateRecorded: '2026-10-04',
    verifiedResult: false,
  },
];

export const StorageService = {
  initStorage(): void {
    try {
      const isSeeded = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!isSeeded) {
        const existingLessons = this.getLessons();
        if (existingLessons.length === 0) {
          localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(SEED_LESSONS));
        }
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      }
    } catch {
      // Storage unavailable or quota exceeded; fails gracefully
    }
  },

  // Projects
  getProjects(): ProjectRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  getProjectById(id: string): ProjectRecord | undefined {
    const list = this.getProjects();
    return list.find((p) => p.id === id);
  },

  saveProject(concept: InventionConcept, status: ProjectRecord['status'] = 'saved_concept'): ProjectRecord {
    const projects = this.getProjects();
    const existingIndex = projects.findIndex((p) => p.id === concept.id);

    const now = new Date().toISOString().split('T')[0];

    if (existingIndex >= 0) {
      const existing = projects[existingIndex];
      const updated: ProjectRecord = {
        ...existing,
        name: concept.name,
        concept,
        status,
        updatedAt: now,
        versions: [...(existing.versions || []), concept],
      };
      projects[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      return updated;
    } else {
      const newProject: ProjectRecord = {
        id: concept.id,
        name: concept.name,
        concept,
        status,
        completedStepIndices: [],
        versions: [concept],
        createdAt: now,
        updatedAt: now,
      };
      projects.unshift(newProject);
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      return newProject;
    }
  },

  updateProjectProgress(projectId: string, completedStepIndices: number[], notes?: string): ProjectRecord | null {
    const projects = this.getProjects();
    const project = projects.find((p) => p.id === projectId);
    if (!project) return null;

    project.completedStepIndices = completedStepIndices;
    if (notes !== undefined) project.userNotes = notes;
    if (completedStepIndices.length > 0 && project.status === 'saved_concept') {
      project.status = 'in_progress';
    }
    project.updatedAt = new Date().toISOString().split('T')[0];

    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return project;
  },

  deleteProject(id: string): void {
    const projects = this.getProjects().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  // Lessons
  getLessons(): LearningLesson[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LESSONS);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveLesson(lesson: LearningLesson): void {
    const lessons = this.getLessons();
    const existingIndex = lessons.findIndex((l) => l.id === lesson.id);

    if (existingIndex >= 0) {
      lessons[existingIndex] = lesson;
    } else {
      lessons.unshift(lesson);
    }

    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));

    // Also mark project status as feedback_recorded if project exists
    if (lesson.projectId) {
      const projects = this.getProjects();
      const project = projects.find((p) => p.id === lesson.projectId);
      if (project) {
        project.status = 'feedback_recorded';
        project.updatedAt = new Date().toISOString().split('T')[0];
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
      }
    }
  },

  deleteLesson(id: string): void {
    const lessons = this.getLessons().filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
  },

  // Draft Onboarding State (persists across page reloads in wizard)
  getDraftMaterials(): MaterialItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DRAFT_MATERIALS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveDraftMaterials(materials: MaterialItem[]): void {
    localStorage.setItem(STORAGE_KEYS.DRAFT_MATERIALS, JSON.stringify(materials));
  },

  getDraftGoal(): { goal: string; customGoal: string } {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DRAFT_GOAL);
      return raw ? JSON.parse(raw) : { goal: 'organize_desk', customGoal: '' };
    } catch {
      return { goal: 'organize_desk', customGoal: '' };
    }
  },

  saveDraftGoal(goal: string, customGoal: string): void {
    localStorage.setItem(STORAGE_KEYS.DRAFT_GOAL, JSON.stringify({ goal, customGoal }));
  },

  getDraftConstraints(): InventionConstraint {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DRAFT_CONSTRAINTS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return {
      budget: 'zero_cost',
      availableTools: ['scissors', 'ruler', 'pencil'],
      difficulty: 'beginner',
      intendedUse: 'home desk or tabletop',
      notes: '',
    };
  },

  saveDraftConstraints(constraints: InventionConstraint): void {
    localStorage.setItem(STORAGE_KEYS.DRAFT_CONSTRAINTS, JSON.stringify(constraints));
  },

  // Privacy & Consent
  hasAIConsent(): boolean {
    return localStorage.getItem(STORAGE_KEYS.CONSENT_GIVEN) === 'true';
  },

  setAIConsent(consent: boolean): void {
    localStorage.setItem(STORAGE_KEYS.CONSENT_GIVEN, consent ? 'true' : 'false');
  },

  // Clear all local data with confirmation
  clearAllLocalData(): void {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.LESSONS);
    localStorage.removeItem(STORAGE_KEYS.DRAFT_MATERIALS);
    localStorage.removeItem(STORAGE_KEYS.DRAFT_GOAL);
    localStorage.removeItem(STORAGE_KEYS.DRAFT_CONSTRAINTS);
    localStorage.removeItem(STORAGE_KEYS.CONSENT_GIVEN);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
  },

  // Export data as JSON for user download
  exportAllDataJSON(): string {
    const data = {
      app: 'SCRAPSHIFT',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      projects: this.getProjects(),
      lessons: this.getLessons(),
    };
    return JSON.stringify(data, null, 2);
  },
};
