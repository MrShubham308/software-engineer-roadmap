import { RoadmapStep } from '../types';

export interface RoadmapTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Frontend' | 'Backend' | 'Fullstack' | 'DevOps' | 'Mobile' | 'AI & Data' | 'System Design' | 'Other';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  steps: Omit<RoadmapStep, 'id'>[];
}

export const STARTER_TEMPLATES: RoadmapTemplate[] = [
  {
    id: 'frontend-2026',
    title: 'Modern Frontend Engineer 2026',
    description: 'Complete path from semantic HTML and modern CSS through TypeScript, React 19 ecosystem, state architecture, and web performance.',
    category: 'Frontend',
    level: 'Intermediate',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Web Vitals'],
    steps: [
      {
        title: 'Modern JavaScript & TypeScript Mastery',
        description: 'Deep dive into ESNext features, async/await, closures, prototypical inheritance, and strict TypeScript types.',
        status: 'completed',
        order: 0,
        estimatedHours: 40,
        topics: ['Event Loop & Microtasks', 'Closures & Scope', 'TypeScript Generics & Utility Types', 'ES Modules & Bundling'],
        notes: 'Focused on deep understanding of how V8 executes asynchronous code and strict type narrowing.',
        resources: [
          { id: 'r1', title: 'JavaScript.info Complete Guide', url: 'https://javascript.info', type: 'doc' },
          { id: 'r2', title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', type: 'doc' },
          { id: 'r3', title: 'You Don’t Know JS Yet', url: 'https://github.com/getify/You-Dont-Know-JS', type: 'book' }
        ],
        completedAt: '2026-08-15T10:00:00.000Z'
      },
      {
        title: 'React 19 & Component Architecture',
        description: 'Master React Server Components, Actions, useOptimistic, custom hooks, and concurrent rendering.',
        status: 'in_progress',
        order: 1,
        estimatedHours: 50,
        topics: ['React 19 Features', 'Server Components vs Client Components', 'Compound Component Patterns', 'use() hook and Suspense'],
        notes: 'Review React 19 documentation and build practical reusable design system components.',
        resources: [
          { id: 'r4', title: 'Official React Documentation', url: 'https://react.dev', type: 'doc' },
          { id: 'r5', title: 'React 19 Release Notes', url: 'https://react.dev/blog/2024/12/05/react-19', type: 'article' }
        ]
      },
      {
        title: 'State Management & Server State Caching',
        description: 'Choose and manage client state vs server state caching with TanStack Query and Zustand.',
        status: 'not_started',
        order: 2,
        estimatedHours: 30,
        topics: ['TanStack Query (React Query)', 'Zustand & Immer', 'Optimistic UI Updates', 'Cache Invalidation Strategies'],
        notes: 'Avoid putting server responses directly in global client state. Let server cache handle network states.',
        resources: [
          { id: 'r6', title: 'TanStack Query Docs', url: 'https://tanstack.com/query/latest', type: 'doc' }
        ]
      },
      {
        title: 'Web Performance & Core Web Vitals',
        description: 'Optimize LCP, INP, CLS, code splitting, bundle analysis, and image delivery.',
        status: 'not_started',
        order: 3,
        estimatedHours: 25,
        topics: ['Interaction to Next Paint (INP)', 'Largest Contentful Paint (LCP)', 'Dynamic Imports & Tree-shaking', 'Web Workers'],
        notes: 'Measure using Lighthouse, Chrome DevTools Performance panel, and WebPageTest.',
        resources: [
          { id: 'r7', title: 'web.dev Vitals Guide', url: 'https://web.dev/explore/metrics', type: 'doc' }
        ]
      },
      {
        title: 'Testing & Production Deployment',
        description: 'End-to-end testing with Playwright, component unit tests with Vitest, and CI/CD workflows.',
        status: 'not_started',
        order: 4,
        estimatedHours: 35,
        topics: ['Vitest & React Testing Library', 'Playwright E2E Tests', 'GitHub Actions CI/CD', 'Automated Accessibility Audits (axe-core)'],
        notes: 'Write tests that simulate actual user interactions rather than implementation details.',
        resources: [
          { id: 'r8', title: 'Playwright Documentation', url: 'https://playwright.dev', type: 'doc' }
        ]
      }
    ]
  },
  {
    id: 'backend-systems',
    title: 'Backend & Distributed Systems Engineer',
    description: 'Comprehensive guide to building resilient, scalable backend microservices, databases, and APIs.',
    category: 'Backend',
    level: 'Advanced',
    tags: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'System Design'],
    steps: [
      {
        title: 'Server Runtimes & API Protocols',
        description: 'Architecting robust RESTful, GraphQL, and gRPC services in Node.js and Go.',
        status: 'in_progress',
        order: 0,
        estimatedHours: 45,
        topics: ['REST Design Best Practices', 'Protobuf & gRPC', 'HTTP/2 & HTTP/3', 'Rate Limiting & Middleware'],
        notes: 'Focus on idempotency keys, standard error response payloads (RFC 7807), and API versioning.',
        resources: [
          { id: 'rb1', title: 'RESTful API Guidelines (Zalando)', url: 'https://opensource.zalando.com/restful-api-guidelines/', type: 'doc' },
          { id: 'rb2', title: 'gRPC Node.js Quickstart', url: 'https://grpc.io/docs/languages/node/quickstart/', type: 'doc' }
        ]
      },
      {
        title: 'Relational & NoSQL Database Engineering',
        description: 'Master schema modeling, ACID transactions, index optimization, query profiling, and replication.',
        status: 'not_started',
        order: 1,
        estimatedHours: 50,
        topics: ['PostgreSQL Indexing (B-Tree, GIN)', 'MongoDB Aggregation Pipeline', 'Transaction Isolation Levels', 'Connection Pooling'],
        notes: 'Analyze query execution plans with EXPLAIN ANALYZE before deploying schema changes to production.',
        resources: [
          { id: 'rb3', title: 'Use The Index, Luke!', url: 'https://use-the-index-luke.com', type: 'book' },
          { id: 'rb4', title: 'MongoDB University Courses', url: 'https://learn.mongodb.com', type: 'course' }
        ]
      },
      {
        title: 'Caching & Asynchronous Message Queues',
        description: 'High-throughput architectures using Redis caches and message brokers like RabbitMQ or Kafka.',
        status: 'not_started',
        order: 2,
        estimatedHours: 40,
        topics: ['Redis Cache-Aside & Write-Through', 'Distributed Locks (Redlock)', 'Kafka Partitions & Consumer Groups', 'Dead Letter Queues'],
        notes: 'Implement exponential backoff retry policies and idempotency checks in event consumers.',
        resources: [
          { id: 'rb5', title: 'Redis Official Documentation', url: 'https://redis.io/docs/', type: 'doc' },
          { id: 'rb6', title: 'Kafka: The Definitive Guide', url: 'https://www.confluent.io/resources/kafka-the-definitive-guide/', type: 'book' }
        ]
      },
      {
        title: 'Containerization & Cloud Infrastructure',
        description: 'Docker packaging, multi-stage builds, Kubernetes basics, and cloud deployment pipelines.',
        status: 'not_started',
        order: 3,
        estimatedHours: 35,
        topics: ['Docker Multi-stage Builds', 'Kubernetes Pods & Deployments', 'Twelve-Factor App Methodology', 'Env Configuration & Secrets'],
        notes: 'Keep image layers small and never run container processes as root.',
        resources: [
          { id: 'rb7', title: 'The Twelve-Factor App', url: 'https://12factor.net', type: 'article' }
        ]
      }
    ]
  },
  {
    id: 'fullstack-mastery',
    title: 'Full-Stack Software Engineer',
    description: 'End-to-end web engineering covering modern UI frameworks, backend APIs, data modeling, authentication, and DevOps.',
    category: 'Fullstack',
    level: 'Intermediate',
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'Authentication'],
    steps: [
      {
        title: 'Frontend Component Architecture & UI',
        description: 'Responsive layouts, state lifecycle, form handling, and accessible UI components.',
        status: 'completed',
        order: 0,
        estimatedHours: 35,
        topics: ['React Component Trees', 'Tailwind CSS utility layout', 'Controlled vs Uncontrolled Forms', 'Accessibility (ARIA)'],
        notes: 'Focus on semantic HTML5 tags and clean component interfaces.',
        resources: [
          { id: 'rf1', title: 'MDN Web Docs', url: 'https://developer.mozilla.org', type: 'doc' }
        ],
        completedAt: '2026-09-01T12:00:00.000Z'
      },
      {
        title: 'RESTful API & Express.js Backend',
        description: 'Building structured Express servers with middleware pipelines, routing, and validation.',
        status: 'completed',
        order: 1,
        estimatedHours: 30,
        topics: ['Express Middleware Pipeline', 'Route Controllers', 'Input Validation (Zod/Joi)', 'Global Error Handling'],
        notes: 'Centralize error formatting and use async handler wrappers.',
        resources: [
          { id: 'rf2', title: 'Express.js Documentation', url: 'https://expressjs.com', type: 'doc' }
        ],
        completedAt: '2026-09-10T14:30:00.000Z'
      },
      {
        title: 'Authentication, Authorization & Security',
        description: 'Secure JWT issuance, bcrypt password hashing, CORS, CSRF, and role-based access control.',
        status: 'in_progress',
        order: 2,
        estimatedHours: 25,
        topics: ['JWT Verification & Expiration', 'Password Hashing (bcrypt)', 'CORS & Security Headers (Helmet)', 'OWASP Top 10 Protections'],
        notes: 'Never store plain text passwords. Always hash with adequate salt rounds.',
        resources: [
          { id: 'rf3', title: 'OWASP Top 10 Web Application Security Risks', url: 'https://owasp.org/www-project-top-ten/', type: 'doc' }
        ]
      },
      {
        title: 'Database Design & MongoDB Persistence',
        description: 'Document modeling, relationship referencing, index optimization, and CRUD operations.',
        status: 'not_started',
        order: 3,
        estimatedHours: 30,
        topics: ['MongoDB Schemas & Collections', 'Indexes & Query Performance', 'Referencing vs Embedding', 'Aggregation Framework'],
        notes: 'Decide whether to embed child data (e.g., steps in roadmap) or reference by ID based on read/write patterns.',
        resources: [
          { id: 'rf4', title: 'MongoDB Documentation', url: 'https://www.mongodb.com/docs/', type: 'doc' }
        ]
      },
      {
        title: 'Continuous Integration & Production Deployment',
        description: 'Automated testing, linting, build pipelines, and production deployment on cloud containers.',
        status: 'not_started',
        order: 4,
        estimatedHours: 20,
        topics: ['Docker Containerization', 'GitHub Actions Workflows', 'Zero-downtime Deployments', 'Logging & Monitoring'],
        notes: 'Setup automated build and test checks before merging pull requests.',
        resources: [
          { id: 'rf5', title: 'Docker Overview', url: 'https://docs.docker.com/get-started/overview/', type: 'doc' }
        ]
      }
    ]
  },
  {
    id: 'devops-cloud',
    title: 'DevOps & Cloud Architect Roadmap',
    description: 'Infrastructure as Code, CI/CD automation, container orchestration, and site reliability engineering.',
    category: 'DevOps',
    level: 'Advanced',
    tags: ['Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Prometheus'],
    steps: [
      {
        title: 'Linux Fundamentals & Scripting',
        description: 'Command line proficiency, process management, shell scripting, and networking troubleshooting.',
        status: 'completed',
        order: 0,
        estimatedHours: 30,
        topics: ['Bash Scripting', 'systemd & Processes', 'SSH Keys & Permissions', 'iptables & UFW Firewalls'],
        notes: 'Master grep, sed, awk, curl, netstat, and journalctl.',
        resources: [
          { id: 'rd1', title: 'Linux Command Line Guide', url: 'https://linuxcommand.org', type: 'doc' }
        ]
      },
      {
        title: 'Container Orchestration with Kubernetes',
        description: 'Deploying, managing, and scaling containerized applications with Kubernetes.',
        status: 'in_progress',
        order: 1,
        estimatedHours: 50,
        topics: ['Pods, Services & Ingress', 'ConfigMaps & Secrets', 'StatefulSets & PersistentVolumes', 'Helm Charts'],
        notes: 'Practice setting up local clusters with minikube or k3s.',
        resources: [
          { id: 'rd2', title: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs/home/', type: 'doc' }
        ]
      },
      {
        title: 'Infrastructure as Code (IaC) with Terraform',
        description: 'Automating cloud provisioning across AWS, GCP, and Azure using declarative Terraform templates.',
        status: 'not_started',
        order: 2,
        estimatedHours: 40,
        topics: ['HCL Syntax & Modules', 'Remote State Management & Locking', 'Terraform Plan & Apply Workflows', 'Secret Management'],
        notes: 'Store Terraform state securely in remote cloud storage with state locking enabled.',
        resources: [
          { id: 'rd3', title: 'Terraform Tutorials', url: 'https://developer.hashicorp.com/terraform/tutorials', type: 'doc' }
        ]
      }
    ]
  }
];
