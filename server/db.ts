import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MongoClient, Db } from 'mongodb';
import bcrypt from 'bcryptjs';
import { User, Roadmap, RoadmapStep } from './types';
import { STARTER_TEMPLATES } from './data/templates';

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isMongoConnected = false;

// Fallback in-memory/file-persisted DB if MONGODB_URI is not provided or unavailable
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface LocalDbSchema {
  users: User[];
  roadmaps: Roadmap[];
}

let localDb: LocalDbSchema = {
  users: [],
  roadmaps: []
};

function loadLocalDb(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      localDb = JSON.parse(data);
    } else {
      seedInitialLocalDb();
      saveLocalDb();
    }
  } catch (err) {
    console.error('Error loading local DB file:', err);
    seedInitialLocalDb();
  }
}

function saveLocalDb(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local DB file:', err);
  }
}

function seedInitialLocalDb() {
  const demoUserId = 'usr_demo_developer';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);

  const demoUser: User = {
    _id: demoUserId,
    name: 'Alex Rivera',
    email: 'demo@softwareengineer.dev',
    passwordHash,
    createdAt: new Date().toISOString()
  };

  localDb.users = [demoUser];

  // Seed starter roadmaps for demo user
  const initialRoadmaps: Roadmap[] = STARTER_TEMPLATES.slice(0, 3).map((template, idx) => ({
    _id: `rdm_${crypto.randomBytes(8).toString('hex')}`,
    userId: demoUserId,
    title: template.title,
    description: template.description,
    category: template.category,
    level: template.level,
    targetDate: new Date(Date.now() + (idx + 1) * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: template.tags,
    steps: template.steps.map((step, stepIdx) => ({
      ...step,
      id: `step_${stepIdx + 1}_${crypto.randomBytes(4).toString('hex')}`,
      updatedAt: new Date().toISOString()
    })),
    createdAt: new Date(Date.now() - (idx * 5 * 24 * 60 * 60 * 1000)).toISOString(),
    updatedAt: new Date().toISOString()
  }));

  localDb.roadmaps = initialRoadmaps;
}

export async function initDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (uri && uri.trim().length > 0) {
    try {
      console.log('Connecting to MongoDB at specified MONGODB_URI...');
      mongoClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 4000
      });
      await mongoClient.connect();
      mongoDb = mongoClient.db();
      isMongoConnected = true;
      console.log('Successfully connected to MongoDB database:', mongoDb.databaseName);

      // Initialize indexes
      await mongoDb.collection('users').createIndex({ email: 1 }, { unique: true });
      await mongoDb.collection('roadmaps').createIndex({ userId: 1 });

      // Check if demo user exists in Mongo, if not seed it
      const existingUser = await mongoDb.collection('users').findOne({ email: 'demo@softwareengineer.dev' });
      if (!existingUser) {
        console.log('Seeding demo user into MongoDB...');
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync('password123', salt);
        const demoUserId = 'usr_demo_developer';
        await mongoDb.collection('users').insertOne({
          _id: demoUserId as any,
          name: 'Alex Rivera',
          email: 'demo@softwareengineer.dev',
          passwordHash,
          createdAt: new Date().toISOString()
        });

        const initialRoadmaps = STARTER_TEMPLATES.slice(0, 3).map((template, idx) => ({
          _id: `rdm_${crypto.randomBytes(8).toString('hex')}` as any,
          userId: demoUserId,
          title: template.title,
          description: template.description,
          category: template.category,
          level: template.level,
          targetDate: new Date(Date.now() + (idx + 1) * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tags: template.tags,
          steps: template.steps.map((step, stepIdx) => ({
            ...step,
            id: `step_${stepIdx + 1}_${crypto.randomBytes(4).toString('hex')}`,
            updatedAt: new Date().toISOString()
          })),
          createdAt: new Date(Date.now() - (idx * 5 * 24 * 60 * 60 * 1000)).toISOString(),
          updatedAt: new Date().toISOString()
        }));

        await mongoDb.collection('roadmaps').insertMany(initialRoadmaps);
      }
      return;
    } catch (err) {
      console.warn('Could not connect to external MongoDB URI. Falling back to persistent local storage engine with full MongoDB compatibility.', err);
      isMongoConnected = false;
    }
  }

  // Fallback to local persistent JSON engine
  console.log('Running with persistent file-backed MongoDB-compatible storage engine (data/db.json).');
  loadLocalDb();
}

