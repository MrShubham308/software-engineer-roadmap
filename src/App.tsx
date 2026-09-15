import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { RoadmapDetail } from './components/RoadmapDetail';
import { AuthModal } from './components/AuthModal';
import { RoadmapModal } from './components/RoadmapModal';
import { StepModal } from './components/StepModal';
import { TemplatesModal } from './components/TemplatesModal';
import { Roadmap, RoadmapStep, DashboardStats, StepStatus, ResourceLink } from './types';
import { roadmapsApi } from './api/client';
import { Sparkles, Route, ArrowRight, ShieldCheck, CheckCircle2, BookOpen, Layers } from 'lucide-react';

function MainApp() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<'dashboard' | 'detail'>('dashboard');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);

  // Data State
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [currentRoadmap, setCurrentRoadmap] = useState<Roadmap | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(false);

  // Filter and Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('updated-desc');

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<RoadmapStep | null>(null);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  // Load user roadmaps & stats
  const fetchRoadmaps = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingRoadmaps(true);
    try {
      const [fetchedRoadmaps, fetchedStats] = await Promise.all([
        roadmapsApi.getAll({
          search: searchQuery,
          category: selectedCategory,
          status: selectedStatus,
          sort: sortBy
        }),
        roadmapsApi.getStats()
      ]);
      setRoadmaps(fetchedRoadmaps);
      setStats(fetchedStats);

      // Refresh current roadmap if in detail view
      if (selectedRoadmapId) {
        const active = fetchedRoadmaps.find(r => r._id === selectedRoadmapId);
        if (active) {
          setCurrentRoadmap(active);
        } else {
          // If deleted or not found
          const single = await roadmapsApi.getById(selectedRoadmapId).catch(() => null);
          setCurrentRoadmap(single);
        }
      }
    } catch (err) {
      console.error('Failed to fetch roadmaps:', err);
    } finally {
      setIsLoadingRoadmaps(false);
    }
  }, [isAuthenticated, searchQuery, selectedCategory, selectedStatus, sortBy, selectedRoadmapId]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRoadmaps();
    } else {
      setRoadmaps([]);
      setStats(null);
      setCurrentRoadmap(null);
      setCurrentView('dashboard');
    }
  }, [isAuthenticated, fetchRoadmaps]);

  // Load single roadmap when navigating to detail view
  const handleSelectRoadmap = async (id: string) => {
    setSelectedRoadmapId(id);
    try {
      const r = await roadmapsApi.getById(id);
      setCurrentRoadmap(r);
      setCurrentView('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error fetching roadmap details:', err);
    }
  };

  const handleNavigateHome = () => {
    setCurrentView('dashboard');
    setSelectedRoadmapId(null);
    setCurrentRoadmap(null);
    fetchRoadmaps();
  };

  // Roadmap CRUD
  const handleSaveRoadmap = async (roadmapData: any) => {
    if (editingRoadmap) {
      const updated = await roadmapsApi.update(editingRoadmap._id, roadmapData);
      setRoadmaps(prev => prev.map(r => r._id === updated._id ? updated : r));
      if (currentRoadmap && currentRoadmap._id === updated._id) {
        setCurrentRoadmap(updated);
      }
    } else {
      const created = await roadmapsApi.create(roadmapData);
      setRoadmaps(prev => [created, ...prev]);
      handleSelectRoadmap(created._id);
    }
    fetchRoadmaps();
  };

  const handleDeleteRoadmap = async (id: string) => {
    await roadmapsApi.delete(id);
    setRoadmaps(prev => prev.filter(r => r._id !== id));
    if (selectedRoadmapId === id) {
      handleNavigateHome();
    }
    fetchRoadmaps();
  };

  // Step CRUD
  const handleSaveStep = async (stepData: Partial<RoadmapStep>) => {
    if (!currentRoadmap) return;

    if (editingStep) {
      const { roadmap: updatedRoadmap } = await roadmapsApi.updateStep(currentRoadmap._id, editingStep.id, stepData);
      setCurrentRoadmap(updatedRoadmap);
      setRoadmaps(prev => prev.map(r => r._id === updatedRoadmap._id ? updatedRoadmap : r));
    } else {
      const { roadmap: updatedRoadmap } = await roadmapsApi.addStep(currentRoadmap._id, stepData);
      setCurrentRoadmap(updatedRoadmap);
      setRoadmaps(prev => prev.map(r => r._id === updatedRoadmap._id ? updatedRoadmap : r));
    }
    fetchRoadmaps();
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!currentRoadmap) return;
    const { roadmap: updatedRoadmap } = await roadmapsApi.deleteStep(currentRoadmap._id, stepId);
    setCurrentRoadmap(updatedRoadmap);
    setRoadmaps(prev => prev.map(r => r._id === updatedRoadmap._id ? updatedRoadmap : r));
    fetchRoadmaps();
  };

  const handleUpdateStepStatus = async (stepId: string, newStatus: StepStatus) => {
    if (!currentRoadmap) return;
    const { roadmap: updatedRoadmap } = await roadmapsApi.updateStep(currentRoadmap._id, stepId, { status: newStatus });
    setCurrentRoadmap(updatedRoadmap);
    setRoadmaps(prev => prev.map(r => r._id === updatedRoadmap._id ? updatedRoadmap : r));
    fetchRoadmaps();
  };

  const handleReorderSteps = async (orderedIds: string[]) => {
    if (!currentRoadmap) return;
    const { roadmap: updatedRoadmap } = await roadmapsApi.reorderSteps(currentRoadmap._id, orderedIds);
    setCurrentRoadmap(updatedRoadmap);
    setRoadmaps(prev => prev.map(r => r._id === updatedRoadmap._id ? updatedRoadmap : r));
  };

  const handleUpdateStepNotes = async (stepId: string, notes: string) => {
    if (!currentRoadmap) return;
    const { roadmap: updatedRoadmap } = await roadmapsApi.updateStep(currentRoadmap._id, stepId, { notes });
    setCurrentRoadmap(updatedRoadmap);
    setRoadmaps(prev => prev.map(r => r._id === updatedRoadmap._id ? updatedRoadmap : r));
  };

  const handleAddTopicToStep = async (stepId: string, topic: string) => {
    if (!currentRoadmap) return;
    const step = currentRoadmap.steps.find(s => s.id === stepId);
    if (!step) return;
    const updatedTopics = [...(step.topics || []), topic];
    const { roadmap: updatedRoadmap } = await roadmapsApi.updateStep(currentRoadmap._id, stepId, { topics: updatedTopics });
    setCurrentRoadmap(updatedRoadmap);
    setRoadmaps(prev => prev.map(r => r._id === updatedRoadmap._id ? updatedRoadmap : r));
  };

  const handleRemoveTopicFromStep = async (stepId: string, topicToRemove: string) => {
    if (!currentRoadmap) return;
    const step = currentRoadmap.steps.find(s => s.id === stepId);
    if (!step) return;
    const updatedTopics = (step.topics || []).filter(t => t !== topicToRemove);
    const { roadmap: updatedRoadmap } = await roadmapsApi.updateStep(currentRoadmap._id, stepId, { topics: updatedTopics });
    setCurrentRoadmap(updatedRoadmap);
    setRoadmaps(prev => prev.map(r => r._id === updatedRoadmap._id ? updatedRoadmap : r));
  };

  const handleAddResourceToStep = async (stepId: string, resource: ResourceLink) => {
    if (!currentRoadmap) return;
    const step = currentRoadmap.steps.find(s => s.id === stepId);
    if (!step) return;
    const updatedResources = [...(step.resources || []), resource];
    const { roadmap: updatedRoadmap } = await roadmapsApi.updateStep(currentRoadmap._id, stepId, { resources: updatedResources });
    setCurrentRoadmap(updatedRoadmap);
    setRoadmaps(prev => prev.map(r => r._id === updatedRoadmap._id ? updatedRoadmap : r));
  };

  const handleRemoveResourceFromStep = async (stepId: string, resourceId: string) => {
    if (!currentRoadmap) return;
    const step = currentRoadmap.steps.find(s => s.id === stepId);
    if (!step) return;
    const updatedResources = (step.resources || []).filter(r => r.id !== resourceId);
    const { roadmap: updatedRoadmap } = await roadmapsApi.updateStep(currentRoadmap._id, stepId, { resources: updatedResources });
    setCurrentRoadmap(updatedRoadmap);
    setRoadmaps(prev => prev.map(r => r._id === updatedRoadmap._id ? updatedRoadmap : r));
  };

  const handleTemplateCloned = async (clonedId: string) => {
    await fetchRoadmaps();
    handleSelectRoadmap(clonedId);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col text-zinc-900 font-sans antialiased selection:bg-zinc-900 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
        onOpenNewRoadmap={() => {
          setEditingRoadmap(null);
          setIsRoadmapModalOpen(true);
        }}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
        onOpenAuth={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1">
        {authLoading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-zinc-500">Initializing DevRoadmap...</p>
            </div>
          </div>
        ) : !isAuthenticated ? (
          /* Guest Welcome / Sign In Hero */
          <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Full-Stack Engineer Learning Platform • MongoDB & JWT Protected</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                Master Your Software Engineering Journey
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
                Design custom roadmaps, break them down into actionable milestones, record study notes, curate resource links, and track real-time completion progress.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setAuthModalMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center gap-2"
                id="hero-register-btn"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-6 py-3 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 rounded-xl text-sm font-semibold shadow-xs transition-all flex items-center gap-2"
                id="hero-demo-login-btn"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Try Demo Account</span>
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-left">
              <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold">
                  <Route className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">Custom Milestone Steps</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Add, edit, and reorder steps. Mark status as Not Started, In Progress, or Completed with live percentage calculation.
                </p>
              </div>

              <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">Topics & Study Notes</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Attach specific concepts to each step, jot down personal cheat sheets, and save high-yield documentation links.
                </p>
              </div>

              <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">Personalized & Isolated</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Every user account is secured by JWT tokens with MongoDB persistence. Manage multiple roadmaps across Frontend, Backend, DevOps, and more.
                </p>
              </div>
            </div>
          </div>
        ) : currentView === 'detail' && currentRoadmap ? (
          /* Roadmap Detail View */
          <RoadmapDetail
            roadmap={currentRoadmap}
            onBack={handleNavigateHome}
            onEditRoadmap={() => {
              setEditingRoadmap(currentRoadmap);
              setIsRoadmapModalOpen(true);
            }}
            onAddStep={() => {
              setEditingStep(null);
              setIsStepModalOpen(true);
            }}
            onEditStep={(step) => {
              setEditingStep(step);
              setIsStepModalOpen(true);
            }}
            onDeleteStep={handleDeleteStep}
            onUpdateStepStatus={handleUpdateStepStatus}
            onReorderSteps={handleReorderSteps}
            onUpdateStepNotes={handleUpdateStepNotes}
            onAddTopicToStep={handleAddTopicToStep}
            onRemoveTopicFromStep={handleRemoveTopicFromStep}
            onAddResourceToStep={handleAddResourceToStep}
            onRemoveResourceFromStep={handleRemoveResourceFromStep}
          />
        ) : (
          /* Dashboard View */
          <Dashboard
            roadmaps={roadmaps}
            stats={stats}
            onSelectRoadmap={handleSelectRoadmap}
            onOpenNewRoadmap={() => {
              setEditingRoadmap(null);
              setIsRoadmapModalOpen(true);
            }}
            onOpenTemplates={() => setIsTemplatesModalOpen(true)}
            onEditRoadmap={(r) => {
              setEditingRoadmap(r);
              setIsRoadmapModalOpen(true);
            }}
            onDeleteRoadmap={handleDeleteRoadmap}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            sortBy={sortBy}
            setSortBy={setSortBy}
            isLoading={isLoadingRoadmaps}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Route className="w-4 h-4 text-zinc-700" />
            <span className="font-semibold text-zinc-800">DevRoadmap</span>
            <span>— Full-Stack Software Engineer Career & Skill Tracker</span>
          </div>
          <p>
            React • Express • MongoDB • JWT • Axios
          </p>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
      />

      <RoadmapModal
        isOpen={isRoadmapModalOpen}
        onClose={() => {
          setIsRoadmapModalOpen(false);
          setEditingRoadmap(null);
        }}
        onSubmit={handleSaveRoadmap}
        initialData={editingRoadmap}
      />

      <StepModal
        isOpen={isStepModalOpen}
        onClose={() => {
          setIsStepModalOpen(false);
          setEditingStep(null);
        }}
        onSubmit={handleSaveStep}
        initialData={editingStep}
        stepNumber={
          editingStep
            ? (currentRoadmap?.steps.findIndex(s => s.id === editingStep.id) ?? 0) + 1
            : (currentRoadmap?.steps.length ?? 0) + 1
        }
      />

      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onTemplateCloned={handleTemplateCloned}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
