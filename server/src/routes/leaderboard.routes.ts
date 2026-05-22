import { Router, Response } from 'express';
import { DocumentModel } from '../models/Document.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import mongoose from 'mongoose';

const router = Router();

// GET /api/leaderboard — Top 10 users by completed AI-enhanced documents
router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const leaderboard = await DocumentModel.aggregate([
      // Only count completed documents (successfully AI-enhanced)
      { $match: { status: 'completed' } },

      // Group by userId and count
      {
        $group: {
          _id: '$userId',
          enhancedCount: { $sum: 1 },
        },
      },

      // Sort by count descending
      { $sort: { enhancedCount: -1 } },

      // Limit to top 10
      { $limit: 10 },

      // Join with User collection to get name
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },

      // Unwind user array (1-to-1)
      { $unwind: '$user' },

      // Project only needed fields
      {
        $project: {
          _id: 0,
          userId: '$_id',
          firstName: {
            $arrayElemAt: [{ $split: ['$user.name', ' '] }, 0],
          },
          enhancedCount: 1,
        },
      },
    ]);

    res.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

export default router;
