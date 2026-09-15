import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { Roadmap, RoadmapStep, StepStatus } from '../types';
import { STARTER_TEMPLATES } from '../data/templates';

export const roadmapsRouter = Router();

// All roadmap routes are protected
roadmapsRouter.use(authenticateToken);

function computeRoadmapMetrics(steps: RoadmapStep[]) {
  const total = steps.length;
  if (total === 0) {
    return {
      totalSteps: 0,
      completedSteps: 0,
      inProgressSteps: 0,
      notStartedSteps: 0,
      progressPercentage: 0
    };
  }

  const completed = steps.filter(s => s.status === 'completed').length;
  const inProgress = steps.filter(s => s.status === 'in_progress').length;
  const notStarted = steps.filter(s => s.status === 'not_started').length;
  const percentage = Math.round((completed / total) * 100);

  return {
    totalSteps: total,
    completedSteps: completed,
    inProgressSteps: inProgress,
    notStartedSteps: notStarted,
    progressPercentage: percentage
  };
}

// 1. Get templates
roadmapsRouter.get('/templates', async (req: AuthenticatedRequest, res: Response) => {
  res.json({ templates: STARTER_TEMPLATES });
});

// 2. Clone starter template
roadmapsRouter.post('/templates/:templateId/clone', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { templateId } = req.params;

    const template = STARTER_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      res.status(404).json({ message: 'Template not found' });
      return;
    }

    const newRoadmap: Roadmap = {
      _id: `rdm_${crypto.randomBytes(8).toString('hex')}`,
      userId,
      title: template.title,
      description: template.description,
      category: template.category,
      level: template.level,
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: [...template.tags],
      steps: template.steps.map((step, idx) => ({
        ...step,
        id: `step_${idx + 1}_${crypto.randomBytes(4).toString('hex')}`,
        order: idx,
        status: 'not_started', // Start clean when cloned
        completedAt: null,
        updatedAt: new Date().toISOString()
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = await db.createRoadmap(newRoadmap);
    res.status(201).json({
      message: 'Roadmap cloned successfully',
      roadmap: {
        ...saved,
        ...computeRoadmapMetrics(saved.steps)
      }
    });
  } catch (error) {
    console.error('Error cloning template:', error);
    res.status(500).json({ message: 'Failed to clone template' });
  }
});

// 3. Overall user stats
roadmapsRouter.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const roadmaps = await db.findRoadmapsByUserId(userId);

    let totalSteps = 0;
    let totalCompletedSteps = 0;
    let totalInProgressSteps = 0;
    let completedRoadmaps = 0;
    let inProgressRoadmaps = 0;

    roadmaps.forEach(r => {
      const metrics = computeRoadmapMetrics(r.steps);
      totalSteps += metrics.totalSteps;
      totalCompletedSteps += metrics.completedSteps;
      totalInProgressSteps += metrics.inProgressSteps;

      if (metrics.totalSteps > 0 && metrics.completedSteps === metrics.totalSteps) {
        completedRoadmaps += 1;
      } else if (metrics.inProgressSteps > 0 || metrics.completedSteps > 0) {
        inProgressRoadmaps += 1;
      }
    });

    const averageProgress = totalSteps > 0 ? Math.round((totalCompletedSteps / totalSteps) * 100) : 0;

    res.json({
      stats: {
        totalRoadmaps: roadmaps.length,
        completedRoadmaps,
        inProgressRoadmaps,
        notStartedRoadmaps: roadmaps.length - completedRoadmaps - inProgressRoadmaps,
        totalSteps,
        totalCompletedSteps,
        totalInProgressSteps,
        averageProgress
      }
    });
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({ message: 'Failed to fetch roadmap statistics' });
  }
});

