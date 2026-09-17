import { ObjectId } from 'mongodb';
import { 
  getCandidatesCollection, 
  checkMongoConnection, 
  CandidateDocument 
} from '../lib/mongodb.js';
import { Candidate, CandidateInput, HiringStage, HIRING_STAGES } from '../src/types.js';

// Helper to safely parse MongoDB ObjectId or fallback
function toMongoIdFilter(id: string) {
  if (ObjectId.isValid(id)) {
    return { _id: new ObjectId(id) };
  }
  // Fallback for custom string id if present
  return { id: id };
}

// Transform MongoDB document into the standard Candidate interface for the API
function formatCandidateDoc(doc: any): Candidate {
  return {
    id: doc._id ? doc._id.toString() : (doc.id || ''),
    fullName: doc.fullName || '',
    email: doc.email || '',
    phone: doc.phone || '',
    position: doc.position || '',
    location: doc.location || '',
    resumeUrl: doc.resumeUrl || '',
    applicationDate: doc.applicationDate || '',
    stage: doc.stage || 'Applied',
    rating: typeof doc.rating === 'number' ? doc.rating : 3,
    notes: doc.notes || '',
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
  };
}

export class CandidateDatabaseService {
  /**
   * Server-side validation for candidate payload.
   * Does NOT trust values sent by the browser.
   */
  public validateCandidateInput(
    input: Partial<CandidateInput>,
    isPartial: boolean = false
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Full Name
    if (!isPartial || input.fullName !== undefined) {
      if (!input.fullName || typeof input.fullName !== 'string' || input.fullName.trim().length === 0) {
        errors.push('Full name is required.');
      }
    }

    // Email
    if (!isPartial || input.email !== undefined) {
      if (!input.email || typeof input.email !== 'string' || input.email.trim().length === 0) {
        errors.push('Email is required.');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email.trim())) {
          errors.push('Email must have a valid format (e.g. name@example.com).');
        }
      }
    }

    // Position
    if (!isPartial || input.position !== undefined) {
      if (!input.position || typeof input.position !== 'string' || input.position.trim().length === 0) {
        errors.push('Position applied for is required.');
      }
    }

    // Application Date
    if (!isPartial || input.applicationDate !== undefined) {
      if (!input.applicationDate || typeof input.applicationDate !== 'string' || input.applicationDate.trim().length === 0) {
        errors.push('Application date is required.');
      }
    }

    // Hiring Stage
    if (input.stage !== undefined) {
      if (!HIRING_STAGES.includes(input.stage as HiringStage)) {
        errors.push(`Hiring stage must be one of: ${HIRING_STAGES.join(', ')}.`);
      }
    }

    // Rating
    if (input.rating !== undefined && input.rating !== null) {
      const num = Number(input.rating);
      if (!Number.isInteger(num) || num < 1 || num > 5) {
        errors.push('Rating must be an integer from 1 to 5.');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Retrieve all candidates from MongoDB matching optional query filters.
   */
  public async getCandidates(filters?: {
    search?: string;
    stage?: string;
    position?: string;
    rating?: string;
  }): Promise<Candidate[]> {
    const collection = await getCandidatesCollection();

    const query: any = {};

    if (filters?.stage && filters.stage !== 'all') {
      query.stage = filters.stage;
    }

    if (filters?.rating && filters.rating !== 'all') {
      query.rating = Number(filters.rating);
    }

    if (filters?.position && filters.position !== 'all') {
      query.position = { $regex: filters.position, $options: 'i' };
    }

    if (filters?.search && filters.search.trim()) {
      const s = filters.search.trim();
      query.$or = [
        { fullName: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { position: { $regex: s, $options: 'i' } },
      ];
    }

    const docs = await collection.find(query).sort({ updatedAt: -1 }).toArray();
    return docs.map(formatCandidateDoc);
  }

  /**
   * Retrieve single candidate by ID from MongoDB.
   */
  public async getCandidateById(id: string): Promise<Candidate | null> {
    const collection = await getCandidatesCollection();
    const filter = toMongoIdFilter(id);
    const doc = await collection.findOne(filter as any);
    if (!doc) return null;
    return formatCandidateDoc(doc);
  }

  /**
   * Create a new candidate in MongoDB.
   */
  public async createCandidate(input: CandidateInput): Promise<Candidate> {
    const validation = this.validateCandidateInput(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join(' '));
    }

    const collection = await getCandidatesCollection();
    const now = new Date().toISOString();

    const newDoc: CandidateDocument = {
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone ? input.phone.trim() : '',
      position: input.position.trim(),
      location: input.location ? input.location.trim() : '',
      resumeUrl: input.resumeUrl ? input.resumeUrl.trim() : '',
      applicationDate: input.applicationDate ? input.applicationDate.trim() : now.split('T')[0],
      stage: input.stage || 'Applied',
      rating: Math.max(1, Math.min(5, Math.floor(Number(input.rating) || 3))),
      notes: input.notes ? input.notes.trim() : '',
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(newDoc as any);
    return formatCandidateDoc({
      _id: result.insertedId,
      ...newDoc,
    });
  }

  /**
   * Update an existing candidate in MongoDB.
   */
  public async updateCandidate(id: string, updates: Partial<CandidateInput>): Promise<Candidate> {
    const validation = this.validateCandidateInput(updates, true);
    if (!validation.valid) {
      throw new Error(validation.errors.join(' '));
    }

    const collection = await getCandidatesCollection();
    const filter = toMongoIdFilter(id);

    const existing = await collection.findOne(filter as any);
    if (!existing) {
      throw new Error('Candidate not found.');
    }

    const updatedFields: any = {
      updatedAt: new Date().toISOString(),
    };

    if (updates.fullName !== undefined) updatedFields.fullName = updates.fullName.trim();
    if (updates.email !== undefined) updatedFields.email = updates.email.trim().toLowerCase();
    if (updates.phone !== undefined) updatedFields.phone = updates.phone.trim();
    if (updates.position !== undefined) updatedFields.position = updates.position.trim();
    if (updates.location !== undefined) updatedFields.location = updates.location.trim();
    if (updates.resumeUrl !== undefined) updatedFields.resumeUrl = updates.resumeUrl.trim();
    if (updates.applicationDate !== undefined) updatedFields.applicationDate = updates.applicationDate.trim();
    if (updates.stage !== undefined) updatedFields.stage = updates.stage;
    if (updates.rating !== undefined) updatedFields.rating = Math.max(1, Math.min(5, Math.floor(Number(updates.rating))));
    if (updates.notes !== undefined) updatedFields.notes = updates.notes.trim();

    await collection.updateOne(filter as any, { $set: updatedFields });

    const updatedDoc = await collection.findOne(filter as any);
    if (!updatedDoc) {
      throw new Error('Failed to retrieve candidate after update.');
    }

    return formatCandidateDoc(updatedDoc);
  }

  /**
   * Update stage in MongoDB.
   */
  public async updateStage(id: string, stage: HiringStage): Promise<Candidate> {
    if (!HIRING_STAGES.includes(stage)) {
      throw new Error(`Invalid stage: ${stage}. Must be one of: ${HIRING_STAGES.join(', ')}.`);
    }
    return this.updateCandidate(id, { stage });
  }

  /**
   * Update rating in MongoDB.
   */
  public async updateRating(id: string, rating: number): Promise<Candidate> {
    const num = Number(rating);
    if (!Number.isInteger(num) || num < 1 || num > 5) {
      throw new Error('Rating must be an integer from 1 to 5.');
    }
    return this.updateCandidate(id, { rating: num });
  }

  /**
   * Update notes in MongoDB.
   */
  public async updateNotes(id: string, notes: string): Promise<Candidate> {
    return this.updateCandidate(id, { notes: String(notes) });
  }

  /**
   * Delete a candidate from MongoDB.
   */
  public async deleteCandidate(id: string): Promise<{ success: boolean }> {
    const collection = await getCandidatesCollection();
    const filter = toMongoIdFilter(id);

    const result = await collection.deleteOne(filter as any);
    if (result.deletedCount === 0) {
      throw new Error('Candidate not found.');
    }

    return { success: true };
  }

  /**
   * Check connection status to MongoDB.
   */
  public async getStatus() {
    return checkMongoConnection();
  }
}

export const dbInstance = new CandidateDatabaseService();
