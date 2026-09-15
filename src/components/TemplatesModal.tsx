import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, CheckCircle, Clock, BookOpen, Layers, Zap } from 'lucide-react';
import { RoadmapTemplate } from '../types';
import { roadmapsApi } from '../api/client';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateCloned: (clonedRoadmapId: string) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onTemplateCloned
}) => {
  const [templates, setTemplates] = useState<RoadmapTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      roadmapsApi.getTemplates()
        .then(data => {
          setTemplates(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to load templates:', err);
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClone = async (templateId: string) => {
    setCloningId(templateId);
    try {
      const cloned = await roadmapsApi.cloneTemplate(templateId);
      onTemplateCloned(cloned._id);
      onClose();
    } catch (err) {
      console.error('Failed to clone template:', err);
      alert('Failed to clone template. Please try again.');
    } finally {
      setCloningId(null);
    }
  };

  const categories = ['All', 'Frontend', 'Backend', 'Fullstack', 'DevOps'];
  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden my-8"
        id="templates-modal-container"
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900">
                Software Engineering Starter Roadmaps
              </h2>
              <p className="text-xs text-zinc-500">
                Clone pre-configured industry tracks with curated steps, topics, and study links
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
            id="templates-modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-6 py-3 border-b border-zinc-100 bg-white flex items-center gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-12 text-center text-zinc-400 text-sm">
              Loading templates...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(tpl => (
                <div
                  key={tpl.id}
                  className="flex flex-col justify-between p-5 bg-zinc-50/80 border border-zinc-200 rounded-2xl hover:border-zinc-300 transition-all hover:shadow-xs group"
                >
                  <div>
                    {/* Badge row */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                          {tpl.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-200/70 text-zinc-700">
                          {tpl.level}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400 font-medium">
                        {tpl.steps.length} Steps
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                      {tpl.title}
                    </h3>
                    <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>

                    {/* Step summary highlights */}
                    <div className="mt-4 pt-3 border-t border-zinc-200/60 space-y-1.5">
                      <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                        Included Milestones:
                      </p>
                      <ul className="space-y-1">
                        {tpl.steps.slice(0, 3).map((step, sIdx) => (
                          <li key={sIdx} className="text-xs text-zinc-700 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-zinc-200 text-zinc-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {sIdx + 1}
                            </span>
                            <span className="truncate">{step.title}</span>
                          </li>
                        ))}
                        {tpl.steps.length > 3 && (
                          <li className="text-[11px] text-zinc-400 italic pl-5">
                            + {tpl.steps.length - 3} more learning steps
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {tpl.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white border border-zinc-200 text-zinc-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-200/60 flex items-center justify-end">
                    <button
                      onClick={() => handleClone(tpl.id)}
                      disabled={cloningId === tpl.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                      id={`template-clone-btn-${tpl.id}`}
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>{cloningId === tpl.id ? 'Cloning Roadmap...' : 'Use this Template'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