// 4. Get all user roadmaps (with search & filter)
roadmapsRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { search, category, status, sort } = req.query;

    let roadmaps = await db.findRoadmapsByUserId(userId);

    // Apply search
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      roadmaps = roadmaps.filter(r => {
        const titleMatch = r.title.toLowerCase().includes(q);
        const descMatch = r.description?.toLowerCase().includes(q);
        const tagMatch = r.tags.some(t => t.toLowerCase().includes(q));
        const topicMatch = r.steps.some(s => 
          s.title.toLowerCase().includes(q) || 
          s.topics?.some(top => top.toLowerCase().includes(q))
        );
        return titleMatch || descMatch || tagMatch || topicMatch;
      });
    }

    // Apply category filter
    if (category && typeof category === 'string' && category !== 'All') {
      roadmaps = roadmaps.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }

    // Enhance with metrics
    let enhanced = roadmaps.map(r => {
      const sortedSteps = [...(r.steps || [])].sort((a, b) => a.order - b.order);
      return {
        ...r,
        steps: sortedSteps,
        ...computeRoadmapMetrics(sortedSteps)
      };
    });

    // Apply status filter
    if (status && typeof status === 'string' && status !== 'All') {
      if (status === 'completed') {
        enhanced = enhanced.filter(r => r.totalSteps > 0 && r.completedSteps === r.totalSteps);
      } else if (status === 'in_progress') {
        enhanced = enhanced.filter(r => r.progressPercentage > 0 && r.progressPercentage < 100);
      } else if (status === 'not_started') {
        enhanced = enhanced.filter(r => r.progressPercentage === 0);
      }
    }

    // Sort
    if (sort === 'progress-desc') {
      enhanced.sort((a, b) => b.progressPercentage - a.progressPercentage);
    } else if (sort === 'progress-asc') {
      enhanced.sort((a, b) => a.progressPercentage - b.progressPercentage);
    } else if (sort === 'title-asc') {
      enhanced.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'created-asc') {
      enhanced.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      // Default: updated-desc
      enhanced.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    res.json({ roadmaps: enhanced });
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    res.status(500).json({ message: 'Failed to fetch roadmaps' });
  }
});

// 5. Get single roadmap
roadmapsRouter.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const roadmap = await db.findRoadmapById(id, userId);
    if (!roadmap) {
      res.status(404).json({ message: 'Roadmap not found' });
      return;
    }

    const sortedSteps = [...(roadmap.steps || [])].sort((a, b) => a.order - b.order);
    res.json({
      roadmap: {
        ...roadmap,
        steps: sortedSteps,
        ...computeRoadmapMetrics(sortedSteps)
      }
    });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ message: 'Failed to fetch roadmap' });
  }
});

// 6. Create new roadmap
roadmapsRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, description, category, level, targetDate, tags, initialSteps } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({ message: 'Roadmap title is required' });
      return;
    }

    const rawSteps = Array.isArray(initialSteps) ? initialSteps : [];
    const formattedSteps: RoadmapStep[] = rawSteps.map((s: any, idx: number) => ({
      id: `step_${idx + 1}_${crypto.randomBytes(4).toString('hex')}`,
      title: s.title || `Step ${idx + 1}`,
      description: s.description || '',
      status: (['not_started', 'in_progress', 'completed'].includes(s.status) ? s.status : 'not_started') as StepStatus,
      order: idx,
      estimatedHours: typeof s.estimatedHours === 'number' ? s.estimatedHours : 10,
      topics: Array.isArray(s.topics) ? s.topics.map(String) : [],
      notes: typeof s.notes === 'string' ? s.notes : '',
      resources: Array.isArray(s.resources) ? s.resources : [],
      completedAt: s.status === 'completed' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    }));

    const newRoadmap: Roadmap = {
      _id: `rdm_${crypto.randomBytes(8).toString('hex')}`,
      userId,
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      category: category || 'Fullstack',
      level: level || 'Intermediate',
      targetDate: targetDate || '',
      tags: Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [],
      steps: formattedSteps,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = await db.createRoadmap(newRoadmap);
    res.status(201).json({
      message: 'Roadmap created successfully',
      roadmap: {
        ...saved,
        ...computeRoadmapMetrics(saved.steps)
      }
    });
  } catch (error) {
    console.error('Error creating roadmap:', error);
    res.status(500).json({ message: 'Failed to create roadmap' });
  }
});

