import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  Circle, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Link as LinkIcon, 
  BookOpen, 
  ExternalLink, 
  Calendar, 
  Tag, 
  FileText, 
  Save, 
  Check, 
  Search,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Roadmap, RoadmapStep, StepStatus, ResourceLink } from '../types';

interface RoadmapDetailProps {
  roadmap: Roadmap;
  onBack: () => void;
  onEditRoadmap: () => void;
  onAddStep: () => void;
  onEditStep: (step: RoadmapStep) => void;
  onDeleteStep: (stepId: string) => void;
  onUpdateStepStatus: (stepId: string, newStatus: StepStatus) => Promise<void>;
  onReorderSteps: (orderedIds: string[]) => Promise<void>;
  onUpdateStepNotes: (stepId: string, notes: string) => Promise<void>;
  onAddTopicToStep: (stepId: string, topic: string) => Promise<void>;
  onRemoveTopicFromStep: (stepId: string, topic: string) => Promise<void>;
  onAddResourceToStep: (stepId: string, resource: ResourceLink) => Promise<void>;
  onRemoveResourceFromStep: (stepId: string, resourceId: string) => Promise<void>;
}

export const RoadmapDetail: React.FC<RoadmapDetailProps> = ({
  roadmap,
  onBack,
  onEditRoadmap,
  onAddStep,
  onEditStep,
  onDeleteStep,
  onUpdateStepStatus,
  onReorderSteps,
  onUpdateStepNotes,
  onAddTopicToStep,
  onRemoveTopicFromStep,
  onAddResourceToStep,
  onRemoveResourceFromStep
}) => {
  const [stepSearch, setStepSearch] = useState('');
  const [stepStatusFilter, setStepStatusFilter] = useState<'all' | StepStatus>('all');
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});
  const [savedNotesTick, setSavedNotesTick] = useState<Record<string, boolean>>({});
  const [addingTopicStepId, setAddingTopicStepId] = useState<string | null>(null);
  const [newTopicText, setNewTopicText] = useState('');
  const [addingResourceStepId, setAddingResourceStepId] = useState<string | null>(null);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');
  const [newResType, setNewResType] = useState<ResourceLink['type']>('doc');

  const steps = roadmap.steps || [];
  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const inProgressSteps = steps.filter(s => s.status === 'in_progress').length;
  const notStartedSteps = steps.filter(s => s.status === 'not_started').length;
  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const totalEstimatedHours = steps.reduce((acc, s) => acc + (s.estimatedHours || 0), 0);

  // Filtered steps
  const filteredSteps = steps.filter(step => {
    if (stepStatusFilter !== 'all' && step.status !== stepStatusFilter) return false;
    if (stepSearch.trim()) {
      const q = stepSearch.toLowerCase();
      const titleMatch = step.title.toLowerCase().includes(q);
      const descMatch = step.description?.toLowerCase().includes(q);
      const notesMatch = step.notes?.toLowerCase().includes(q);
      const topicMatch = step.topics?.some(t => t.toLowerCase().includes(q));
      return titleMatch || descMatch || notesMatch || topicMatch;
    }
    return true;
  });

  const handleMoveStep = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newOrderedSteps = [...steps];
    const temp = newOrderedSteps[index];
    newOrderedSteps[index] = newOrderedSteps[targetIndex];
    newOrderedSteps[targetIndex] = temp;

    const orderedIds = newOrderedSteps.map(s => s.id);
    await onReorderSteps(orderedIds);
  };

  const handleCycleStatus = async (step: RoadmapStep) => {
    const order: StepStatus[] = ['not_started', 'in_progress', 'completed'];
    const currentIndex = order.indexOf(step.status);
    const nextStatus = order[(currentIndex + 1) % order.length];
    await onUpdateStepStatus(step.id, nextStatus);
  };

  const handleSaveNotes = async (stepId: string) => {
    const currentNotes = editingNotes[stepId] !== undefined ? editingNotes[stepId] : (steps.find(s => s.id === stepId)?.notes || '');
    setSavingNotes(prev => ({ ...prev, [stepId]: true }));
    await onUpdateStepNotes(stepId, currentNotes);
    setSavingNotes(prev => ({ ...prev, [stepId]: false }));
    setSavedNotesTick(prev => ({ ...prev, [stepId]: true }));
    setTimeout(() => {
      setSavedNotesTick(prev => ({ ...prev, [stepId]: false }));
    }, 2000);
  };

  const handleAddTopic = async (stepId: string) => {
    if (!newTopicText.trim()) return;
    await onAddTopicToStep(stepId, newTopicText.trim());
    setNewTopicText('');
    setAddingTopicStepId(null);
  };

  const handleAddResource = async (stepId: string) => {
    if (!newResTitle.trim() || !newResUrl.trim()) return;
    let url = newResUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    const newRes: ResourceLink = {
      id: `res_${Date.now()}`,
      title: newResTitle.trim(),
      url,
      type: newResType
    };
    await onAddResourceToStep(stepId, newRes);
    setNewResTitle('');
    setNewResUrl('');
    setAddingResourceStepId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
          id="roadmap-back-to-dashboard-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Roadmap Header Card */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white">
                {roadmap.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                {roadmap.level}
              </span>
              {roadmap.targetDate && (
                <span className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-50 border border-zinc-200/80 px-2.5 py-0.5 rounded-md">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Target: {roadmap.targetDate}</span>
                </span>
              )}
              {totalEstimatedHours > 0 && (
                <span className="flex items-center gap-1 text-xs text-zinc-500 bg-zinc-50 border border-zinc-200/80 px-2.5 py-0.5 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>~{totalEstimatedHours} Study Hours</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              {roadmap.title}
            </h1>

            {roadmap.description && (
              <p className="text-sm text-zinc-600 max-w-3xl leading-relaxed">
                {roadmap.description}
              </p>
            )}

            {roadmap.tags && roadmap.tags.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-1.5">
                {roadmap.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-50 border border-zinc-200 text-zinc-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Progress Overview Block */}
          <div className="lg:w-72 bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Overall Progress</span>
              <span className={`text-xl font-bold ${progressPct === 100 ? 'text-emerald-600' : 'text-zinc-900'}`}>
                {progressPct}%
              </span>
            </div>

            <div className="w-full bg-zinc-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  progressPct === 100 ? 'bg-emerald-500' : 'bg-zinc-900'
                }`}
                style={{ width: `${Math.min(100, progressPct)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
              <div className="p-1.5 bg-white rounded-lg border border-zinc-200/60">
                <span className="block font-bold text-emerald-600">{completedSteps}</span>
                <span className="text-[10px] text-zinc-500">Completed</span>
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-zinc-200/60">
                <span className="block font-bold text-amber-600">{inProgressSteps}</span>
                <span className="text-[10px] text-zinc-500">In Progress</span>
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-zinc-200/60">
                <span className="block font-bold text-zinc-500">{notStartedSteps}</span>
                <span className="text-[10px] text-zinc-500">Not Started</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={onEditRoadmap}
                className="flex-1 py-1.5 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors flex items-center justify-center gap-1"
                id="roadmap-edit-details-btn"
              >
                <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Edit Info</span>
              </button>
              <button
                onClick={onAddStep}
                className="flex-1 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1"
                id="roadmap-add-step-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Steps List Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-zinc-900">Roadmap Milestones & Steps</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
            {filteredSteps.length} of {totalSteps}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Step Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={stepSearch}
              onChange={(e) => setStepSearch(e.target.value)}
              placeholder="Search steps & topics..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={stepStatusFilter}
            onChange={(e) => setStepStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-zinc-200 rounded-xl text-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
          >
            <option value="all">All Steps</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="not_started">Not Started</option>
          </select>

          <button
            onClick={onAddStep}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Step</span>
          </button>
        </div>
      </div>

      {/* Steps Timeline Display */}
      {steps.length === 0 ? (
        <div className="p-12 text-center bg-white border border-zinc-200 rounded-2xl shadow-2xs">
          <Layers className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-900">No steps in this roadmap yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-5">
            Break down this engineering skill track into structured learning milestones.
          </p>
          <button
            onClick={onAddStep}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Step</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSteps.map((step, index) => {
            const actualIndex = steps.findIndex(s => s.id === step.id);
            const isNotesExpanded = expandedNotes[step.id] ?? false;
            const currentNotesVal = editingNotes[step.id] !== undefined ? editingNotes[step.id] : (step.notes || '');

            return (
              <div
                key={step.id}
                className={`bg-white border rounded-2xl p-5 sm:p-6 transition-all shadow-2xs ${
                  step.status === 'completed'
                    ? 'border-emerald-200/80 bg-emerald-50/10'
                    : step.status === 'in_progress'
                    ? 'border-amber-200/80 bg-amber-50/10'
                    : 'border-zinc-200'
                }`}
                id={`roadmap-step-${step.id}`}
              >
                {/* Step Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* Step Number Badge */}
                    <span className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {actualIndex + 1}
                    </span>

                    {/* Step Title & Status */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-zinc-900">
                          {step.title}
                        </h3>

                        {/* Status Pill with 1-click cycle button */}
                        <button
                          onClick={() => handleCycleStatus(step)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                            step.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : step.status === 'in_progress'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                          }`}
                          title="Click to toggle status (Not Started -> In Progress -> Completed)"
                          id={`step-status-toggle-${step.id}`}
                        >
                          {step.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {step.status === 'in_progress' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                          {step.status === 'not_started' && <Circle className="w-3.5 h-3.5 text-zinc-400" />}
                          <span className="capitalize">{step.status.replace('_', ' ')}</span>
                        </button>

                        {step.estimatedHours ? (
                          <span className="text-xs text-zinc-400 font-medium">
                            • ~{step.estimatedHours} hrs
                          </span>
                        ) : null}
                      </div>

                      {step.description && (
                        <p className="text-xs text-zinc-600 leading-relaxed max-w-2xl">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Reordering buttons */}
                  <div className="flex items-center gap-1 sm:self-start self-end shrink-0">
                    {/* Move Up */}
                    <button
                      onClick={() => handleMoveStep(actualIndex, 'up')}
                      disabled={actualIndex === 0}
                      className="p-1.5 text-zinc-400 hover:text-zinc-800 disabled:opacity-20 hover:bg-zinc-100 rounded-lg transition-colors"
                      title="Move Step Up"
                      id={`step-move-up-${step.id}`}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={() => handleMoveStep(actualIndex, 'down')}
                      disabled={actualIndex === steps.length - 1}
                      className="p-1.5 text-zinc-400 hover:text-zinc-800 disabled:opacity-20 hover:bg-zinc-100 rounded-lg transition-colors"
                      title="Move Step Down"
                      id={`step-move-down-${step.id}`}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-zinc-200 mx-1" />

                    {/* Edit Step */}
                    <button
                      onClick={() => onEditStep(step)}
                      className="p-1.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit Step Details"
                      id={`step-edit-btn-${step.id}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Step */}
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${step.title}" from this roadmap?`)) {
                          onDeleteStep(step.id);
                        }
                      }}
                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Step"
                      id={`step-delete-btn-${step.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Topics Section */}
                <div className="mt-4 pt-3 border-t border-zinc-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Concepts & Topics ({step.topics?.length || 0})
                    </span>
                    {addingTopicStepId !== step.id && (
                      <button
                        onClick={() => {
                          setAddingTopicStepId(step.id);
                          setNewTopicText('');
                        }}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Topic</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {step.topics && step.topics.length > 0 ? (
                      step.topics.map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200/80 text-xs font-medium text-zinc-700 group/chip"
                        >
                          <span>{t}</span>
                          <button
                            onClick={() => onRemoveTopicFromStep(step.id, t)}
                            className="text-zinc-400 hover:text-red-600 ml-0.5 opacity-60 group-hover/chip:opacity-100 transition-opacity"
                            title="Remove topic"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400 italic">No topics listed yet.</span>
                    )}

                    {/* Inline Add Topic Box */}
                    {addingTopicStepId === step.id && (
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          autoFocus
                          value={newTopicText}
                          onChange={(e) => setNewTopicText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTopic(step.id);
                            } else if (e.key === 'Escape') {
                              setAddingTopicStepId(null);
                            }
                          }}
                          placeholder="e.g. Async Await"
                          className="px-2 py-1 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-zinc-900 text-zinc-800"
                        />
                        <button
                          onClick={() => handleAddTopic(step.id)}
                          className="px-2 py-1 bg-zinc-900 text-white rounded-lg text-xs font-semibold"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setAddingTopicStepId(null)}
                          className="px-1.5 py-1 text-zinc-500 hover:text-zinc-700 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resource Links Section */}
                <div className="mt-4 pt-3 border-t border-zinc-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Study Materials & Resources ({step.resources?.length || 0})
                    </span>
                    {addingResourceStepId !== step.id && (
                      <button
                        onClick={() => {
                          setAddingResourceStepId(step.id);
                          setNewResTitle('');
                          setNewResUrl('');
                        }}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Link</span>
                      </button>
                    )}
                  </div>

                  {step.resources && step.resources.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {step.resources.map((res) => (
                        <div
                          key={res.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 hover:bg-zinc-100/70 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2 overflow-hidden mr-2">
                            <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-zinc-200 text-zinc-700 shrink-0">
                              {res.type}
                            </span>
                            <span className="font-semibold text-zinc-800 truncate">{res.title}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-zinc-400 hover:text-indigo-600"
                              title="Open link in new tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => onRemoveResourceFromStep(step.id, res.id)}
                              className="p-1 text-zinc-400 hover:text-red-600"
                              title="Delete resource"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic">No resources attached yet.</p>
                  )}

                  {/* Add Resource Inline Form */}
                  {addingResourceStepId === step.id && (
                    <div className="mt-2.5 p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Title (e.g. Official Docs)"
                          value={newResTitle}
                          onChange={(e) => setNewResTitle(e.target.value)}
                          className="sm:col-span-2 px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900"
                        />
                        <select
                          value={newResType}
                          onChange={(e) => setNewResType(e.target.value as any)}
                          className="px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900"
                        >
                          <option value="doc">Documentation</option>
                          <option value="video">Video</option>
                          <option value="course">Course</option>
                          <option value="article">Article</option>
                          <option value="book">Book</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          placeholder="https://..."
                          value={newResUrl}
                          onChange={(e) => setNewResUrl(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900"
                        />
                        <button
                          onClick={() => handleAddResource(step.id)}
                          className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 shrink-0"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setAddingResourceStepId(null)}
                          className="px-2 py-1.5 text-zinc-500 text-xs shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes Accordion Section */}
                <div className="mt-4 pt-3 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedNotes(prev => ({ ...prev, [step.id]: !isNotesExpanded }))}
                      className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900"
                    >
                      <FileText className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Study Notes & Insights</span>
                      {step.notes && !isNotesExpanded && (
                        <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.2 rounded font-normal">
                          (Contains notes)
                        </span>
                      )}
                      {isNotesExpanded ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
                    </button>

                    {isNotesExpanded && (
                      <button
                        onClick={() => handleSaveNotes(step.id)}
                        disabled={savingNotes[step.id]}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        {savedNotesTick[step.id] ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Saved!</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>{savingNotes[step.id] ? 'Saving...' : 'Save Notes'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {isNotesExpanded && (
                    <div className="mt-2.5">
                      <textarea
                        rows={4}
                        value={currentNotesVal}
                        onChange={(e) => setEditingNotes(prev => ({ ...prev, [step.id]: e.target.value }))}
                        placeholder="Write down personal notes, code patterns, gotchas, or review reminders..."
                        className="w-full p-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white text-zinc-900 font-mono resize-y"
                      />
                    </div>
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
