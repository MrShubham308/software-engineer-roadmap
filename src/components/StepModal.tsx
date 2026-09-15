import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, Circle, Plus, Trash2, Link as LinkIcon, BookOpen, ExternalLink } from 'lucide-react';
import { RoadmapStep, StepStatus, ResourceLink } from '../types';

interface StepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stepData: Partial<RoadmapStep>) => Promise<void>;
  initialData?: RoadmapStep | null;
  stepNumber: number;
}

export const StepModal: React.FC<StepModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  stepNumber
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<StepStatus>('not_started');
  const [estimatedHours, setEstimatedHours] = useState<number>(10);
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopicInput, setNewTopicInput] = useState('');
  const [notes, setNotes] = useState('');
  const [resources, setResources] = useState<ResourceLink[]>([]);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');
  const [newResType, setNewResType] = useState<ResourceLink['type']>('doc');
  const [showAddResource, setShowAddResource] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status || 'not_started');
      setEstimatedHours(initialData.estimatedHours ?? 10);
      setTopics(initialData.topics || []);
      setNotes(initialData.notes || '');
      setResources(initialData.resources || []);
    } else {
      setTitle('');
      setDescription('');
      setStatus('not_started');
      setEstimatedHours(15);
      setTopics([]);
      setNotes('');
      setResources([]);
    }
    setNewTopicInput('');
    setShowAddResource(false);
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddTopic = () => {
    if (newTopicInput.trim()) {
      if (!topics.includes(newTopicInput.trim())) {
        setTopics([...topics, newTopicInput.trim()]);
      }
      setNewTopicInput('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(t => t !== topicToRemove));
  };

  const handleAddResource = () => {
    if (!newResTitle.trim() || !newResUrl.trim()) return;

    let formattedUrl = newResUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newRes: ResourceLink = {
      id: `res_${Date.now()}`,
      title: newResTitle.trim(),
      url: formattedUrl,
      type: newResType
    };

    setResources([...resources, newRes]);
    setNewResTitle('');
    setNewResUrl('');
    setShowAddResource(false);
  };

  const handleRemoveResource = (id: string) => {
    setResources(resources.filter(r => r.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a step title');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        estimatedHours: Number(estimatedHours) || 0,
        topics,
        notes,
        resources
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save roadmap step');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-8"
        id="step-modal-container"
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
              #{stepNumber}
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                {initialData ? 'Edit Step Details' : 'Add Roadmap Step'}
              </h2>
              <p className="text-xs text-zinc-500">Define topics, study notes, and reference materials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
            id="step-modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Title & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Step Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed Caching with Redis"
                className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white text-zinc-900 placeholder:text-zinc-400"
                id="step-input-title"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Progress Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StepStatus)}
                className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white text-zinc-900 font-medium"
                id="step-select-status"
              >
                <option value="not_started">⚪ Not Started</option>
                <option value="in_progress">🟡 In Progress</option>
                <option value="completed">🟢 Completed</option>
              </select>
            </div>
          </div>

          {/* Description and Hours */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Step Overview / Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of learning goals for this milestone..."
                className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white text-zinc-900 placeholder:text-zinc-400"
                id="step-input-description"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                min={0}
                max={500}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white text-zinc-900"
                id="step-input-hours"
              />
            </div>
          </div>

          {/* Key Topics List */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Key Topics & Concepts to Master
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-zinc-50 border border-zinc-200 rounded-xl min-h-[44px]">
              {topics.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-800 shadow-2xs"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(t)}
                    className="text-zinc-400 hover:text-red-600 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1 flex-1 min-w-[140px]">
                <input
                  type="text"
                  value={newTopicInput}
                  onChange={(e) => setNewTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTopic();
                    }
                  }}
                  placeholder="+ Type topic & press Enter"
                  className="w-full px-2 py-1 text-xs bg-transparent focus:outline-hidden text-zinc-800 placeholder:text-zinc-400"
                  id="step-input-new-topic"
                />
              </div>
            </div>
          </div>

          {/* Notes & Study Insights */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Personal Study Notes & Cheat Sheet
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down key takeaways, architectural rules of thumb, commands, or code snippets..."
              className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white text-zinc-900 placeholder:text-zinc-400 resize-y font-mono text-xs"
              id="step-input-notes"
            />
          </div>

          {/* Resource Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-700">
                Resource Links & Documentation ({resources.length})
              </label>
              {!showAddResource && (
                <button
                  type="button"
                  onClick={() => setShowAddResource(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                  id="step-btn-add-resource-toggle"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Link</span>
                </button>
              )}
            </div>

            {/* List of current resources */}
            <div className="space-y-1.5">
              {resources.map((res) => (
                <div 
                  key={res.id} 
                  className="flex items-center justify-between p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs hover:border-zinc-300 transition-colors"
                >
                  <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-zinc-200 text-zinc-700 shrink-0">
                      {res.type}
                    </span>
                    <span className="font-semibold text-zinc-900 truncate">{res.title}</span>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-indigo-600 truncate underline"
                    >
                      {res.url}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveResource(res.id)}
                    className="p-1 text-zinc-400 hover:text-red-600 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Resource Mini Form */}
            {showAddResource && (
              <div className="mt-2 p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Resource Title (e.g. Official Docs, Course)"
                      value={newResTitle}
                      onChange={(e) => setNewResTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-hidden text-zinc-900"
                    />
                  </div>
                  <div>
                    <select
                      value={newResType}
                      onChange={(e) => setNewResType(e.target.value as any)}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-hidden text-zinc-900"
                    >
                      <option value="doc">Documentation</option>
                      <option value="video">Video / Tutorial</option>
                      <option value="course">Course</option>
                      <option value="article">Article / Blog</option>
                      <option value="book">Book</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newResUrl}
                    onChange={(e) => setNewResUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-hidden text-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddResource}
                    className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 shrink-0"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddResource(false)}
                    className="px-2 py-1.5 text-zinc-500 hover:text-zinc-700 text-xs shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors"
              id="step-modal-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-sm transition-all disabled:opacity-50"
              id="step-modal-submit-btn"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Step to Roadmap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