// 7. Update roadmap details (meta)
roadmapsRouter.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { title, description, category, level, targetDate, tags } = req.body;

    const existing = await db.findRoadmapById(id, userId);
    if (!existing) {
      res.status(404).json({ message: 'Roadmap not found' });
      return;
    }

    const updateData: Partial<Roadmap> = {};
    if (typeof title === 'string' && title.trim().length > 0) updateData.title = title.trim();
    if (typeof description === 'string') updateData.description = description.trim();
    if (category) updateData.category = category;
    if (level) updateData.level = level;
    if (targetDate !== undefined) updateData.targetDate = targetDate;
    if (Array.isArray(tags)) updateData.tags = tags.map(t => String(t).trim()).filter(Boolean);

    const updated = await db.updateRoadmap(id, userId, updateData);
    if (!updated) {
      res.status(404).json({ message: 'Failed to update roadmap' });
      return;
    }

    const sortedSteps = [...(updated.steps || [])].sort((a, b) => a.order - b.order);
    res.json({
      message: 'Roadmap updated successfully',
      roadmap: {
        ...updated,
        steps: sortedSteps,
        ...computeRoadmapMetrics(sortedSteps)
      }
    });
  } catch (error) {
    console.error('Error updating roadmap:', error);
    res.status(500).json({ message: 'Failed to update roadmap' });
  }
});

// 8. Delete roadmap
roadmapsRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const deleted = await db.deleteRoadmap(id, userId);
    if (!deleted) {
      res.status(404).json({ message: 'Roadmap not found or already deleted' });
      return;
    }

    res.json({ message: 'Roadmap deleted successfully' });
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    res.status(500).json({ message: 'Failed to delete roadmap' });
  }
});

// 9. Add Step to roadmap
roadmapsRouter.post('/:id/steps', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { title, description, status, estimatedHours, topics, notes, resources } = req.body;

    const roadmap = await db.findRoadmapById(id, userId);
    if (!roadmap) {
      res.status(404).json({ message: 'Roadmap not found' });
      return;
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({ message: 'Step title is required' });
      return;
    }

    const currentSteps = roadmap.steps || [];
    const stepStatus: StepStatus = ['not_started', 'in_progress', 'completed'].includes(status) ? status : 'not_started';

    const newStep: RoadmapStep = {
      id: `step_${currentSteps.length + 1}_${crypto.randomBytes(4).toString('hex')}`,
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      status: stepStatus,
      order: currentSteps.length,
      estimatedHours: typeof estimatedHours === 'number' ? estimatedHours : 10,
      topics: Array.isArray(topics) ? topics.map(t => String(t).trim()).filter(Boolean) : [],
      notes: typeof notes === 'string' ? notes : '',
      resources: Array.isArray(resources) ? resources : [],
      completedAt: stepStatus === 'completed' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    };

    const updatedSteps = [...currentSteps, newStep];
    const updated = await db.updateRoadmap(id, userId, { steps: updatedSteps });

    const sortedSteps = [...(updated?.steps || [])].sort((a, b) => a.order - b.order);
    res.status(201).json({
      message: 'Step added successfully',
      step: newStep,
      roadmap: {
        ...updated,
        steps: sortedSteps,
        ...computeRoadmapMetrics(sortedSteps)
      }
    });
  } catch (error) {
    console.error('Error adding step:', error);
    res.status(500).json({ message: 'Failed to add step' });
  }
});

