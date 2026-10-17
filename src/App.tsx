/**
 * SCRAPSHIFT Main Application
 * TAGLINE: Build with what you have. Learn from what happens.
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { CreateWizard } from './components/CreateWizard';
import { StudioPage } from './components/StudioPage';
import { ProjectsPage } from './components/ProjectsPage';
import { ProjectDetailPage } from './components/ProjectDetailPage';
import { LearningJournalPage } from './components/LearningJournalPage';
import { PrivacyPage } from './components/PrivacyPage';
import { DemoWorkflowModal } from './components/DemoWorkflowModal';

import {
  ProjectRecord,
  LearningLesson,
  InventionConcept,
  MaterialItem,
  InventionConstraint,
  LessonChangeNote,
} from './types';
import { StorageService } from './services/storage';
import { InventionEngine } from './services/inventionEngine';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [lessons, setLessons] = useState<LearningLesson[]>([]);

  // Studio state
  const [generatedConcepts, setGeneratedConcepts] = useState<InventionConcept[]>([]);
  const [sourceLessonsApplied, setSourceLessonsApplied] = useState<LessonChangeNote[]>([]);
  const [engineSource, setEngineSource] = useState<'gemini' | 'deterministic'>('deterministic');
  const [learningNotes, setLearningNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Demo modal state
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // Initialize storage and load records
  useEffect(() => {
    StorageService.initStorage();
    setProjects(StorageService.getProjects());
    setLessons(StorageService.getLessons());

    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Client-side router navigation
  const navigate = (path: string) => {
    if (path.startsWith('/#')) {
      const anchorId = path.replace('/#', '');
      if (currentPath !== '/') {
        window.history.pushState({}, '', '/');
        setCurrentPath('/');
        setTimeout(() => {
          const el = document.getElementById(anchorId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generation trigger from /create wizard
  const handleGenerateInventions = async (
    materials: MaterialItem[],
    goal: string,
    customGoal: string,
    constraints: InventionConstraint,
    photoBase64?: string
  ) => {
    setIsGenerating(true);
    navigate('/studio');

    try {
      const result = await InventionEngine.generateConcepts({
        materials,
        goal,
        customGoal,
        constraints,
        photoBase64,
      });

      setGeneratedConcepts(result.concepts);
      setSourceLessonsApplied(result.sourceLessons);
      setEngineSource(result.engineSource);
      setLearningNotes(result.learningNotes);

    } catch {
      // Deterministic fallback
      const fallbackConcepts = InventionEngine.synthesizeDeterministic(
        materials,
        goal,
        customGoal,
        constraints,
        [],
        []
      );
      setGeneratedConcepts(fallbackConcepts);
      setEngineSource('deterministic');
    } finally {
      setIsGenerating(false);
    }
  };

  // Concept selection -> Save & open project detail
  const handleSelectConcept = (concept: InventionConcept) => {
    const saved = StorageService.saveProject(concept, 'saved_concept');
    setProjects(StorageService.getProjects());
    navigate(`/projects/${saved.id}`);
  };

  const handleSaveConceptOnly = (concept: InventionConcept) => {
    StorageService.saveProject(concept, 'saved_concept');
    setProjects(StorageService.getProjects());
  };

  // Project progress update
  const handleUpdateProject = (updated: ProjectRecord) => {
    const all = StorageService.getProjects();
    setProjects(all);
  };

  const handleDeleteProject = (id: string) => {
    StorageService.deleteProject(id);
    setProjects(StorageService.getProjects());
  };

  // Learning Journal updates
  const handleUpdateLesson = (updated: LearningLesson) => {
    setLessons(StorageService.getLessons());
  };

  const handleDeleteLesson = (id: string) => {
    setLessons(StorageService.getLessons());
  };

  // Clear data handler
  const handleDataCleared = () => {
    setProjects([]);
    setLessons([]);
    setGeneratedConcepts([]);
    navigate('/');
  };

  // Route matching logic
  const renderCurrentView = () => {
    if (currentPath === '/') {
      return (
        <LandingPage
          navigate={navigate}
          onOpenDemo={() => setIsDemoOpen(true)}
        />
      );
    }

    if (currentPath === '/create') {
      return (
        <CreateWizard
          navigate={navigate}
          onGenerate={handleGenerateInventions}
        />
      );
    }

    if (currentPath === '/studio') {
      return (
        <StudioPage
          concepts={generatedConcepts}
          sourceLessons={sourceLessonsApplied}
          engineSource={engineSource}
          learningNotes={learningNotes}
          isLoading={isGenerating}
          onSelectConcept={handleSelectConcept}
          onSaveConcept={handleSaveConceptOnly}
          onBackToCreate={() => navigate('/create')}
          onTriggerDemo={() => setIsDemoOpen(true)}
        />
      );
    }

    if (currentPath === '/projects') {
      return (
        <ProjectsPage
          projects={projects}
          onOpenProject={(id) => navigate(`/projects/${id}`)}
          onDeleteProject={handleDeleteProject}
          onNavigateCreate={() => navigate('/create')}
        />
      );
    }

    if (currentPath.startsWith('/projects/')) {
      const projectId = currentPath.replace('/projects/', '');
      const project = projects.find((p) => p.id === projectId) || StorageService.getProjectById(projectId);

      if (!project) {
        return (
          <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
            <h2 className="text-2xl font-bold font-heading text-[#20211E]">
              Project Blueprint Not Found
            </h2>
            <p className="text-xs text-[#20211E]/70">
              The requested project may have been removed or cleared from local storage.
            </p>
            <button
              onClick={() => navigate('/projects')}
              className="px-6 py-2.5 text-xs font-bold font-heading bg-[#173D32] text-white"
            >
              Return to Saved Projects
            </button>
          </div>
        );
      }

      return (
        <ProjectDetailPage
          project={project}
          onUpdateProject={handleUpdateProject}
          onNavigateProjects={() => navigate('/projects')}
        />
      );
    }

    if (currentPath === '/learning') {
      return (
        <LearningJournalPage
          lessons={lessons}
          onUpdateLesson={handleUpdateLesson}
          onDeleteLesson={handleDeleteLesson}
          onNavigateCreate={() => navigate('/create')}
        />
      );
    }

    if (currentPath === '/privacy') {
      return <PrivacyPage onDataCleared={handleDataCleared} />;
    }

    // Default 404 fallback
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold font-heading text-[#20211E]">
          Page Not Found
        </h2>
        <p className="text-xs text-[#20211E]/70">
          The requested URL does not match an active SCRAPSHIFT route.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 text-xs font-bold font-heading bg-[#FF6B35] text-white"
        >
          Return Home
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5EF] text-[#20211E] paper-texture">
      <Navbar currentPath={currentPath} navigate={navigate} />

      <main className="flex-1">{renderCurrentView()}</main>

      <Footer
        navigate={navigate}
        onClearDataClick={() => navigate('/privacy')}
      />

      {/* 7-Step Continual Learning Demo Modal */}
      <DemoWorkflowModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onOpenProject={(id) => {
          setProjects(StorageService.getProjects());
          setLessons(StorageService.getLessons());
          navigate(`/projects/${id}`);
        }}
        onOpenLearningJournal={() => {
          setLessons(StorageService.getLessons());
          navigate('/learning');
        }}
      />
    </div>
  );
}
