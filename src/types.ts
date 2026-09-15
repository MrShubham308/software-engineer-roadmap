export type StepStatus = 'not_started' | 'in_progress' | 'completed';

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  type: 'doc' | 'video' | 'course' | 'article' | 'book' | 'other';
}

export interface RoadmapStep {
  id: string;
  title: string;
  description?: string;
  status: StepStatus;
  order: number;
  estimatedHours?: number;
  topics: string[];
  notes: string;
  resources: ResourceLink[];
  completedAt?: string | null;
  updatedAt?: string;
}

export interface RoadmapMetrics {
  totalSteps: number;
  completedSteps: number;
  inProgressSteps: number;
  notStartedSteps: number;
  progressPercentage: number;
}

export interface Roadmap extends RoadmapMetrics {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: 'Frontend' | 'Backend' | 'Fullstack' | 'DevOps' | 'Mobile' | 'AI & Data' | 'System Design' | 'Other';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  targetDate?: string;
  tags: string[];
  steps: RoadmapStep[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface DashboardStats {
  totalRoadmaps: number;
  completedRoadmaps: number;
  inProgressRoadmaps: number;
  notStartedRoadmaps: number;
  totalSteps: number;
  totalCompletedSteps: number;
  totalInProgressSteps: number;
  averageProgress: number;
}

export interface RoadmapTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Frontend' | 'Backend' | 'Fullstack' | 'DevOps' | 'Mobile' | 'AI & Data' | 'System Design' | 'Other';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  steps: Omit<RoadmapStep, 'id'>[];
}
