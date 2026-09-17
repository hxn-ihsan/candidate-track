import { MongoClient, Db, Collection, ServerApiVersion, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

// Load both .env.local and .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;
const dbName = process.env.MONGODB_DB || 'candidate_hiring_tracker';

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
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

export function resolveMongoUri(rawUri?: string): string | undefined {
  const candidate = rawUri || process.env.MONGODB_URI || process.env.MONGODB_URL;
  if (!candidate) return undefined;

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
 */
export async function getClient(): Promise<MongoClient> {
  const currentUri = resolveMongoUri();

  if (!currentUri || (!currentUri.startsWith('mongodb://') && !currentUri.startsWith('mongodb+srv://'))) {
    throw new Error('Unable to connect to the database. MONGODB_URI is not configured in environment variables.');
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR or tsx.
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
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
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
      clientPromise = client.connect();
    }
  }

  return clientPromise;
}

/**
 * Retrieves the candidate_hiring_tracker database instance.
 */
export async function getDb(): Promise<Db> {
  const currentDbName = process.env.MONGODB_DB || dbName;
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
  const currentDbName = process.env.MONGODB_DB || dbName;
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
    return {
      connected: false,
      databaseName: currentDbName,
      collectionName: 'candidates',
      error: err?.message || 'Unable to connect to the database.',
    };
  }
}