// 10. Update Step in roadmap
roadmapsRouter.put('/:id/steps/:stepId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id, stepId } = req.params;
    const { title, description, status, estimatedHours, topics, notes, resources, order } = req.body;

    const roadmap = await db.findRoadmapById(id, userId);
    if (!roadmap) {
      res.status(404).json({ message: 'Roadmap not found' });
      return;
    }

    const steps = [...roadmap.steps];
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) {
      res.status(404).json({ message: 'Step not found' });
      return;
    }

    const currentStep = steps[stepIndex];
    let newStatus: StepStatus = currentStep.status;
    let completedAt = currentStep.completedAt;

    if (status && ['not_started', 'in_progress', 'completed'].includes(status)) {
      newStatus = status as StepStatus;
      if (newStatus === 'completed' && currentStep.status !== 'completed') {
        completedAt = new Date().toISOString();
      } else if (newStatus !== 'completed') {
        completedAt = null;
      }
    }

    const updatedStep: RoadmapStep = {
      ...currentStep,
      title: typeof title === 'string' && title.trim().length > 0 ? title.trim() : currentStep.title,
      description: typeof description === 'string' ? description.trim() : currentStep.description,
      status: newStatus,
      completedAt,
      estimatedHours: typeof estimatedHours === 'number' ? estimatedHours : currentStep.estimatedHours,
      topics: Array.isArray(topics) ? topics.map(t => String(t).trim()).filter(Boolean) : currentStep.topics,
      notes: typeof notes === 'string' ? notes : currentStep.notes,
      resources: Array.isArray(resources) ? resources : currentStep.resources,
      order: typeof order === 'number' ? order : currentStep.order,
      updatedAt: new Date().toISOString()
    };

    steps[stepIndex] = updatedStep;
    const updated = await db.updateRoadmap(id, userId, { steps });

    const sortedSteps = [...(updated?.steps || [])].sort((a, b) => a.order - b.order);
    res.json({
      message: 'Step updated successfully',
      step: updatedStep,
      roadmap: {
        ...updated,
        steps: sortedSteps,
        ...computeRoadmapMetrics(sortedSteps)
      }
    });
  } catch (error) {
    console.error('Error updating step:', error);
    res.status(500).json({ message: 'Failed to update step' });
  }
});

// 11. Delete Step from roadmap
roadmapsRouter.delete('/:id/steps/:stepId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id, stepId } = req.params;

    const roadmap = await db.findRoadmapById(id, userId);
    if (!roadmap) {
      res.status(404).json({ message: 'Roadmap not found' });
      return;
    }

    const filteredSteps = roadmap.steps
      .filter(s => s.id !== stepId)
      .map((s, idx) => ({ ...s, order: idx }));

    const updated = await db.updateRoadmap(id, userId, { steps: filteredSteps });
    const sortedSteps = [...(updated?.steps || [])].sort((a, b) => a.order - b.order);

    res.json({
      message: 'Step deleted successfully',
      roadmap: {
        ...updated,
        steps: sortedSteps,
        ...computeRoadmapMetrics(sortedSteps)
      }
    });
  } catch (error) {
    console.error('Error deleting step:', error);
    res.status(500).json({ message: 'Failed to delete step' });
  }
});

// 12. Reorder Steps in roadmap
roadmapsRouter.put('/:id/steps-reorder', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { orderedStepIds } = req.body;

    if (!Array.isArray(orderedStepIds)) {
      res.status(400).json({ message: 'orderedStepIds array is required' });
      return;
    }

    const roadmap = await db.findRoadmapById(id, userId);
    if (!roadmap) {
      res.status(404).json({ message: 'Roadmap not found' });
      return;
    }

    const stepMap = new Map(roadmap.steps.map(s => [s.id, s]));
    const reordered: RoadmapStep[] = [];

    orderedStepIds.forEach((stepId, index) => {
      const step = stepMap.get(stepId);
      if (step) {
        reordered.push({ ...step, order: index });
        stepMap.delete(stepId);
      }
    });

    // Append any steps that weren't included in the orderedStepIds array
    stepMap.forEach(step => {
      reordered.push({ ...step, order: reordered.length });
    });

    const updated = await db.updateRoadmap(id, userId, { steps: reordered });
    const sortedSteps = [...(updated?.steps || [])].sort((a, b) => a.order - b.order);

    res.json({
      message: 'Steps reordered successfully',
      roadmap: {
        ...updated,
        steps: sortedSteps,
        ...computeRoadmapMetrics(sortedSteps)
      }
    });
  } catch (error) {
    console.error('Error reordering steps:', error);
    res.status(500).json({ message: 'Failed to reorder steps' });
  }
});
