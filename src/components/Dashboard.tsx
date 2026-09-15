import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Circle, 
  ChevronRight, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Layers, 
  TrendingUp,
  Award,
  ArrowUpDown,
  BookOpen
} from 'lucide-react';
import { Roadmap, DashboardStats } from '../types';

interface DashboardProps {
  roadmaps: Roadmap[];
  stats: DashboardStats | null;
  onSelectRoadmap: (id: string) => void;
  onOpenNewRoadmap: () => void;
  onOpenTemplates: () => void;
  onEditRoadmap: (roadmap: Roadmap) => void;
  onDeleteRoadmap: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  isLoading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  roadmaps,
  stats,
  onSelectRoadmap,
  onOpenNewRoadmap,
  onOpenTemplates,
  onEditRoadmap,
  onDeleteRoadmap,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  isLoading
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const categories = ['All', 'Frontend', 'Backend', 'Fullstack', 'DevOps', 'Mobile', 'AI & Data', 'System Design'];
  const statuses = [
    { label: 'All Statuses', value: 'All' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Not Started', value: 'not_started' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Roadmaps</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-900">{stats?.totalRoadmaps ?? roadmaps.length}</div>
            <p className="text-xs text-zinc-500 mt-0.5">Active engineering tracks</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-900">{stats?.inProgressRoadmaps ?? 0}</div>
            <p className="text-xs text-zinc-500 mt-0.5">Actively being pursued</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Completed Steps</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-900">
              {stats?.totalCompletedSteps ?? 0}
              <span className="text-sm font-normal text-zinc-400 ml-1">/ {stats?.totalSteps ?? 0}</span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">Milestones checked off</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Overall Progress</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-zinc-900">{stats?.averageProgress ?? 0}%</div>
            <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, stats?.averageProgress ?? 0)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roadmaps by title, topics, or skills (e.g. React, Docker, Database)..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white text-zinc-900 placeholder:text-zinc-400"
              id="dashboard-search-input"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
              id="dashboard-status-filter"
            >
              {statuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-zinc-900"
              id="dashboard-sort-select"
            >
              <option value="updated-desc">Recently Updated</option>
              <option value="progress-desc">Highest Progress</option>
              <option value="progress-asc">Lowest Progress</option>
              <option value="title-asc">Alphabetical (A-Z)</option>
              <option value="created-asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Roadmaps Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-900">Your Engineering Roadmaps</h2>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
              {roadmaps.length}
            </span>
          </div>

          <button
            onClick={onOpenTemplates}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Explore Starter Templates</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-zinc-400 text-sm">
            Loading roadmaps...
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="p-12 text-center bg-white border border-zinc-200 rounded-2xl shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-500 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">No Roadmaps Found</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1 mb-6">
              {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'
                ? 'No roadmaps match your search criteria. Try clearing filters or changing keywords.'
                : 'Get started by creating your custom engineering roadmap or clone a pre-made industry curriculum.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onOpenNewRoadmap}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-2"
                id="empty-create-roadmap-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Create Custom Roadmap</span>
              </button>
              <button
                onClick={onOpenTemplates}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
                id="empty-browse-templates-btn"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Use Starter Template</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roadmaps.map((roadmap) => {
              const total = roadmap.totalSteps || 0;
              const completed = roadmap.completedSteps || 0;
              const inProgress = roadmap.inProgressSteps || 0;
              const pct = roadmap.progressPercentage || 0;

              return (
                <div
                  key={roadmap._id}
                  className="flex flex-col justify-between bg-white border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 transition-all hover:shadow-xs group relative"
                  id={`roadmap-card-${roadmap._id}`}
                >
                  <div>
                    {/* Top Row: Category, Level & Dropdown menu */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200">
                          {roadmap.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-50 text-zinc-600 border border-zinc-200/60">
                          {roadmap.level}
                        </span>
                      </div>

                      {/* Options menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === roadmap._id ? null : roadmap._id);
                          }}
                          className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
                          id={`roadmap-menu-btn-${roadmap._id}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === roadmap._id && (
                          <div 
                            className="absolute right-0 mt-1 w-36 bg-white border border-zinc-200 rounded-xl shadow-lg z-20 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onEditRoadmap(roadmap);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-left text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit Details</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                if (confirm(`Are you sure you want to delete "${roadmap.title}"?`)) {
                                  onDeleteRoadmap(roadmap._id);
                                }
                              }}
                              className="w-full px-3 py-1.5 text-xs text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div 
                      onClick={() => onSelectRoadmap(roadmap._id)}
                      className="cursor-pointer"
                    >
                      <h3 className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {roadmap.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                        {roadmap.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Tags */}
                    {roadmap.tags && roadmap.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {roadmap.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-50 border border-zinc-200 text-zinc-600"
                          >
                            {tag}
                          </span>
                        ))}
                        {roadmap.tags.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] text-zinc-400">
                            +{roadmap.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Progress Bar & Step Statistics */}
                  <div className="mt-5 pt-4 border-t border-zinc-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-zinc-700 flex items-center gap-1">
                        <span>Progress</span>
                        <span className="text-zinc-400 font-normal">({completed}/{total} steps)</span>
                      </span>
                      <span className={`font-bold ${pct === 100 ? 'text-emerald-600' : 'text-zinc-900'}`}>
                        {pct}%
                      </span>
                    </div>

                    <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          pct === 100 ? 'bg-emerald-500' : 'bg-zinc-900'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>

                    {/* Step pills status */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {completed} done
                        </span>
                        <span className="flex items-center gap-1 text-amber-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {inProgress} active
                        </span>
                      </div>

                      {roadmap.targetDate && (
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Calendar className="w-3 h-3" />
                          <span>{roadmap.targetDate}</span>
                        </span>
                      )}
                    </div>

                    {/* CTA to open */}
                    <button
                      onClick={() => onSelectRoadmap(roadmap._id)}
                      className="mt-4 w-full py-2 px-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors group-hover:border-zinc-300"
                    >
                      <span>Manage Roadmap</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
