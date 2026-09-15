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

export interface Roadmap {
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
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface AuthUserPayload {
  userId: string;
  email: string;
  name: string;
}
