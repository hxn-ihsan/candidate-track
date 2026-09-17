import { Router, Request, Response } from 'express';
import { dbInstance } from './db.js';
import { CandidateInput, HiringStage } from '../src/types.js';

export const apiRouter = Router();

// Helper to sanitize any connection strings containing credentials
function sanitizeError(err: any): string {
  const str = String(err?.message || err || '');
  return str.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)@/g, '$1***@');
}

// Helper to determine if an error is a database connection issue
function isDbConnectionError(err: any): boolean {
  const msg = (err?.message || '').toLowerCase();
  return (
    msg.includes('unable to connect to the database') ||
    msg.includes('mongodb_uri is not configured') ||
    msg.includes('placeholder <db_password>') ||
    msg.includes('server selection timed out') ||
    msg.includes('connecteconrefused') ||
    msg.includes('enotfound') ||
    msg.includes('topology was destroyed') ||
    msg.includes('authentication failed') ||
    msg.includes('bad auth')
  );
}

// GET /api/candidates
apiRouter.get('/candidates', async (req: Request, res: Response) => {
  try {
    const { search, stage, position, rating } = req.query;
    const candidates = await dbInstance.getCandidates({
      search: search ? String(search) : undefined,
      stage: stage ? String(stage) : undefined,
      position: position ? String(position) : undefined,
      rating: rating ? String(rating) : undefined,
    });
    res.json({ success: true, data: candidates });
  } catch (error: any) {
    if (isDbConnectionError(error)) {
      console.warn('MongoDB connection unavailable:', sanitizeError(error));
      return res.status(503).json({
        success: false,
        error: 'Unable to connect to the database.',
        message: 'MongoDB is unavailable or MONGODB_URI is not configured. Please configure MONGODB_URI in .env.local or environment variables.',
        databaseConnected: false,
      });
    }
    console.error('Error fetching candidates:', sanitizeError(error));
    res.status(500).json({ success: false, error: sanitizeError(error) || 'Failed to retrieve candidates' });
  }
});

// GET /api/candidates/:id
apiRouter.get('/candidates/:id', async (req: Request, res: Response) => {
  try {
    const candidate = await dbInstance.getCandidateById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    res.json({ success: true, data: candidate });
  } catch (error: any) {
    if (isDbConnectionError(error)) {
      return res.status(503).json({
        success: false,
        error: 'Unable to connect to the database.',
        databaseConnected: false,
      });
    }
    res.status(500).json({ success: false, error: error.message || 'Failed to get candidate' });
  }
});

// POST /api/candidates
apiRouter.post('/candidates', async (req: Request, res: Response) => {
  try {
    const input: CandidateInput = req.body;
    const validation = dbInstance.validateCandidateInput(input);
    if (!validation.valid) {
      return res.status(400).json({ success: false, errors: validation.errors, error: validation.errors.join(' ') });
    }

    const created = await dbInstance.createCandidate(input);
    res.status(201).json({ success: true, data: created, message: 'Candidate created in MongoDB successfully' });
  } catch (error: any) {
    if (isDbConnectionError(error)) {
      console.warn('MongoDB connection unavailable on create:', error?.message || error);
      return res.status(503).json({
        success: false,
        error: 'Unable to connect to the database.',
        message: 'Could not create candidate: MongoDB connection is unavailable.',
        databaseConnected: false,
      });
    }
    console.error('Error creating candidate:', error?.message || error);
    res.status(400).json({ success: false, error: error.message || 'Failed to add candidate' });
  }
});

// PUT /api/candidates/:id
apiRouter.put('/candidates/:id', async (req: Request, res: Response) => {
  try {
    const input: Partial<CandidateInput> = req.body;
    const updated = await dbInstance.updateCandidate(req.params.id, input);
    res.json({ success: true, data: updated, message: 'Candidate updated in MongoDB successfully' });
  } catch (error: any) {
    if (isDbConnectionError(error)) {
      console.warn('MongoDB connection unavailable on update:', error?.message || error);
      return res.status(503).json({
        success: false,
        error: 'Unable to connect to the database.',
        databaseConnected: false,
      });
    }
    console.error('Error updating candidate:', error?.message || error);
    if (error.message === 'Candidate not found.') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(400).json({ success: false, error: error.message || 'Failed to update candidate' });
  }
});

// PATCH /api/candidates/:id/stage
apiRouter.patch('/candidates/:id/stage', async (req: Request, res: Response) => {
  try {
    const { stage } = req.body;
    if (!stage) {
      return res.status(400).json({ success: false, error: 'Stage is required' });
    }
    const updated = await dbInstance.updateStage(req.params.id, stage as HiringStage);
    res.json({ success: true, data: updated, message: `Stage updated to ${stage}` });
  } catch (error: any) {
    if (isDbConnectionError(error)) {
      return res.status(503).json({
        success: false,
        error: 'Unable to connect to the database.',
        databaseConnected: false,
      });
    }
    if (error.message === 'Candidate not found.') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(400).json({ success: false, error: error.message || 'Failed to update stage' });
  }
});

// PATCH /api/candidates/:id/rating
apiRouter.patch('/candidates/:id/rating', async (req: Request, res: Response) => {
  try {
    const { rating } = req.body;
    if (rating === undefined || rating === null) {
      return res.status(400).json({ success: false, error: 'Rating is required' });
    }
    const updated = await dbInstance.updateRating(req.params.id, Number(rating));
    res.json({ success: true, data: updated, message: 'Rating updated' });
  } catch (error: any) {
    if (isDbConnectionError(error)) {
      return res.status(503).json({
        success: false,
        error: 'Unable to connect to the database.',
        databaseConnected: false,
      });
    }
    if (error.message === 'Candidate not found.') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(400).json({ success: false, error: error.message || 'Failed to update rating' });
  }
});

// PATCH /api/candidates/:id/notes
apiRouter.patch('/candidates/:id/notes', async (req: Request, res: Response) => {
  try {
    const { notes } = req.body;
    const updated = await dbInstance.updateNotes(req.params.id, notes !== undefined ? String(notes) : '');
    res.json({ success: true, data: updated, message: 'Notes saved' });
  } catch (error: any) {
    if (isDbConnectionError(error)) {
      return res.status(503).json({
        success: false,
        error: 'Unable to connect to the database.',
        databaseConnected: false,
      });
    }
    if (error.message === 'Candidate not found.') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(400).json({ success: false, error: error.message || 'Failed to update notes' });
  }
});

// DELETE /api/candidates/:id
apiRouter.delete('/candidates/:id', async (req: Request, res: Response) => {
  try {
    await dbInstance.deleteCandidate(req.params.id);
    res.json({ success: true, message: 'Candidate deleted from MongoDB successfully' });
  } catch (error: any) {
    if (isDbConnectionError(error)) {
      console.warn('MongoDB connection unavailable on delete:', error?.message || error);
      return res.status(503).json({
        success: false,
        error: 'Unable to connect to the database.',
        databaseConnected: false,
      });
    }
    console.error('Error deleting candidate:', error?.message || error);
    if (error.message === 'Candidate not found.') {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(400).json({ success: false, error: error.message || 'Failed to delete candidate' });
  }
});

// GET /api/status - Live MongoDB status check
apiRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await dbInstance.getStatus();
    if (status.connected) {
      res.json({ success: true, data: status });
    } else {
      res.status(503).json({ success: false, data: status, error: status.error || 'Unable to connect to the database.' });
    }
  } catch (error: any) {
    res.status(503).json({
      success: false,
      data: { connected: false, error: error.message || 'Unable to connect to the database.' },
      error: 'Unable to connect to the database.',
    });
  }
});