export const db = {
  isMongo(): boolean {
    return isMongoConnected && mongoDb !== null;
  },

  async findUserByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();
    if (this.isMongo() && mongoDb) {
      const u = await mongoDb.collection('users').findOne({ email: normalizedEmail });
      return u as unknown as User | null;
    }
    loadLocalDb();
    return localDb.users.find(u => u.email.toLowerCase() === normalizedEmail) || null;
  },

  async findUserById(id: string): Promise<User | null> {
    if (this.isMongo() && mongoDb) {
      const u = await mongoDb.collection('users').findOne({ _id: id as any });
      return u as unknown as User | null;
    }
    loadLocalDb();
    return localDb.users.find(u => u._id === id) || null;
  },

  async createUser(user: User): Promise<User> {
    user.email = user.email.toLowerCase().trim();
    if (this.isMongo() && mongoDb) {
      await mongoDb.collection('users').insertOne(user as any);
      return user;
    }
    loadLocalDb();
    localDb.users.push(user);
    saveLocalDb();
    return user;
  },

  async findRoadmapsByUserId(userId: string): Promise<Roadmap[]> {
    if (this.isMongo() && mongoDb) {
      const results = await mongoDb.collection('roadmaps').find({ userId }).toArray();
      return results as unknown as Roadmap[];
    }
    loadLocalDb();
    return localDb.roadmaps.filter(r => r.userId === userId);
  },

  async findRoadmapById(id: string, userId: string): Promise<Roadmap | null> {
    if (this.isMongo() && mongoDb) {
      const r = await mongoDb.collection('roadmaps').findOne({ _id: id as any, userId });
      return r as unknown as Roadmap | null;
    }
    loadLocalDb();
    return localDb.roadmaps.find(r => r._id === id && r.userId === userId) || null;
  },

  async createRoadmap(roadmap: Roadmap): Promise<Roadmap> {
    if (this.isMongo() && mongoDb) {
      await mongoDb.collection('roadmaps').insertOne(roadmap as any);
      return roadmap;
    }
    loadLocalDb();
    localDb.roadmaps.push(roadmap);
    saveLocalDb();
    return roadmap;
  },

  async updateRoadmap(id: string, userId: string, updateData: Partial<Roadmap>): Promise<Roadmap | null> {
    const updatedAt = new Date().toISOString();
    if (this.isMongo() && mongoDb) {
      const res = await mongoDb.collection('roadmaps').findOneAndUpdate(
        { _id: id as any, userId },
        { $set: { ...updateData, updatedAt } },
        { returnDocument: 'after' }
      );
      return res as unknown as Roadmap | null;
    }

    loadLocalDb();
    const index = localDb.roadmaps.findIndex(r => r._id === id && r.userId === userId);
    if (index === -1) return null;

    localDb.roadmaps[index] = {
      ...localDb.roadmaps[index],
      ...updateData,
      updatedAt
    };
    saveLocalDb();
    return localDb.roadmaps[index];
  },

  async deleteRoadmap(id: string, userId: string): Promise<boolean> {
    if (this.isMongo() && mongoDb) {
      const res = await mongoDb.collection('roadmaps').deleteOne({ _id: id as any, userId });
      return res.deletedCount > 0;
    }
    loadLocalDb();
    const beforeCount = localDb.roadmaps.length;
    localDb.roadmaps = localDb.roadmaps.filter(r => !(r._id === id && r.userId === userId));
    saveLocalDb();
    return localDb.roadmaps.length < beforeCount;
  }
};
