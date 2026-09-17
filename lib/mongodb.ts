import { MongoClient, Db, Collection, ServerApiVersion, ObjectId } from 'mongodb';
import path from 'path';
import dotenv from 'dotenv';

// Ensure .env.local and .env are loaded from current working directory
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

export interface CandidateDocument {
  _id?: ObjectId;
  id?: string;
  fullName: string;
  email: string;
  phone?: string;
  position: string;
  location?: string;
  resumeUrl?: string;
  applicationDate: string;
  stage: 'Applied' | 'Interview' | 'Test' | 'Offer' | 'Accepted' | 'Rejected';
  rating: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _cachedMongoUri: string | undefined;
}

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;
let cachedUri: string | undefined;

/**
 * Validates and resolves the active MongoDB URI from environment variables.
 * Automatically cleans known copy-paste artifacts and warns on placeholder passwords.
 */
export function resolveMongoUri(rawUri?: string): string | undefined {
  const candidate = (rawUri || process.env.MONGODB_URI || process.env.MONGODB_URL || '').trim();
  if (!candidate) return undefined;

  // Check if placeholder password is still present
  if (candidate.includes('<db_password>') || candidate.includes('<password>')) {
    throw new Error('MONGODB_URI contains placeholder <db_password>. Please configure your actual password in .env.local.');
  }

  // Check if password has accidental username prefix repetition like '_db_user...'
  const match = candidate.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/);
  if (match) {
    const [, proto, user, pass, hostAndQuery] = match;
    // If password starts with _db_user and username is ..._db_user
    if (pass.startsWith('_db_user') && pass.length > '_db_user'.length && user.endsWith('_db_user')) {
      const trimmedPass = pass.slice('_db_user'.length);
      return `${proto}${user}:${encodeURIComponent(decodeURIComponent(trimmedPass))}@${hostAndQuery}`;
    }
  }

  return candidate;
}

/**
 * Returns a cached, connection-pooled MongoClient instance.
 * Reuses connections across requests to prevent exhausting database sockets.
 * Automatically cleans rejected promises so failed attempts can be retried immediately.
 */
export async function getClient(): Promise<MongoClient> {
  const currentUri = resolveMongoUri();

  if (!currentUri || (!currentUri.startsWith('mongodb://') && !currentUri.startsWith('mongodb+srv://'))) {
    throw new Error('Unable to connect to the database. MONGODB_URI is not configured in environment variables.');
  }

  if (process.env.NODE_ENV === 'development') {
    // If URI changed, discard previous connection pool
    if (global._cachedMongoUri !== currentUri) {
      global._mongoClientPromise = undefined;
      global._cachedMongoUri = currentUri;
    }

    if (!global._mongoClientPromise) {
      client = new MongoClient(currentUri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: false,
          deprecationErrors: true,
        },
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });

      const p = client.connect();
      // On connection rejection, clear cache so subsequent calls can retry
      p.catch(() => {
        global._mongoClientPromise = undefined;
      });
      global._mongoClientPromise = p;
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // Production mode
    if (cachedUri !== currentUri) {
      clientPromise = undefined;
      cachedUri = currentUri;
    }

    if (!clientPromise) {
      client = new MongoClient(currentUri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: false,
          deprecationErrors: true,
        },
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });

      const p = client.connect();
      // On connection rejection, clear cache so subsequent calls can retry
      p.catch(() => {
        clientPromise = undefined;
      });
      clientPromise = p;
    }
  }

  return clientPromise;
}

/**
 * Retrieves the candidate_hiring_tracker database instance.
 */
export async function getDb(): Promise<Db> {
  const currentDbName = process.env.MONGODB_DB || 'candidate_hiring_tracker';
  const connectedClient = await getClient();
  return connectedClient.db(currentDbName);
}

/**
 * Retrieves the 'candidates' collection directly from MongoDB.
 */
export async function getCandidatesCollection(): Promise<Collection<CandidateDocument>> {
  const db = await getDb();
  return db.collection<CandidateDocument>('candidates');
}

/**
 * Health check helper to verify live connection to MongoDB Atlas or server.
 */
export async function checkMongoConnection(): Promise<{
  connected: boolean;
  databaseName: string;
  collectionName: string;
  totalCandidates?: number;
  error?: string;
}> {
  const currentDbName = process.env.MONGODB_DB || 'candidate_hiring_tracker';
  try {
    const db = await getDb();
    // Run ping command to verify active connection
    await db.command({ ping: 1 });
    const col = db.collection<CandidateDocument>('candidates');
    const count = await col.countDocuments();
    return {
      connected: true,
      databaseName: currentDbName,
      collectionName: 'candidates',
      totalCandidates: count,
    };
  } catch (err: any) {
    const safeMsg = (err?.message || 'Unable to connect to the database.')
      .replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)@/g, '$1***@');
    return {
      connected: false,
      databaseName: currentDbName,
      collectionName: 'candidates',
      error: safeMsg,
    };
  }
}

