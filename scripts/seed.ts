import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { resolveMongoUri } from '../lib/mongodb.js';

// Load .env.local first, then fallback to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const rawUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
const uri = resolveMongoUri(rawUri);
const dbName = process.env.MONGODB_DB || 'candidate_hiring_tracker';

export const SEED_CANDIDATES = [
  {
    fullName: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    phone: '+1 (555) 234-5678',
    position: 'Senior Frontend Engineer',
    location: 'Austin, TX',
    resumeUrl: 'https://example.com/resumes/sarah-chen.pdf',
    applicationDate: '2026-03-01',
    stage: 'Applied',
    rating: 4,
    notes: 'Strong React and TypeScript background. Portfolio has excellent design and interaction details.',
    createdAt: new Date('2026-03-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-03-01T10:00:00Z').toISOString(),
  },
  {
    fullName: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    phone: '+1 (555) 345-6789',
    position: 'Staff Backend Architect',
    location: 'Seattle, WA',
    resumeUrl: 'https://example.com/resumes/marcus-vance.pdf',
    applicationDate: '2026-02-24',
    stage: 'Interview',
    rating: 5,
    notes: 'Passed technical screen with flying colors. Deep knowledge of distributed systems and MongoDB optimization.',
    createdAt: new Date('2026-02-24T14:30:00Z').toISOString(),
    updatedAt: new Date('2026-03-02T11:20:00Z').toISOString(),
  },
  {
    fullName: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    phone: '+1 (555) 456-7890',
    position: 'Lead Product Designer',
    location: 'New York, NY',
    resumeUrl: 'https://example.com/resumes/elena-rostova.pdf',
    applicationDate: '2026-02-20',
    stage: 'Test',
    rating: 4,
    notes: 'Submitted recruitment UX design challenge. Clean typography and intuitive candidate journey maps.',
    createdAt: new Date('2026-02-20T09:15:00Z').toISOString(),
    updatedAt: new Date('2026-03-03T16:45:00Z').toISOString(),
  },
  {
    fullName: 'David Kim',
    email: 'david.kim@example.com',
    phone: '+1 (555) 567-8901',
    position: 'DevOps & Cloud Engineer',
    location: 'San Francisco, CA',
    resumeUrl: 'https://example.com/resumes/david-kim.pdf',
    applicationDate: '2026-02-15',
    stage: 'Offer',
    rating: 5,
    notes: 'Offer package extended on March 2nd. Awaiting candidate decision by end of week.',
    createdAt: new Date('2026-02-15T11:00:00Z').toISOString(),
    updatedAt: new Date('2026-03-02T17:00:00Z').toISOString(),
  },
  {
    fullName: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+1 (555) 678-9012',
    position: 'Full Stack Engineer',
    location: 'Chicago, IL',
    resumeUrl: 'https://example.com/resumes/priya-patel.pdf',
    applicationDate: '2026-02-10',
    stage: 'Accepted',
    rating: 5,
    notes: 'Offer accepted! Starting date confirmed for April 1st. Onboarding documents sent.',
    createdAt: new Date('2026-02-10T08:30:00Z').toISOString(),
    updatedAt: new Date('2026-02-28T15:10:00Z').toISOString(),
  },
  {
    fullName: 'Lucas Silva',
    email: 'lucas.silva@example.com',
    phone: '+1 (555) 789-0123',
    position: 'QA Automation Engineer',
    location: 'Denver, CO',
    resumeUrl: 'https://example.com/resumes/lucas-silva.pdf',
    applicationDate: '2026-02-05',
    stage: 'Rejected',
    rating: 2,
    notes: 'Did not meet core requirements for automated Cypress testing. Sent polite decline email.',
    createdAt: new Date('2026-02-05T13:00:00Z').toISOString(),
    updatedAt: new Date('2026-02-18T10:00:00Z').toISOString(),
  },
];

async function seed() {
  console.log('Connecting to MongoDB...');
  console.log(`Database name: ${dbName}`);

  if (!uri) {
    console.error('Error: MONGODB_URI is not set in .env.local or environment variables.');
    console.error('Please configure MONGODB_URI with your MongoDB Atlas connection string.');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB successfully.');

    const db = client.db(dbName);
    const collection = db.collection('candidates');

    // Check whether the candidates collection already contains data
    const count = await collection.countDocuments();
    if (count > 0) {
      console.log(`The collection 'candidates' already contains ${count} records.`);
      console.log('Skipping seed to prevent inserting duplicate candidate records.');
      await client.close();
      return;
    }

    // Insert 6 fictional candidates
    console.log(`Inserting ${SEED_CANDIDATES.length} fictional candidates...`);
    const result = await collection.insertMany(SEED_CANDIDATES as any);
    console.log(`Successfully seeded ${result.insertedCount} candidates into MongoDB database '${dbName}'!`);

    await client.close();
  } catch (err: any) {
    console.error('Failed to seed MongoDB:', err?.message || err);
    process.exit(1);
  }
}

import { fileURLToPath } from 'url';

export { seed };

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  seed().catch((err) => {
    console.error('Fatal seed script error:', err);
    process.exit(1);
  });
}
